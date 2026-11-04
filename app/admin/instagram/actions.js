"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { admin } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const UUID = /^[0-9a-f-]{36}$/i;
const field = (fd, name, max = 300) => String(fd.get(name) || "").trim().slice(0, max);
const go = (path, message) => redirect(`${path}?m=${encodeURIComponent(message)}`);

export async function createInstagramDraft(fd) {
  requireAdmin();
  const contentType = field(fd, "content_type", 20);
  const caption = field(fd, "caption", 2200);
  const hashtags = field(fd, "hashtags", 1000);
  const mediaUrl = field(fd, "media_url", 1000);

  if (!["post", "reel", "story"].includes(contentType)) go("/admin/instagram/content", "Choose a valid content type.");
  if (!caption && !mediaUrl) go("/admin/instagram/content", "Add a caption or media URL before saving.");
  if (mediaUrl) {
    try {
      const url = new URL(mediaUrl);
      if (url.protocol !== "https:") throw new Error("https required");
    } catch {
      go("/admin/instagram/content", "Media URL must be a valid HTTPS link.");
    }
  }

  const { error } = await admin().from("instagram_content").insert({
    content_type: contentType,
    caption: caption || null,
    hashtags: hashtags || null,
    media_url: mediaUrl || null,
    status: "draft",
  });
  if (error) go("/admin/instagram/content", "Could not save draft: " + error.message.slice(0, 160));
  revalidatePath("/admin/instagram");
  revalidatePath("/admin/instagram/content");
  go("/admin/instagram/content", "Draft saved. It has not been published.");
}

export async function setInstagramContentStatus(fd) {
  requireAdmin();
  const id = field(fd, "id", 36);
  const status = field(fd, "status", 30);
  if (!UUID.test(id) || !["draft", "pending_approval", "approved", "rejected"].includes(status)) {
    go("/admin/instagram/content", "Invalid content update.");
  }

  const patch = {
    status,
    approved_at: status === "approved" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin().from("instagram_content").update(patch).eq("id", id);
  if (error) go("/admin/instagram/content", "Could not update draft: " + error.message.slice(0, 160));
  revalidatePath("/admin/instagram");
  revalidatePath("/admin/instagram/content");
  go("/admin/instagram/content", "Content status updated. Publishing remains disabled.");
}

export async function updateInstagramConversation(fd) {
  requireAdmin();
  const id = field(fd, "id", 36);
  const status = field(fd, "status", 20);
  const needsHuman = field(fd, "needs_human", 1) === "1";
  if (!UUID.test(id) || !["open", "waiting", "resolved"].includes(status)) {
    go("/admin/instagram/inbox", "Invalid conversation update.");
  }

  const { error } = await admin().from("instagram_conversations").update({
    status,
    needs_human: needsHuman,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) go("/admin/instagram/inbox", "Could not update conversation: " + error.message.slice(0, 160));
  revalidatePath("/admin/instagram");
  revalidatePath("/admin/instagram/inbox");
  go("/admin/instagram/inbox", "Conversation updated.");
}
