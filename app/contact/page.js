export const metadata = { title: "Contact – Seiszn" };
export default function Contact() {
  return (
    <main className="w" style={{ paddingTop: 40, maxWidth: 820 }}>
      <h1 style={{ fontSize: "clamp(36px,5vw,72px)", marginBottom: 28 }}>Contact us</h1>
      <div className="box" style={{ background: "var(--lime)", marginBottom: 16 }}><h2 style={{ fontSize: 22, marginBottom: 10 }}>Fastest: Instagram</h2><p style={{ margin: "0 0 16px" }}>Send us a message with your order number and we will reply there.</p><a className="btn" href="https://www.instagram.com/Seiszn.in">Message @Seiszn.in</a></div>
      <div className="box"><h2 style={{ fontSize: 22, marginBottom: 10 }}>Other ways</h2><p style={{ margin: 0 }}>Email: [ADD]<br />Phone or WhatsApp: [ADD]<br />Business address: [ADD]</p></div>
    </main>
  );
}
