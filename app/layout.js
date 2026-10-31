import './globals.css';
import CartProvider from '../components/CartProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Seiszn – Women’s western wear',
  description: 'Small-batch western wear with exact measurements on every piece. Shipped across India.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&family=Figtree:wght@400;600;800&display=swap"
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
