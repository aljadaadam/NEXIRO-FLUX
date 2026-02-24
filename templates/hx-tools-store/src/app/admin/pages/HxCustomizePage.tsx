'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxColorTheme, HX_COLOR_THEMES, getHxTheme } from '@/lib/hxThemes';
import { HxBanner } from '@/lib/hxTypes';
import { Palette, Save, Plus, Trash2, Edit3, X, Image as ImageIcon, Sun, Moon, Eye } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; buttonRadius: string; }

export default function HxCustomizePage({ theme, darkMode, t, buttonRadius }: Props) {
  const [activeTab, setActiveTab] = useState<'theme' | 'banners'>('theme');
  const [selectedTheme, setSelectedTheme] = useState('tech-blue');
  const [selectedRadius, setSelectedRadius] = useState('12');
  const [banners, setBanners] = useState<HxBanner[]>([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editBanner, setEditBanner] = useState<HxBanner | null>(null);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image: '', link: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await hxAdminApi.getCustomization();
        if (data.customization) {
          setSelectedTheme(data.customization.color_theme || 'tech-blue');
          setSelectedRadius(data.customization.button_radius || '12');
        }
        const b = await hxAdminApi.getBanners();
        setBanners(b.banners || []);
      } catch {}
    };
    load();
  }, []);

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await hxAdminApi.updateCustomization({ color_theme: selectedTheme, button_radius: selectedRadius });
    } catch {}
    setSaving(false);
  };

  const handleSaveBanner = async () => {
    try {
      if (editBanner) {
        await hxAdminApi.updateBanner(editBanner.id, bannerForm);
      } else {
        await hxAdminApi.createBanner(bannerForm);
      }
      setShowBannerForm(false);
      const b = await hxAdminApi.getBanners();
      setBanners(b.banners || []);
    } catch {}
  };

  const handleDeleteBanner = async (id: number | string) => {
    if (!confirm(t('حذف هذا البانر؟'))) return;
    try {
      await hxAdminApi.deleteBanner(id);
      const b = await hxAdminApi.getBanners();
      setBanners(b.banners || []);
    } catch {}
  };

  const radiusOptions = ['0', '6', '10', '12', '16', '24', '999'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>🎨 {t('التخصيص')}</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'theme' as const, label: t('المظهر'), icon: <Palette size={14} /> },
          { id: 'banners' as const, label: t('البانرات'), icon: <ImageIcon size={14} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === tab.id ? `${theme.primary}15` : 'transparent',
            color: activeTab === tab.id ? theme.primary : subtext,
            fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'theme' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Color themes */}
          <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 16 }}>{t('لون القالب')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {HX_COLOR_THEMES.map(th => {
                const tColors = getHxTheme(th.id);
                const isSelected = selectedTheme === th.id;
                return (
                  <button key={th.id} onClick={() => setSelectedTheme(th.id)} style={{
                    padding: 14, borderRadius: 14, border: `2px solid ${isSelected ? tColors.primary : border}`,
                    background: isSelected ? `${tColors.primary}08` : 'transparent',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: tColors.primary }} />
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: tColors.secondary }} />
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: tColors.accent }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? tColors.primary : text }}>{th.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Button radius */}
          <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 16 }}>{t('شكل الأزرار')}</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {radiusOptions.map(r => (
                <button key={r} onClick={() => setSelectedRadius(r)} style={{
                  width: 50, height: 50, borderRadius: Number(r), border: `2px solid ${selectedRadius === r ? theme.primary : border}`,
                  background: selectedRadius === r ? `${theme.primary}12` : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: selectedRadius === r ? theme.primary : subtext,
                }}>
                  {r === '999' ? '∞' : r}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSaveTheme} disabled={saving} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={16} /> {saving ? t('جاري الحفظ...') : t('حفظ التغييرات')}
          </button>
        </div>
      )}

      {activeTab === 'banners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { setEditBanner(null); setBannerForm({ title: '', subtitle: '', image: '', link: '', is_active: true }); setShowBannerForm(true); }} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> {t('إضافة بانر')}
            </button>
          </div>

          {banners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: subtext }}>
              <ImageIcon size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>{t('لا توجد بانرات')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {banners.map(b => (
                <div key={b.id} style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
                  {b.image && (
                    <div style={{ height: 140, background: `url(${b.image}) center/cover`, position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                      <div style={{ position: 'absolute', bottom: 10, right: 14, left: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{b.title}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ padding: 14 }}>
                    {!b.image && <h4 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 4 }}>{b.title}</h4>}
                    {b.subtitle && <p style={{ fontSize: 12, color: subtext, marginBottom: 8 }}>{b.subtitle}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: b.is_active ? '#10b98115' : '#ef444415', color: b.is_active ? '#10b981' : '#ef4444' }}>
                        {b.is_active ? t('مفعل') : t('معطل')}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { setEditBanner(b); setBannerForm({ title: b.title, subtitle: b.subtitle || '', image: b.image || '', link: b.link || '', is_active: b.is_active !== false }); setShowBannerForm(true); }} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 6, padding: 5, cursor: 'pointer', color: theme.primary }}><Edit3 size={12} /></button>
                        <button onClick={() => handleDeleteBanner(b.id)} style={{ background: '#ef444412', border: 'none', borderRadius: 6, padding: 5, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Banner form modal */}
          {showBannerForm && (
            <div className="hx-modal-overlay" onClick={() => setShowBannerForm(false)}>
              <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editBanner ? t('تعديل البانر') : t('إضافة بانر')}</h3>
                    <button onClick={() => setShowBannerForm(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('العنوان')}</label>
                      <input className="hx-input" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('العنوان الفرعي')}</label>
                      <input className="hx-input" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رابط الصورة')}</label>
                      <input className="hx-input" value={bannerForm.image} onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رابط الزر')}</label>
                      <input className="hx-input" value={bannerForm.link} onChange={e => setBannerForm({ ...bannerForm, link: e.target.value })} placeholder="/products" />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: text, cursor: 'pointer' }}>
                      <input type="checkbox" checked={bannerForm.is_active} onChange={e => setBannerForm({ ...bannerForm, is_active: e.target.checked })} />
                      {t('مفعل')}
                    </label>
                  </div>

                  <button onClick={handleSaveBanner} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Save size={16} /> {t('حفظ')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
