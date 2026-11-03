import Link from "next/link";
import Logo from "./Logo";
const COLS = [
  ["Shop", [["All pieces", "/shop"], ["Dresses", "/shop?c=dress"], ["Tops & tunics", "/shop?c=top"], ["Co-ord sets", "/shop?c=coord"]]],
  ["Help", [["Track your order", "/track"], ["Contact us", "/contact"], ["Shipping", "/policies/shipping"], ["Returns and refunds", "/policies/returns"]]],
  ["Legal", [["Privacy policy", "/policies/privacy"], ["Terms of service", "/policies/terms"]]],
];
export default function Footer() {
  return (
    <footer className="foot"><div className="w">
      <div className="foot-grid">
        <div><Logo light height={44} /><p className="foot-about">Small-batch women’s western wear with exact measurements on every piece. Shipped across India.</p>
          <a className="btn alt" href="https://www.instagram.com/Seiszn.in" style={{ fontSize: 16, padding: "12px 22px", boxShadow: "none" }}>Follow @Seiszn.in</a></div>
        {COLS.map(([h, ls]) => <nav key={h} aria-label={h}><h3>{h}</h3>{ls.map(([n, u]) => <Link key={u} href={u}>{n}</Link>)}</nav>)}
      </div>
      <div className="foot-row"><span>© {new Date().getFullYear()} Seiszn · seiszn.in</span><span>Secure payments by Razorpay · Delivery by Shiprocket</span></div>
    </div></footer>
  );
}
