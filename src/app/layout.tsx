import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';

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
    <html lang="si">
      <body className="min-h-screen flex flex-col bg-wood-50 text-wood-900 antialiased selection:bg-amber-200">
        <LanguageProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
