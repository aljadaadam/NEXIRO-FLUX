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
  metadataBase: new URL('https://magicdesign3.com'),
  title: {
    default: 'متجر خدمات رقمية | فتح شبكات، إزالة iCloud، أدوات صيانة، شحن ألعاب',
    template: '%s | متجر خدمات رقمية',
  },
  description: 'متجر خدمات رقمية متكامل — إزالة iCloud، فتح شبكات iPhone و Samsung، أدوات سوفتوير مثل Unlocktool و Z3X و Chimera و Octoplus، إزالة FRP، فحص IMEI، شحن ألعاب PUBG و Free Fire، بطاقات هدايا Google Play و PlayStation و Xbox، تفعيل أدوات صيانة الهواتف، وخدمات فتح قفل الشبكة لجميع الشركات العالمية AT&T و T-Mobile و Verizon وأكثر.',
  keywords: [
    // Arabic keywords
    'فتح شبكات', 'إزالة iCloud', 'فتح قفل آيفون', 'فتح قفل سامسونج', 'أدوات صيانة', 'أدوات سوفتوير',
    'إزالة FRP', 'فحص IMEI', 'شحن ألعاب', 'شحن PUBG', 'شحن فري فاير', 'بطاقات هدايا',
    'فتح شبكة AT&T', 'فتح شبكة T-Mobile', 'خدمات IMEI', 'كريدت', 'تفعيل أدوات',
    'إزالة حساب Mi', 'إزالة MDM', 'بايباس iCloud', 'فتح قفل شبكة', 'متجر خدمات رقمية',
    'بطاقات PlayStation', 'بطاقات Xbox', 'بطاقات Google Play', 'تيك توك كوينز',
    'تلغرام بريميوم', 'شاهد VIP', 'NordVPN', 'مفتاح ويندوز',
    // English keywords — IMEI & unlock tools
    'iCloud remove', 'iCloud unlock', 'iPhone unlock', 'Samsung unlock', 'IMEI check',
    'FRP remove', 'FRP bypass', 'Samsung FRP', 'Xiaomi Mi Account remove',
    'Unlocktool activation', 'Z3X Samsung', 'EFT Dongle', 'EFT Pro Tool',
    'Chimera Tool', 'Octoplus', 'Sigma Plus', 'NCK Box', 'NCK Dongle',
    'UMT Box', 'Hydra Tool', 'Griffin Unlocker', 'Borneo Schematics',
    'DC Unlocker', 'HCU', 'Cheetah Tool', 'DFT Pro', 'Halabtech',
    'iRemoval Pro', 'TSM Tool', 'TFM Tool', 'TR Tools', 'UniAndroid',
    'Android Multi Tool', 'Pandora Box', 'EVO Tool', 'Click Tool',
    'mdmfixtool', 'XinZhiZao', 'DZKJ PhoneRepair', 'BTMultiTool',
    'KEY Tool Samsung', 'Xiaomi Pro Tool', 'Xiaomi King Tool',
    'Samsung Tool KG Bypass', 'iKey Meid Tool', 'HFZ Activator',
    'VR Activator', 'S.K Unlocker', 'E-GSM Tool', 'Tera Tool',
    'T-Tool Pro', 'Frp Boss Tool',
    // Carrier unlock
    'AT&T unlock', 'T-Mobile unlock', 'Verizon unlock', 'Cricket unlock',
    'Sprint unlock', 'Bell Canada unlock', 'Rogers unlock', 'Claro unlock',
    'Vodafone unlock', 'EE unlock', 'O2 unlock', 'Softbank unlock',
    'Docomo unlock', 'Telstra unlock',
    // Game top-up & gift cards
    'PUBG UC', 'Free Fire diamonds', 'TikTok coins', 'Google Play gift card',
    'PlayStation gift card', 'Xbox gift card', 'Razer Gold', 'IMO gift card',
    'Telegram Premium', 'Shahid VIP', 'NordVPN subscription', 'Netflix',
    // Brand service keywords
    'iPhone IMEI check', 'Samsung IMEI check', 'Huawei IMEI', 'Oppo unlock',
    'Realme unlock', 'Motorola unlock', 'LG unlock', 'Nokia unlock',
    'Honor FRP', 'MDM bypass', 'GSX report', 'iCloud bad case remove',
    'Xiaomi FRP', 'Samsung KG bypass',
  ],
  authors: [{ name: 'NEXIRO-FLUX' }],
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'متجر خدمات رقمية',
    title: 'متجر خدمات رقمية | فتح شبكات، إزالة iCloud، أدوات صيانة، شحن ألعاب',
    description: 'متجر خدمات رقمية متكامل — إزالة iCloud، فتح شبكات الهواتف، أدوات سوفتوير احترافية، شحن ألعاب، بطاقات هدايا، وخدمات IMEI لجميع الأجهزة والشركات العالمية.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'متجر خدمات رقمية' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'متجر خدمات رقمية | فتح شبكات، إزالة iCloud، أدوات صيانة',
    description: 'إزالة iCloud، فتح شبكات iPhone و Samsung، أدوات سوفتوير، شحن ألعاب PUBG و Free Fire، بطاقات هدايا وأكثر.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  verification: {},
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Blocking script: apply cached theme BEFORE first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement,s=localStorage;var l=s.getItem('ycz_language');if(l==='en'){d.lang='en';d.dir='ltr'}if(s.getItem('ycz_darkMode')==='true')d.classList.add('dark')}catch(e){}})()` }} />
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

