import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'آراء العملاء',
  description: 'اقرأ تقييمات وآراء عملاء متجر ستيلار الحقيقية. تجارب شراء تفعيلات ويندوز، شحن ألعاب، اشتراكات رقمية وخدمات ستارلينك.',
  openGraph: {
    title: 'آراء العملاء — متجر ستيلار',
    description: 'اقرأ تقييمات وآراء عملاء متجر ستيلار الحقيقية.',
  },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
