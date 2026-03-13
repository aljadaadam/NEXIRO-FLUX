import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التصنيفات والمنتجات',
  description: 'تصفح جميع المنتجات والخدمات الرقمية — تفعيلات ويندوز، شحن ألعاب PUBG وفري فاير، اشتراكات beIN ونتفلكس وسبوتيفاي، ستارلينك وأكثر. أسعار منافسة وتسليم فوري.',
  keywords: ['منتجات رقمية', 'تفعيلات', 'شحن ألعاب', 'اشتراكات', 'بطاقات رقمية', 'PUBG', 'فري فاير', 'beIN', 'نتفلكس'],
  openGraph: {
    title: 'التصنيفات والمنتجات — متجر ستيلار',
    description: 'تصفح جميع المنتجات والخدمات الرقمية بأسعار منافسة وتسليم فوري.',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
