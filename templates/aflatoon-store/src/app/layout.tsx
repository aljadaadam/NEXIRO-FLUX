import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aflatoon.store'),
  title: {
    default: 'متجر الأفلاطون | تفعيلات، ألعاب، اشتراكات رقمية',
    template: '%s | متجر الأفلاطون',
  },
  description: 'متجر الأفلاطون — أكبر منصة تفعيلات في السودان. تفعيلات ويندوز، ألعاب، beIN، ستارلينك واشتراكات بريميوم بأمان تام وتسليم فوري.',
  keywords: [
    'متجر الأفلاطون', 'تفعيلات', 'ألعاب', 'اشتراكات', 'شحن ألعاب',
    'PUBG UC', 'Free Fire', 'Call of Duty Mobile', 'Clash of Clans',
    'تفعيل ويندوز', 'Netflix', 'Shahid VIP', 'beIN Sports',
    'ChatGPT Plus', 'Gemini AI', 'TikTok', 'Telegram Premium',
    'Canva Pro', 'Apple ID', 'شحن بيناس', 'Proton VPN',
    'CapCut', 'Creative Cloud', 'تروكولر', 'خدمات فيس بوك',
    'السودان', 'SDG', 'الجنيه السوداني',
  ],
  authors: [{ name: 'Aflatoon Store' }],
  openGraph: {
    type: 'website',
    locale: 'ar_SD',
    siteName: 'متجر الأفلاطون',
    title: 'متجر الأفلاطون | تفعيلات، ألعاب، اشتراكات رقمية',
    description: 'أكبر منصة تفعيلات في السودان — تفعيلات ويندوز، ألعاب، beIN، ستارلينك واشتراكات بريميوم.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'متجر الأفلاطون' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'متجر الأفلاطون | تفعيلات وألعاب رقمية',
    description: 'تفعيلات ويندوز، شحن ألعاب، اشتراكات بريميوم — تسليم فوري.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement,s=localStorage;var l=s.getItem('afl_language');if(l==='en'){d.lang='en';d.dir='ltr'}if(s.getItem('afl_darkMode')!=='false')d.classList.add('dark')}catch(e){}})()` }} />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0 }} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
