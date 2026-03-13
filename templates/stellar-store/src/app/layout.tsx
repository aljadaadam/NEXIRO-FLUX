import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://demo-stellar.nexiroflux.com'),
  title: {
    default: 'متجر ستيلار — تفعيلات، ألعاب، ستارلينك | أفضل متجر رقمي في السودان',
    template: '%s | متجر ستيلار',
  },
  description: 'أكبر منصة تفعيلات في السودان. متجر ستيلار يوفر لك تفعيلات ويندوز، أوفيس، ألعاب، beIN Sports، ستارلينك، نتفلكس، سبوتيفاي واشتراكات بريميوم بأمان تام وتسليم فوري. أسعار منافسة ودفع محلي عبر بنكك.',
  keywords: [
    'متجر رقمي', 'تفعيلات ويندوز', 'تفعيل ويندوز 11', 'تفعيل أوفيس 365',
    'شحن ألعاب', 'شحن PUBG', 'شحن فري فاير', 'بطاقات PlayStation',
    'اشتراك beIN', 'ستارلينك السودان', 'نتفلكس', 'سبوتيفاي',
    'متجر إلكتروني السودان', 'تفعيلات رقمية', 'بطاقات رقمية',
    'شحن رصيد ألعاب', 'متجر ستيلار', 'stellar store',
    'كاسبرسكي', 'اشتراكات بريميوم', 'دفع بنكك', 'متجر سوداني',
  ],
  openGraph: {
    type: 'website',
    locale: 'ar_SD',
    siteName: 'متجر ستيلار',
    title: 'متجر ستيلار — تفعيلات، ألعاب، ستارلينك | أفضل متجر رقمي في السودان',
    description: 'أكبر منصة تفعيلات في السودان. تفعيلات ويندوز، أوفيس، ألعاب، beIN، ستارلينك واشتراكات بريميوم. تسليم فوري ودفع محلي.',
    url: 'https://demo-stellar.nexiroflux.com',
    images: [{
      url: '/images/hero-bg.jpg',
      width: 1200,
      height: 630,
      alt: 'متجر ستيلار — تفعيلات وألعاب واشتراكات رقمية',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'متجر ستيلار — أفضل متجر رقمي في السودان',
    description: 'تفعيلات ويندوز، ألعاب، beIN، ستارلينك، نتفلكس واشتراكات بريميوم. تسليم فوري ودفع محلي عبر بنكك.',
    images: ['/images/hero-bg.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://demo-stellar.nexiroflux.com',
  },
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-navy-950 text-navy-100 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'متجر ستيلار',
              alternateName: 'Stellar Store',
              description: 'أكبر منصة تفعيلات في السودان. تفعيلات ويندوز، ألعاب، اشتراكات رقمية بأسعار منافسة.',
              url: 'https://demo-stellar.nexiroflux.com',
              logo: 'https://demo-stellar.nexiroflux.com/images/og-stellar.png',
              currenciesAccepted: 'SDG',
              paymentAccepted: 'بنكك، محفظة إلكترونية',
              areaServed: { '@type': 'Country', name: 'السودان' },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://demo-stellar.nexiroflux.com/services?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
