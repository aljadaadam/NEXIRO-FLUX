import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'متجر الأفلاطون — تفعيلات، ألعاب، ستارلينك',
  description: 'أكبر منصة تفعيلات في السودان. متجر الأفلاطون يوفر لك تفعيلات ويندوز، ألعاب، beIN، ستارلينك واشتراكات بريميوم بأمان تام وتسليم فوري.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-navy-950 text-navy-100 antialiased">
        {children}
      </body>
    </html>
  );
}
