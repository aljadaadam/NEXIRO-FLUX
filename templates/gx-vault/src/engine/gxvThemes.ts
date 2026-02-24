// ─── GX-VAULT Themes ───
// ثيمات ألوان مخصصة لقالب شحن الألعاب — تصميم سايبر جيمنج

export interface GxvColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  glow: string;
  surface: string;
  surfaceLight: string;
}

export const GXV_COLOR_THEMES: GxvColorTheme[] = [
  {
    id: 'neon-violet',
    name: 'بنفسجي نيون',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c084fc',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)',
    glow: '0 0 30px rgba(139,92,246,0.4)',
    surface: 'rgba(139,92,246,0.08)',
    surfaceLight: 'rgba(139,92,246,0.15)',
  },
  {
    id: 'cyber-blue',
    name: 'أزرق سايبر',
    primary: '#06b6d4',
    secondary: '#22d3ee',
    accent: '#67e8f9',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
    glow: '0 0 30px rgba(6,182,212,0.4)',
    surface: 'rgba(6,182,212,0.08)',
    surfaceLight: 'rgba(6,182,212,0.15)',
  },
  {
    id: 'fire-red',
    name: 'أحمر ناري',
    primary: '#ef4444',
    secondary: '#f87171',
    accent: '#fca5a5',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
    glow: '0 0 30px rgba(239,68,68,0.4)',
    surface: 'rgba(239,68,68,0.08)',
    surfaceLight: 'rgba(239,68,68,0.15)',
  },
  {
    id: 'toxic-green',
    name: 'أخضر سام',
    primary: '#22c55e',
    secondary: '#4ade80',
    accent: '#86efac',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
    glow: '0 0 30px rgba(34,197,94,0.4)',
    surface: 'rgba(34,197,94,0.08)',
    surfaceLight: 'rgba(34,197,94,0.15)',
  },
  {
    id: 'gold-royal',
    name: 'ذهبي ملكي',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fde68a',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    glow: '0 0 30px rgba(245,158,11,0.4)',
    surface: 'rgba(245,158,11,0.08)',
    surfaceLight: 'rgba(245,158,11,0.15)',
  },
  {
    id: 'plasma-pink',
    name: 'وردي بلازما',
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#f9a8d4',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)',
    glow: '0 0 30px rgba(236,72,153,0.4)',
    surface: 'rgba(236,72,153,0.08)',
    surfaceLight: 'rgba(236,72,153,0.15)',
  },
];

export function gxvGetTheme(id: string): GxvColorTheme {
  return GXV_COLOR_THEMES.find(t => t.id === id) || GXV_COLOR_THEMES[0];
}
