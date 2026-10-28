import "./globals.css";
import { CartProvider, Header } from "@/components/Cart";
export const metadata = { title: "Seiszn – Women's western wear", description: "Women's western tops and dresses with exact measurements. Shipped across India." };
export default function Layout({ children }) {
  return (
    <html lang="en"><body><CartProvider>
      <Header />
      <main className="wrap">{children}</main>
      <footer className="wrap foot">Seiszn · seiszn.in · Secure payments by Razorpay · Delivery by Shiprocket</footer>
    </CartProvider></body></html>
  );
}
