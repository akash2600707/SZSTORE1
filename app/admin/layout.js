import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { logout } from "./actions";
export const metadata = { title: "Admin – Seiszn", robots: { index: false, follow: false } };
export default function AdminLayout({ children }) {
  const on = isAdmin();
  return (
    <div className="w admin">
      {on && <div className="adminbar"><nav className="links" aria-label="Admin"><Link className="pill" href="/admin">Orders</Link><Link className="pill" href="/admin/inventory">Inventory</Link></nav><form action={logout}><button className="pill">Sign out</button></form></div>}
      {children}
    </div>
  );
}
