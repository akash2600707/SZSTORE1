"use client";
import { useEffect, useRef, useState } from "react";
// Put your wordmark at public/logo-wordmark.png (black on transparent). Falls back to text if missing.
export default function Logo({ light = false, height = 38 }) {
  const ref = useRef(null);
  const [bad, setBad] = useState(false);
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setBad(true); }, []);
  if (bad) return <span className="logo" style={light ? { color: "var(--lime)" } : undefined}>SEISZN</span>;
  return <img ref={ref} src="/logo-wordmark.png" alt="Seiszn" style={{ height, width: "auto", display: "block", filter: light ? "invert(1)" : undefined }} onError={() => setBad(true)} />;
}
