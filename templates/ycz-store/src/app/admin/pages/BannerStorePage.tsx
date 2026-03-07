'use client';

import { useState, useEffect, useCallback } from 'react';
import { Store, Download, Trash2, Loader2, Check, Image, Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAdminLang } from '@/providers/AdminLanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface BannerTemplate {
  id: number;
  name: string;
  preview_image: string | null;
  category: string;
  design_data: { title?: string; subtitle?: string; icon?: string; gradient?: string; desc?: string; image_url?: string; link?: string };
  price: number;
  is_active: number;
}

interface InstalledBanner {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  image_url: string;
  is_active: number;
  template_id: number | null;
}

export default function BannerStorePage({ isActive }: { isActive?: boolean } = {}) {
  const { t, isRTL } = useAdminLang();
  const { currentTheme } = useTheme();
  const [tab, setTab] = useState<'store' | 'installed'>('store');
  const [templates, setTemplates] = useState<BannerTemplate[]>([]);
  const [installedIds, setInstalledIds] = useState<number[]>([]);
  const [myBanners, setMyBanners] = useState<InstalledBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [msg, setMsg] = useState('');

  const fetchStore = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBannerStore() as { templates: BannerTemplate[]; installedTemplateIds: number[] };
      setTemplates(data.templates || []);
      setInstalledIds(data.installedTemplateIds || []);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMyBanners() as { banners: InstalledBanner[] };
      setMyBanners(data.banners || []);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      if (tab === 'store') fetchStore();
      else fetchMyBanners();
    }
  }, [isActive, tab, fetchStore, fetchMyBanners]);

  const handleInstall = async (templateId: number) => {
    setInstalling(templateId);
    setMsg('');
    try {
      await adminApi.installBanner(templateId);
      setMsg(t('تم تثبيت البنر بنجاح'));
      setInstalledIds(prev => [...prev, templateId]);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setInstalling(null);
    }
  };

  const handleDelete = async (bannerId: number) => {
    if (!confirm(t('هل تريد حذف هذا البنر؟'))) return;
    setDeleting(bannerId);
    try {
      await adminApi.deleteBanner(bannerId);
      setMyBanners(prev => prev.filter(b => b.id !== bannerId));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (banner: InstalledBanner) => {
    setToggling(banner.id);
    try {
      await adminApi.toggleBanner(banner.id, !banner.is_active);
      setMyBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: b.is_active ? 0 : 1 } : b));
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setToggling(null);
    }
  };

  const categories = [...new Set(templates.map(t => t.category))];
  const filtered = categoryFilter ? templates.filter(t => t.category === categoryFilter) : templates;

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 16,
    border: '1px solid #e2e8f0', overflow: 'hidden',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Tajawal, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.accent}15)`,
            border: `1px solid ${currentTheme.primary}25`,
            display: 'grid', placeItems: 'center',
          }}>
            <Store size={22} style={{ color: currentTheme.primary }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {t('متجر البنرات')}
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              {t('تصفح وثبت بنرات جاهزة لمتجرك')}
            </p>
          </div>
        </div>
        <button onClick={() => tab === 'store' ? fetchStore() : fetchMyBanners()} style={{
          padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0',
          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.8rem', color: '#64748b', fontFamily: 'inherit',
        }}>
          <RefreshCw size={14} />
          {t('تحديث')}
        </button>
      </div>

      {/* Success message */}
      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: 12, marginBottom: 16,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          color: '#15803d', fontSize: '0.85rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={16} />
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
        {[
          { id: 'store' as const, label: t('المتجر'), icon: Store },
          { id: 'installed' as const, label: t('بنراتي المثبتة'), icon: Sparkles },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
              background: tab === item.id ? '#fff' : 'transparent',
              boxShadow: tab === item.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              color: tab === item.id ? '#0f172a' : '#94a3b8',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: currentTheme.primary }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : tab === 'store' ? (
        <>
          {/* Category filter */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              <button
                onClick={() => setCategoryFilter('')}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid',
                  borderColor: !categoryFilter ? currentTheme.primary : '#e2e8f0',
                  background: !categoryFilter ? `${currentTheme.primary}10` : '#fff',
                  color: !categoryFilter ? currentTheme.primary : '#64748b',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {t('الكل')}
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid',
                    borderColor: categoryFilter === c ? currentTheme.primary : '#e2e8f0',
                    background: categoryFilter === c ? `${currentTheme.primary}10` : '#fff',
                    color: categoryFilter === c ? currentTheme.primary : '#64748b',
                    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Templates grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <Image size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>{t('لا توجد بنرات متاحة حالياً')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map(tmpl => {
                const isInstalled = installedIds.includes(tmpl.id);
                const design = typeof tmpl.design_data === 'string' ? JSON.parse(tmpl.design_data) : tmpl.design_data;
                return (
                  <div key={tmpl.id} style={cardStyle}>
                    {/* Preview */}
                    <div style={{
                      height: 140, position: 'relative', overflow: 'hidden',
                      background: design.gradient || `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                    }}>
                      {tmpl.preview_image ? (
                        <img src={tmpl.preview_image} alt={tmpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          height: '100%', color: '#fff', padding: 16,
                        }}>
                          <span style={{ fontSize: '2rem', marginBottom: 6 }}>{design.icon || '🎨'}</span>
                          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{design.title || tmpl.name}</span>
                          {design.subtitle && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{design.subtitle}</span>}
                        </div>
                      )}
                      {/* Category badge */}
                      <span style={{
                        position: 'absolute', top: 10, [isRTL ? 'right' : 'left']: 10,
                        padding: '3px 10px', borderRadius: 6,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                        color: '#fff', fontSize: '0.65rem', fontWeight: 600,
                      }}>
                        {tmpl.category}
                      </span>
                    </div>

                    {/* Info + action */}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {tmpl.name}
                        </h3>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 700,
                          color: tmpl.price > 0 ? currentTheme.primary : '#16a34a',
                        }}>
                          {tmpl.price > 0 ? `$${tmpl.price}` : t('مجاني')}
                        </span>
                      </div>

                      <button
                        onClick={() => !isInstalled && handleInstall(tmpl.id)}
                        disabled={isInstalled || installing === tmpl.id}
                        style={{
                          width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                          background: isInstalled ? '#f1f5f9' : currentTheme.primary,
                          color: isInstalled ? '#94a3b8' : '#fff',
                          fontSize: '0.82rem', fontWeight: 700, cursor: isInstalled ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          fontFamily: 'inherit', transition: 'all 0.2s',
                          opacity: installing === tmpl.id ? 0.7 : 1,
                        }}
                      >
                        {installing === tmpl.id ? (
                          <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                        ) : isInstalled ? (
                          <Check size={15} />
                        ) : (
                          <Download size={15} />
                        )}
                        {installing === tmpl.id ? t('جاري التثبيت...') : isInstalled ? t('مثبت') : t('تثبيت')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Installed banners tab */
        <>
          {myBanners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <Sparkles size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>{t('لا توجد بنرات مثبتة')}</p>
              <p style={{ fontSize: '0.78rem' }}>{t('اذهب للمتجر وثبت بنراتك الأولى')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myBanners.map(banner => (
                <div key={banner.id} style={{
                  ...cardStyle,
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                  opacity: banner.is_active ? 1 : 0.6,
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${currentTheme.primary}10`, display: 'grid', placeItems: 'center',
                    fontSize: '1.3rem',
                  }}>
                    {banner.icon || '🎨'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {banner.title || t('بنر بدون عنوان')}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                      {banner.subtitle || '—'}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                    background: banner.is_active ? '#f0fdf4' : '#fef2f2',
                    color: banner.is_active ? '#16a34a' : '#dc2626',
                    border: `1px solid ${banner.is_active ? '#bbf7d0' : '#fecaca'}`,
                  }}>
                    {banner.is_active ? t('مفعّل') : t('معطّل')}
                  </span>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(banner)}
                    disabled={toggling === banner.id}
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0',
                      background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
                      color: '#64748b',
                    }}
                    title={banner.is_active ? t('إيقاف') : t('تفعيل')}
                  >
                    {toggling === banner.id ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : banner.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(banner.id)}
                    disabled={deleting === banner.id}
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #fecaca',
                      background: '#fef2f2', cursor: 'pointer', display: 'grid', placeItems: 'center',
                      color: '#dc2626',
                    }}
                    title={t('حذف')}
                  >
                    {deleting === banner.id ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
