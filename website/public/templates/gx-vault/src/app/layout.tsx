import type { Metadata } from 'next';
import { GxvThemeCore } from '@/core/GxvThemeCore';
import './gxv-globals.css';

export const metadata: Metadata = {
  title: 'GX Vault — شحن الألعاب',
  description: 'أسرع منصة لشحن ألعابك المفضلة — ببجي، فورتنايت، فري فاير، كول اوف ديوتي والمزيد',
};

export default function GxvRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        <GxvThemeCore>
          {children}
        </GxvThemeCore>
      </body>
    </html>
  );
}
