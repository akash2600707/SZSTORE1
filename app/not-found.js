import Link from "next/link";
export default function NotFound() {
  return <main className="w" style={{ padding: "64px 0" }}><h1 style={{ fontSize: "clamp(44px,8vw,110px)" }}>That page left the building.</h1><p style={{ fontSize: 20, margin: "20px 0 28px" }}>We could not find what you were looking for.</p><Link className="btn" href="/shop">Back to the shop</Link></main>;
}
