import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

function safeJson(text) {
  const cleaned = String(text || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch { return null; }
}

export async function POST(request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_AI_TOKEN;
  if (!accountId || !token) {
    return NextResponse.json({ error: "Cloudflare Workers AI is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_TOKEN to the Preview environment." }, { status: 503 });
  }

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const conversationId = String(body?.conversationId || "");
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });

  const db = admin();
  const [{ data: conversation, error: conversationError }, { data: messages, error: messagesError }, { data: products, error: productsError }] = await Promise.all([
    db.from("instagram_conversations").select("id,platform_user_id,username,needs_human,status").eq("id", conversationId).maybeSingle(),
    db.from("instagram_messages").select("direction,message_text,created_at").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(12),
    db.from("products").select("title,description,type,active,variants(color,size,price,stock)").eq("active", true).order("sort_order").limit(40),
  ]);
  if (conversationError || messagesError || productsError) return NextResponse.json({ error: "Could not load the conversation or store catalogue." }, { status: 500 });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  if (conversation.needs_human) return NextResponse.json({ error: "This conversation is assigned to a human. Clear the handoff before generating an AI reply." }, { status: 409 });

  const history = (messages || []).reverse().map((m) => ({ role: m.direction === "inbound" ? "Customer" : "SEISZN", text: m.message_text })).filter((m) => m.text);
  const catalogue = (products || []).map((p) => ({
    product: p.title, category: p.type, description: p.description,
    variants: (p.variants || []).map((v) => ({ color: v.color, size: v.size, price_inr: v.price, stock: v.stock })),
  }));
  const system = `You are SEISZN's senior Instagram customer-care agent for an Indian clothing store.
Write warm, concise, natural customer service replies. Understand English, Tamil and Tanglish; reply in the customer's language.
Use ONLY the supplied catalogue and conversation facts. Never invent prices, sizes, stock, delivery dates, policies, discounts, or order status. If a requested fact is absent, say you will check and escalate.
Escalate complaints, refunds/returns disputes, payment problems, damaged/wrong items, angry customers, personal-data requests, order-specific questions, and anything uncertain. Do not ask for card details, passwords, OTPs or full payment credentials.
For order tracking, ask the customer to share only their order number through a secure official channel; do not reveal order data based on an Instagram handle.
Return ONLY valid JSON: {"reply":"customer-facing response","confidence":0.0,"intent":"short intent label","escalate":false,"reason":"short internal reason"}.
Set escalate=true when a human must take over. Confidence must be between 0 and 1. Keep the reply under 500 characters.`;
  const user = JSON.stringify({ conversation: history, current_customer_message: history.filter((m) => m.role === "Customer").at(-1)?.text || "", live_product_catalogue: catalogue });
  let result;
  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "system", content: system }, { role: "user", content: user }], max_tokens: 450, temperature: 0.25 }),
      signal: AbortSignal.timeout(25000),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.errors?.[0]?.message || "AI provider request failed.");
    result = safeJson(payload.result?.response);
  } catch (error) {
    console.error("SEISZN Instagram AI failed:", error);
    return NextResponse.json({ error: "AI reply generation failed. Check Cloudflare token, model access and usage limits." }, { status: 502 });
  }
  const reply = typeof result?.reply === "string" ? result.reply.trim().slice(0, 1000) : "";
  const confidence = Number(result?.confidence);
  const escalate = result?.escalate === true || !reply || !Number.isFinite(confidence) || confidence < 0.78;
  if (!reply) return NextResponse.json({ error: "AI returned an invalid reply. Please handle this conversation manually." }, { status: 502 });

  const { error: saveError } = await db.from("instagram_messages").insert({
    conversation_id: conversationId, direction: "outbound", message_text: reply,
    delivery_status: "draft", ai_generated: true,
  });
  if (saveError) return NextResponse.json({ error: "Could not save the AI reply draft." }, { status: 500 });
  if (escalate) {
    await db.from("instagram_conversations").update({ needs_human: true, status: "open", updated_at: new Date().toISOString() }).eq("id", conversationId);
  }
  return NextResponse.json({ reply, confidence: Number.isFinite(confidence) ? confidence : 0, intent: String(result?.intent || "customer support"), escalate, reason: String(result?.reason || "") });
}
