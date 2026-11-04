import crypto from "crypto";
import { NextResponse } from "next/server";
import { admin } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 15;

function verifySignature(rawBody, signature, appSecret) {
  if (!signature || !appSecret || !signature.startsWith("sha256=")) return false;
  const received = Buffer.from(signature.slice(7), "hex");
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest();
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function eventIdFor(message, entry, index) {
  if (message.mid) return `instagram-message:${message.mid}`;
  const stable = JSON.stringify({ entryId: entry.id, timestamp: message.timestamp, sender: message.sender?.id, message });
  return `instagram-event:${crypto.createHash("sha256").update(stable).digest("hex")}`;
}

async function saveInboundMessage(db, message, entry, index, rawEvent) {
  // Echoes are messages sent by the business account, not customer messages.
  if (message?.message?.is_echo || !message?.sender?.id || !message?.recipient?.id) return;

  const payload = message.message || {};
  const text = typeof payload.text === "string"
    ? payload.text.slice(0, 4000)
    : payload.attachments?.length
      ? "[Customer sent an attachment]"
      : payload.share
        ? "[Customer shared content]"
        : null;
  if (!text) return;

  const platformMessageId = payload.mid || null;
  const eventId = eventIdFor(payload, entry, index);
  const eventType = "instagram.message";
  const { error: eventError } = await db
    .from("instagram_webhook_events")
    .insert({ event_id: eventId, event_type: eventType, payload: rawEvent });
  if (eventError && eventError.code !== "23505") throw eventError;

  if (eventError?.code === "23505") {
    const { data: existing, error: lookupError } = await db
      .from("instagram_webhook_events")
      .select("processed_at")
      .eq("event_id", eventId)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing?.processed_at) return;
  }

  const sentAt = Number(message.timestamp);
  const messageAt = Number.isFinite(sentAt) && sentAt > 0
    ? new Date(sentAt).toISOString()
    : new Date().toISOString();

  const { data: conversation, error: conversationError } = await db
    .from("instagram_conversations")
    .upsert({
      platform_user_id: String(message.sender.id),
      last_message: text,
      last_message_at: messageAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: "platform_user_id" })
    .select("id")
    .single();
  if (conversationError) throw conversationError;

  if (platformMessageId) {
    const { error: messageError } = await db
      .from("instagram_messages")
      .upsert({
        conversation_id: conversation.id,
        platform_message_id: String(platformMessageId),
        direction: "inbound",
        message_text: text,
        delivery_status: "received",
        ai_generated: false,
        created_at: messageAt,
      }, { onConflict: "platform_message_id", ignoreDuplicates: true });
    if (messageError) throw messageError;
  } else {
    const { error: messageError } = await db
      .from("instagram_messages")
      .insert({
        conversation_id: conversation.id,
        direction: "inbound",
        message_text: text,
        delivery_status: "received",
        ai_generated: false,
        created_at: messageAt,
      });
    if (messageError) throw messageError;
  }

  const { error: processedError } = await db
    .from("instagram_webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("event_id", eventId);
  if (processedError) throw processedError;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && expectedToken && token === expectedToken && challenge) {
    return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  }
  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request) {
  const rawBody = await request.text();
  const appSecret = process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET;
  const signature = request.headers.get("x-hub-signature-256");

  if (!appSecret) {
    return NextResponse.json({ error: "Instagram webhook is not configured" }, { status: 503 });
  }
  if (!verifySignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.object !== "instagram" || !Array.isArray(body.entry)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const db = admin();
    for (const entry of body.entry) {
      const messages = Array.isArray(entry.messaging) ? entry.messaging : [];
      for (let index = 0; index < messages.length; index += 1) {
        await saveInboundMessage(db, messages[index], entry, index, {
          object: body.object,
          entry: [{ id: entry.id, time: entry.time, messaging: [messages[index]] }],
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Instagram webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
