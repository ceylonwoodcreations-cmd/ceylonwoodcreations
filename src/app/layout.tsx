import type { Metadata } from 'next';
import { Playfair_Display, Noto_Sans_Sinhala } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['600', '700', '800'],
  display: 'swap',
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  variable: '--font-noto-sinhala',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ceylon Wood Creations | ශ්‍රී ලාංකීය ලී කැටයම් කලාව',
  description: 'Authentic handcrafted Sri Lankan wood carvings, traditional statues, wall art and custom wooden creations.',
  keywords: ['Wood Art', 'Wood Carving Sri Lanka', 'ලී කැටයම්', 'Ceylon Wood Creations', 'Handmade Statues'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si" className={`${playfair.variable} ${notoSinhala.variable}`}>
      <body className="min-h-screen flex flex-col bg-wood-50 text-wood-900 antialiased selection:bg-amber-200">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
