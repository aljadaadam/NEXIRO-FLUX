export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  light: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  { id: 'purple', name: 'بنفسجي كلاسيكي', primary: '#7c5cff', secondary: '#a78bfa', accent: '#22c55e', gradient: 'linear-gradient(135deg, #7c5cff, #a78bfa)', light: '#f5f3ff' },
  { id: 'ocean', name: 'أزرق محيطي', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#06b6d4', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', light: '#f0f9ff' },
  { id: 'emerald', name: 'أخضر زمردي', primary: '#10b981', secondary: '#34d399', accent: '#059669', gradient: 'linear-gradient(135deg, #10b981, #059669)', light: '#ecfdf5' },
  { id: 'rose', name: 'وردي أنيق', primary: '#f43f5e', secondary: '#fb7185', accent: '#e11d48', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', light: '#fff1f2' },
  { id: 'amber', name: 'ذهبي فاخر', primary: '#f59e0b', secondary: '#fbbf24', accent: '#d97706', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', light: '#fffbeb' },
  { id: 'slate', name: 'رمادي عصري', primary: '#475569', secondary: '#64748b', accent: '#334155', gradient: 'linear-gradient(135deg, #475569, #334155)', light: '#f8fafc' },
];

export function getTheme(id: string): ColorTheme {
  return COLOR_THEMES.find(t => t.id === id) || COLOR_THEMES[0];
}
