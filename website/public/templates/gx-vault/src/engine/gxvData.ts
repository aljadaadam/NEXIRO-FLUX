// ─── GX-VAULT Static Data ───
// بيانات ثابتة للعرض — ألعاب مشهورة وخطوات الشحن

import type { GxvGameInfo } from './gxvTypes';

export const GXV_GAMES: GxvGameInfo[] = [
  {
    slug: 'pubg',
    name: 'PUBG Mobile',
    nameAr: 'ببجي موبايل',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: '🎯',
    banner: '',
  },
  {
    slug: 'fortnite',
    name: 'Fortnite',
    nameAr: 'فورتنايت',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    icon: '⚡',
    banner: '',
  },
  {
    slug: 'freefire',
    name: 'Free Fire',
    nameAr: 'فري فاير',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    icon: '🔥',
    banner: '',
  },
  {
    slug: 'cod',
    name: 'Call of Duty',
    nameAr: 'كول اوف ديوتي',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    icon: '💀',
    banner: '',
  },
  {
    slug: 'roblox',
    name: 'Roblox',
    nameAr: 'روبلوكس',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    icon: '🧱',
    banner: '',
  },
  {
    slug: 'valorant',
    name: 'Valorant',
    nameAr: 'فالورانت',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #991b1b)',
    icon: '🎮',
    banner: '',
  },
];

export const GXV_TOPUP_STEPS = [
  { step: 1, icon: '🎮', title: 'اختر اللعبة', desc: 'اختر اللعبة التي تريد شحنها من قائمة الألعاب المتاحة' },
  { step: 2, icon: '💎', title: 'اختر الباقة', desc: 'حدد عدد الجواهر أو العملات أو النوع المطلوب' },
  { step: 3, icon: '🆔', title: 'أدخل المعرّف', desc: 'أدخل معرّف حسابك في اللعبة بدقة' },
  { step: 4, icon: '⚡', title: 'شحن فوري', desc: 'ادفع واستلم شحنك خلال ثوانٍ مباشرة' },
];

export const GXV_FAQ = [
  { q: 'كم يستغرق الشحن؟', a: 'الشحن فوري في معظم الحالات، ويتم خلال ثوانٍ إلى دقائق.' },
  { q: 'هل الشحن آمن؟', a: 'نعم، نستخدم مصادر رسمية ومعتمدة للشحن بأمان تام.' },
  { q: 'ماذا لو لم أستلم الشحن؟', a: 'تواصل معنا عبر الدعم الفني وسنحل مشكلتك فورًا.' },
  { q: 'هل يمكنني استرجاع المبلغ؟', a: 'نعم، في حال عدم تنفيذ الطلب يتم استرجاع كامل المبلغ.' },
];
