import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import ClientThemeProvider from './client-theme-provider';
import { RestaurantDialogProvider } from '@/context/RestaurantDialogContext'
import { UserProvider } from '@/contexts/UserContext';
import FloatingCart from '@/components/FloatingCart';
import CartAuthSync from '@/components/CartAuthSync';
import NoSSR from '@/components/NoSSR';

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
  display: 'swap', // ป้องกัน FOUT
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
});

export const metadata: Metadata = {
  title: "AriFood - Food Delivery",
  description: "อาหารดีๆ ส่งถึงบ้าน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="emotion-insertion-point" id="emotion-insertion-point" />
      </head>
      <body className={prompt.className}>
        <NoSSR fallback={<div>Loading...</div>}>
          <ClientThemeProvider>
            <UserProvider>
              <RestaurantDialogProvider>
                <CartAuthSync />
                {children}
                <FloatingCart />
              </RestaurantDialogProvider>
            </UserProvider>
          </ClientThemeProvider>
        </NoSSR>
      </body>
    </html>
  );
}
