'use client';

import { useState, useEffect, useCallback } from 'react';
import { Store, Download, Trash2, Loader2, Check, Image, Eye, EyeOff, RefreshCw, Sparkles, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAdminLang } from '@/providers/AdminLanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface BannerTemplate {
  id: number;
  name: string;
  preview_image: string | null;
  category: string;
  design_data: { title?: string; subtitle?: string; icon?: string; gradient?: string; desc?: string; description?: string; image_url?: string; link?: string; badges?: string[]; meshColor1?: string; meshColor2?: string };
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
  description: string;
  extra_data: string | { badges?: string[]; gradient?: string };
}

export default function BannerStorePage({ isActive }: { isActive?: boolean } = {}) {
  const { t, isRTL } = useAdminLang();
  const { currentTheme } = useTheme();
  const [tab, setTab] = useState<'store' | 'installed'>('store');
  const [templates, setTemplates] = useState<BannerTemplate[]>([]);
  const [installedIds, setInstalledIds] = useState<number[]>([]);
  const [templateBannerMap, setTemplateBannerMap] = useState<Record<number, number>>({});
  const [myBanners, setMyBanners] = useState<InstalledBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<number | null>(null);
  const [uninstalling, setUninstalling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [msg, setMsg] = useState('');

  const fetchStore = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBannerStore() as { templates: BannerTemplate[]; installedTemplateIds: number[]; templateBannerMap: Record<number, number> };
      setTemplates(data.templates || []);
      setInstalledIds(data.installedTemplateIds || []);
      setTemplateBannerMap(data.templateBannerMap || {});
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
      await fetchStore();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (templateId: number) => {
    const bannerId = templateBannerMap[templateId];
    if (!bannerId) return;
    if (!confirm(t('هل تريد إلغاء تثبيت هذا البنر؟'))) return;
    setUninstalling(templateId);
    try {
      await adminApi.deleteBanner(bannerId);
      setInstalledIds(prev => prev.filter(id => id !== templateId));
      const newMap = { ...templateBannerMap };
      delete newMap[templateId];
      setTemplateBannerMap(newMap);
      setMsg(t('تم إلغاء التثبيت'));
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('Uninstall failed:', err);
    } finally {
      setUninstalling(null);
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

  /* ── Mini banner preview component ── */
  const BannerPreview = ({ design, name }: { design: BannerTemplate['design_data']; name: string }) => {
    const gradient = design.gradient || `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`;
    return (
      <div style={{
        height: 180, position: 'relative', overflow: 'hidden',
        background: gradient, borderRadius: '16px 16px 0 0',
        display: 'flex', alignItems: 'center', padding: '1.2rem 1.5rem',
        gap: '1.2rem', direction: 'rtl',
      }}>
        {/* Animated orbs */}
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, ${design.meshColor1 || 'rgba(255,255,255,0.15)'} 0%, transparent 70%)`,
          top: '-30%', right: '-5%', filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${design.meshColor2 || 'rgba(255,255,255,0.1)'} 0%, transparent 70%)`,
          bottom: '-20%', left: '-5%', filter: 'blur(20px)', pointerEvents: 'none',
        }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '16px 16px', pointerEvents: 'none',
        }} />

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
          {design.title && (
            <div style={{
              display: 'inline-block', borderRadius: 14,
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '2px 10px', fontSize: '0.6rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.9)', marginBottom: 6,
            }}>
              {design.title}
            </div>
          )}
          <h3 style={{
            fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 4px',
            lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            {design.subtitle || name}
          </h3>
          {(design.desc || design.description) && (
            <p style={{
              fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px',
              lineHeight: 1.4, maxWidth: 220,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {design.desc || design.description}
            </p>
          )}
          {design.badges && design.badges.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {design.badges.map((badge, i) => (
                <span key={i} style={{
                  borderRadius: 12, padding: '2px 8px', fontSize: '0.55rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
                }}>
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Product image */}
        {design.image_url && (
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <div style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }} />
            <img
              src={design.image_url}
              alt={name}
              style={{
                width: 90, height: 90, objectFit: 'contain',
                borderRadius: 16, position: 'relative',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
              }}
            />
          </div>
        )}
        {!design.image_url && design.icon && (
          <div style={{
            width: 60, height: 60, borderRadius: 16, flexShrink: 0,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'grid', placeItems: 'center', fontSize: '1.8rem',
            position: 'relative', zIndex: 2,
          }}>
            {design.icon}
          </div>
        )}
      </div>
    );
  };

  /* ── Installed banner card preview ── */
  const InstalledPreview = ({ banner }: { banner: InstalledBanner }) => {
    const extraData = typeof banner.extra_data === 'string' ? (() => { try { return JSON.parse(banner.extra_data); } catch { return {}; } })() : (banner.extra_data || {});
    const gradient = extraData.gradient || `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`;
    const badges: string[] = extraData.badges || [];
    return (
      <div style={{
        height: 120, position: 'relative', overflow: 'hidden',
        background: gradient, borderRadius: 14,
        display: 'flex', alignItems: 'center', padding: '1rem 1.2rem',
        gap: '1rem', direction: 'rtl', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '14px 14px', pointerEvents: 'none',
        }} />
        <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block', borderRadius: 12,
            background: 'rgba(255,255,255,0.18)', padding: '2px 8px',
            fontSize: '0.55rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4,
          }}>
            {banner.title}
          </div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', margin: '0 0 3px', lineHeight: 1.3 }}>
            {banner.subtitle || '—'}
          </h4>
          {badges.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {badges.slice(0, 3).map((b, i) => (
                <span key={i} style={{
                  borderRadius: 10, padding: '1px 6px', fontSize: '0.5rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.2)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
        {banner.image_url && (
          <img src={banner.image_url} alt="" style={{
            width: 65, height: 65, objectFit: 'contain', borderRadius: 12,
            position: 'relative', zIndex: 2,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }} />
        )}
      </div>
    );
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {filtered.map(tmpl => {
                const isInstalled = installedIds.includes(tmpl.id);
                const design = typeof tmpl.design_data === 'string' ? JSON.parse(tmpl.design_data) : tmpl.design_data;
                return (
                  <div key={tmpl.id} style={{
                    background: '#fff', borderRadius: 16,
                    border: isInstalled ? `2px solid ${currentTheme.primary}40` : '1px solid #e2e8f0',
                    overflow: 'hidden', transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    {/* Banner preview */}
                    <BannerPreview design={design} name={tmpl.name} />

                    {/* Info + actions */}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {tmpl.name}
                        </h3>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                          background: tmpl.price > 0 ? `${currentTheme.primary}10` : '#f0fdf4',
                          color: tmpl.price > 0 ? currentTheme.primary : '#16a34a',
                        }}>
                          {tmpl.price > 0 ? `$${tmpl.price}` : t('مجاني')}
                        </span>
                      </div>

                      {isInstalled ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{
                            flex: 1, padding: '10px', borderRadius: 10,
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            color: '#16a34a', fontSize: '0.82rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}>
                            <Check size={15} />
                            {t('مثبت')}
                          </div>
                          <button
                            onClick={() => handleUninstall(tmpl.id)}
                            disabled={uninstalling === tmpl.id}
                            style={{
                              padding: '10px 16px', borderRadius: 10, border: '1px solid #fecaca',
                              background: '#fef2f2', color: '#dc2626',
                              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 6,
                              fontFamily: 'inherit', transition: 'all 0.2s',
                              opacity: uninstalling === tmpl.id ? 0.7 : 1,
                            }}
                          >
                            {uninstalling === tmpl.id ? (
                              <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                            ) : (
                              <X size={15} />
                            )}
                            {t('إلغاء')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInstall(tmpl.id)}
                          disabled={installing === tmpl.id}
                          style={{
                            width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent || currentTheme.primary})`,
                            color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            fontFamily: 'inherit', transition: 'all 0.2s',
                            opacity: installing === tmpl.id ? 0.7 : 1,
                            boxShadow: `0 4px 12px ${currentTheme.primary}30`,
                          }}
                        >
                          {installing === tmpl.id ? (
                            <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                          ) : (
                            <Download size={15} />
                          )}
                          {installing === tmpl.id ? t('جاري التثبيت...') : t('تثبيت البنر')}
                        </button>
                      )}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myBanners.map(banner => (
                <div key={banner.id} style={{
                  background: '#fff', borderRadius: 16,
                  border: '1px solid #e2e8f0', overflow: 'hidden',
                  opacity: banner.is_active ? 1 : 0.65,
                  transition: 'all 0.2s',
                }}>
                  {/* Banner preview */}
                  <InstalledPreview banner={banner} />

                  {/* Actions bar */}
                  <div style={{
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {banner.title || t('بنر بدون عنوان')}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      padding: '4px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600,
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
                        width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0',
                        background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center',
                        color: '#64748b', transition: 'all 0.2s',
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
                        width: 36, height: 36, borderRadius: 10, border: '1px solid #fecaca',
                        background: '#fef2f2', cursor: 'pointer', display: 'grid', placeItems: 'center',
                        color: '#dc2626', transition: 'all 0.2s',
                      }}
                      title={t('حذف')}
                    >
                      {deleting === banner.id ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={14} />}
                    </button>
                  </div>
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
