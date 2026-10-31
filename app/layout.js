import { Unbounded, Figtree } from 'next/font/google';
import './globals.css';
import CartProvider from '../components/CartProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
const display = Unbounded({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-display' });
const body = Figtree({ subsets: ['latin'], weight: ['400', '600', '800'], variable: '--font-body' });
export const metadata = { title: 'Seiszn – Women’s western wear', description: 'Small-batch western wear with exact measurements on every piece. Shipped across India.' };
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body><CartProvider><Header />{children}<Footer /></CartProvider></body>
    </html>
  );
}
