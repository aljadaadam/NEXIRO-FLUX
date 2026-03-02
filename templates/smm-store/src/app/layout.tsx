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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:4000'),
  title: {
    default: 'SMM Boost | خدمات سوشال ميديا - متابعين، لايكات، مشاهدات',
    template: '%s | SMM Boost',
  },
  description: 'منصة خدمات سوشال ميديا متكاملة — زيادة متابعين انستغرام، تيك توك، يوتيوب، تويتر، فيسبوك، سناب شات. لايكات، مشاهدات، تعليقات، اشتراكات لجميع منصات التواصل الاجتماعي بأسعار تنافسية وتسليم فوري.',
  keywords: [
    'زيادة متابعين', 'شراء متابعين', 'لايكات انستغرام', 'متابعين تيك توك',
    'مشاهدات يوتيوب', 'SMM panel', 'سوشال ميديا', 'رشق متابعين',
    'زيادة لايكات', 'زيادة مشاهدات', 'اشتراكات يوتيوب', 'متابعين تويتر',
    'أعضاء تلغرام', 'متابعين سناب شات', 'خدمات سوشال ميديا',
    'Instagram followers', 'TikTok followers', 'YouTube subscribers',
    'Twitter followers', 'Facebook likes', 'social media marketing',
  ],
  authors: [{ name: 'NEXIRO-FLUX' }],
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'SMM Boost',
    title: 'SMM Boost | خدمات سوشال ميديا',
    description: 'منصة خدمات سوشال ميديا متكاملة — متابعين، لايكات، مشاهدات لجميع المنصات.',
  },
  robots: { index: true, follow: true },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement,s=localStorage;var l=s.getItem('smm_language');if(l==='en'){d.lang='en';d.dir='ltr'}if(s.getItem('smm_darkMode')!=='false')d.classList.add('dark')}catch(e){}})()` }} />
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
