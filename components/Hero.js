"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Sketch from "./Sketch";
// Drop your video at public/videos/hero.mp4 (and optional poster public/videos/hero-poster.jpg),
// or set NEXT_PUBLIC_HERO_VIDEO to a video URL. Without a video the hero shows the sketch graphic.
const SRC = process.env.NEXT_PUBLIC_HERO_VIDEO || "/videos/hero.mp4";
export default function Hero() {
  const ref = useRef(null);
  const [ok, setOk] = useState(true);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) v?.pause();
    const t = setTimeout(() => { if (v && (v.error || v.networkState === 3)) setOk(false); }, 1500);
    return () => clearTimeout(t);
  }, []);
  const toggle = () => { const v = ref.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); };
  return (
    <section className="w hero-wrap"><div className={`hero2 ${ok ? "" : "fb"}`}>
      {ok ? <video ref={ref} className="hero-vid" src={SRC} poster="/videos/hero-poster.jpg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" onError={() => setOk(false)} />
        : <div className="hero-fb"><Sketch kind="dress" fill="#fff" labels /></div>}
      {ok && <div className="hero-shade" />}
      <div className="hero-copy">
        <p className="eyebrow">New season, small batches</p>
        <h1>Pieces you won’t find twice.</h1>
        <p className="sub">Western wear with the real numbers listed, so you can order without guessing your size.</p>
        <div className="links" style={{ gap: 16 }}><Link className="btn alt" href="/shop">Shop new drops</Link><a className="btn" href="https://www.instagram.com/Seiszn.in">Watch on Instagram</a></div>
      </div>
      {ok && <button className="pill snd" onClick={toggle} aria-label={muted ? "Turn sound on" : "Turn sound off"}>{muted ? "Sound off" : "Sound on"}</button>}
    </div></section>
  );
}
