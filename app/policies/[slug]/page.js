import { notFound } from "next/navigation";
import { POLICIES } from "@/lib/policies";
export function generateStaticParams() { return Object.keys(POLICIES).map((slug) => ({ slug })); }
export function generateMetadata({ params }) { const p = POLICIES[params.slug]; return { title: p ? `${p.title} – Seiszn` : "Seiszn" }; }
export default function Policy({ params }) {
  const p = POLICIES[params.slug];
  if (!p) notFound();
  return (
    <main className="w" style={{ paddingTop: 40, maxWidth: 820 }}>
      <h1 style={{ fontSize: "clamp(36px,5vw,72px)", marginBottom: 28 }}>{p.title}</h1>
      {p.sections.map(([h, t]) => <section key={h} className="box" style={{ marginBottom: 16 }}><h2 style={{ fontSize: 22, marginBottom: 10 }}>{h}</h2><p style={{ margin: 0, lineHeight: 1.6 }}>{t}</p></section>)}
    </main>
  );
}
