import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export default function InstagramContentPage() {
  requireAdmin();
  redirect("/admin/instagram/inbox");
}
