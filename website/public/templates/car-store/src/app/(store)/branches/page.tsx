'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import { Branch } from '@/lib/types';
import { MapPin, Phone, Mail, Clock, ExternalLink, Star, Navigation } from 'lucide-react';

export default function BranchesPage() {
  const { currentTheme, darkMode, t, isRTL } = useTheme();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#0a0a12' : '#fafafe';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  useEffect(() => {
    storeApi.getBranches().then((data: { branches?: Branch[] }) => {
      setBranches(data.branches || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: bg, color: textColor, minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 60 }} className="anim-fade-up">
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, marginBottom: 12 }}>
            {t('فروعنا')}
          </h1>
          <p style={{ color: mutedColor, fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            {t('زوروا أقرب فرع لمعاينة السيارات واختبارها بأنفسكم')}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 28 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 420, borderRadius: 24 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 28 }}>
            {branches.map((branch, i) => (
              <div key={branch.id} className={`branch-card anim-fade-up anim-delay-${(i % 3) + 1}`}
                style={{ background: cardBg, border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                {/* Image */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={branch.image || 'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=800'}
                    alt={branch.name}
                    className="branch-card-image"
                    loading="lazy"
                  />
                  {branch.is_main && (
                    <div className="branch-main-badge">
                      <Star size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                      {t('الفرع الرئيسي')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>{branch.name}</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={18} color={accent} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: mutedColor, marginBottom: 2 }}>{t('العنوان')}</p>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{branch.address}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Phone size={18} color={accent} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: mutedColor, marginBottom: 2 }}>{t('الهاتف')}</p>
                        <p style={{ fontSize: 14, fontWeight: 600 }} dir="ltr">{branch.phone}</p>
                      </div>
                    </div>

                    {branch.email && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Mail size={18} color={accent} />
                        </div>
                        <div>
                          <p style={{ fontSize: 12, color: mutedColor, marginBottom: 2 }}>{t('البريد الإلكتروني')}</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{branch.email}</p>
                        </div>
                      </div>
                    )}

                    {branch.working_hours && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Clock size={18} color={accent} />
                        </div>
                        <div>
                          <p style={{ fontSize: 12, color: mutedColor, marginBottom: 2 }}>{t('ساعات العمل')}</p>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{branch.working_hours}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Map Button */}
                  {branch.lat && branch.lng && (
                    <a href={`https://maps.google.com/?q=${branch.lat},${branch.lng}`} target="_blank" rel="noopener noreferrer"
                      className="car-btn-primary" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        width: '100%', marginTop: 24, background: accent, borderRadius: 14, padding: '12px 0',
                      }}>
                      <Navigation size={16} />
                      {t('عرض على الخريطة')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
