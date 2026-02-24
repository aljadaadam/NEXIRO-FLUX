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
  { id: 'midnight',  name: 'أسود فاخر',   primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560',  gradient: 'linear-gradient(135deg, #1a1a2e, #0f3460)', light: '#f0f0f5' },
  { id: 'crimson',   name: 'أحمر رياضي',   primary: '#dc2626', secondary: '#ef4444', accent: '#fbbf24',  gradient: 'linear-gradient(135deg, #dc2626, #991b1b)', light: '#fef2f2' },
  { id: 'royal',     name: 'أزرق ملكي',    primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b',  gradient: 'linear-gradient(135deg, #1e40af, #1d4ed8)', light: '#eff6ff' },
  { id: 'carbon',    name: 'كربون عصري',   primary: '#374151', secondary: '#6b7280', accent: '#10b981',  gradient: 'linear-gradient(135deg, #374151, #1f2937)', light: '#f9fafb' },
  { id: 'gold',      name: 'ذهبي فخم',     primary: '#92400e', secondary: '#d97706', accent: '#1e293b',  gradient: 'linear-gradient(135deg, #92400e, #78350f)', light: '#fffbeb' },
  { id: 'emerald',   name: 'أخضر سباقات',  primary: '#065f46', secondary: '#059669', accent: '#f97316',  gradient: 'linear-gradient(135deg, #065f46, #047857)', light: '#ecfdf5' },
];

export function getTheme(id: string): ColorTheme {
  return COLOR_THEMES.find(t => t.id === id) || COLOR_THEMES[0];
}
