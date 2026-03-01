'use client';

import { useTheme } from '@/providers/ThemeProvider';

// Animated floating particles background
export default function ParticlesBackground() {
  const { currentTheme, darkMode } = useTheme();

  if (!darkMode) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 15,
    color: i % 3 === 0 ? currentTheme.primary : i % 3 === 1 ? currentTheme.secondary : currentTheme.accent,
  }));

  return (
    <div className="particles-bg" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
