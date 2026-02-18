// ─── HX Tools Store - Color Themes ───

export interface HxColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  light: string;
  dark: string;
}

export const HX_COLOR_THEMES: HxColorTheme[] = [
  {
    id: 'tech-blue',
    name: 'أزرق تقني',
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    light: '#eff6ff',
    dark: '#1e3a5f',
  },
  {
    id: 'carbon',
    name: 'كاربوني',
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #374151, #111827)',
    light: '#f9fafb',
    dark: '#111827',
  },
  {
    id: 'electric-green',
    name: 'أخضر كهربائي',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
    light: '#ecfdf5',
    dark: '#064e3b',
  },
  {
    id: 'crimson',
    name: 'أحمر قرمزي',
    primary: '#dc2626',
    secondary: '#ef4444',
    accent: '#f97316',
    gradient: 'linear-gradient(135deg, #dc2626, #f97316)',
    light: '#fef2f2',
    dark: '#7f1d1d',
  },
  {
    id: 'royal-purple',
    name: 'بنفسجي ملكي',
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    light: '#f5f3ff',
    dark: '#4c1d95',
  },
  {
    id: 'midnight',
    name: 'منتصف الليل',
    primary: '#1e293b',
    secondary: '#334155',
    accent: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    light: '#f1f5f9',
    dark: '#0f172a',
  },
];

export function getHxTheme(id: string): HxColorTheme {
  return HX_COLOR_THEMES.find(t => t.id === id) || HX_COLOR_THEMES[0];
}
