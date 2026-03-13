import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'تعرف على متجر ستيلار — الشريك الرقمي الأول في السودان. نوفر تفعيلات ويندوز وأوفيس، شحن ألعاب، اشتراكات بريميوم، ستارلينك ودعم فني متميز.',
  openGraph: {
    title: 'من نحن — متجر ستيلار',
    description: 'تعرف على متجر ستيلار — الشريك الرقمي الأول في السودان.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
