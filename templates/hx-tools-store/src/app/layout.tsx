import type { Metadata } from 'next';
import './globals.css';
import { HxThemeProvider } from '@/providers/HxThemeProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:4000'),
  title: 'HX Tools Store',
  description: 'متجر أدوات الصيانة والسوفتوير - دونجلات، بوكسات، JTAG، أدوات لحام وقطع غيار',
};

export default function HxRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <HxThemeProvider>
          {children}
        </HxThemeProvider>
      </body>
    </html>
  );
}
