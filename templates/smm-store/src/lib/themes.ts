export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  light: string;
  glow?: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'neon-blue',
    name: 'أزرق نيون',
    primary: '#00d4ff',
    secondary: '#0099ff',
    accent: '#7c3aed',
    gradient: 'linear-gradient(135deg, #00d4ff, #0099ff, #7c3aed)',
    light: '#0a1628',
    glow: '0 0 30px rgba(0, 212, 255, 0.3)',
  },
  {
    id: 'cyber-purple',
    name: 'بنفسجي سايبر',
    primary: '#a855f7',
    secondary: '#7c3aed',
    accent: '#ec4899',
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed, #ec4899)',
    light: '#1a0a2e',
    glow: '0 0 30px rgba(168, 85, 247, 0.3)',
  },
  {
    id: 'hot-pink',
    name: 'وردي حار',
    primary: '#ec4899',
    secondary: '#f43f5e',
    accent: '#f97316',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e, #f97316)',
    light: '#2a0a1a',
    glow: '0 0 30px rgba(236, 72, 153, 0.3)',
  },
  {
    id: 'matrix-green',
    name: 'أخضر ماتريكس',
    primary: '#22c55e',
    secondary: '#10b981',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #22c55e, #10b981, #06b6d4)',
    light: '#0a1a0f',
    glow: '0 0 30px rgba(34, 197, 94, 0.3)',
  },
  {
    id: 'sunset-gold',
    name: 'ذهبي غروب',
    primary: '#f59e0b',
    secondary: '#f97316',
    accent: '#ef4444',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)',
    light: '#1a140a',
    glow: '0 0 30px rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'ocean-wave',
    name: 'موجة المحيط',
    primary: '#06b6d4',
    secondary: '#0ea5e9',
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #3b82f6)',
    light: '#0a1520',
    glow: '0 0 30px rgba(6, 182, 212, 0.3)',
  },
];

export function getTheme(id: string): ColorTheme {
  return COLOR_THEMES.find(t => t.id === id) || COLOR_THEMES[0];
}
