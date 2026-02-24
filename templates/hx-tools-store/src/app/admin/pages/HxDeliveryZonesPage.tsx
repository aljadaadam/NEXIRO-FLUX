'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxDeliveryZone, HxDeliveryRegion } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { MapPin, Plus, Edit3, Trash2, Save, X, ChevronDown, ChevronUp, Globe, Navigation } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; buttonRadius: string; }

export default function HxDeliveryZonesPage({ theme, darkMode, t, buttonRadius }: Props) {
  const [zones, setZones] = useState<HxDeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedZone, setExpandedZone] = useState<number | null>(null);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editZone, setEditZone] = useState<HxDeliveryZone | null>(null);
  const [zoneForm, setZoneForm] = useState({ country: '', country_code: '', base_shipping_cost: '', estimated_days: '', is_active: true });
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editRegion, setEditRegion] = useState<HxDeliveryRegion | null>(null);
  const [regionForm, setRegionForm] = useState({ name: '', extra_cost: '', is_active: true });
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => { loadZones(); }, []);

  const loadZones = async () => {
    try {
      const data = await hxAdminApi.getDeliveryZones();
      setZones(data.zones || data.delivery_zones || []);
    } catch { setZones([]); }
    setLoading(false);
  };

  // Zone operations
  const openNewZone = () => {
    setEditZone(null);
    setZoneForm({ country: '', country_code: '', base_shipping_cost: '', estimated_days: '', is_active: true });
    setShowZoneForm(true);
  };

  const openEditZone = (z: HxDeliveryZone) => {
    setEditZone(z);
    setZoneForm({
      country: z.country, country_code: z.country_code || '',
      base_shipping_cost: String(z.base_shipping_cost || 0),
      estimated_days: z.estimated_days || '', is_active: z.is_active !== false,
    });
    setShowZoneForm(true);
  };

  const handleSaveZone = async () => {
    try {
      const payload = { ...zoneForm, base_shipping_cost: Number(zoneForm.base_shipping_cost) || 0 };
      if (editZone) {
        await hxAdminApi.updateDeliveryZone(editZone.id, payload);
      } else {
        await hxAdminApi.createDeliveryZone(payload);
      }
      setShowZoneForm(false);
      loadZones();
    } catch {}
  };

  const handleDeleteZone = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من حذف هذه المنطقة وجميع أقاليمها؟'))) return;
    try { await hxAdminApi.deleteDeliveryZone(id); loadZones(); } catch {}
  };

  // Region operations
  const openNewRegion = (zoneId: number) => {
    setActiveZoneId(zoneId);
    setEditRegion(null);
    setRegionForm({ name: '', extra_cost: '', is_active: true });
    setShowRegionForm(true);
  };

  const openEditRegion = (zoneId: number, r: HxDeliveryRegion) => {
    setActiveZoneId(zoneId);
    setEditRegion(r);
    setRegionForm({ name: r.name, extra_cost: String(r.extra_cost || 0), is_active: r.is_active !== false });
    setShowRegionForm(true);
  };

  const handleSaveRegion = async () => {
    if (!activeZoneId) return;
    try {
      const payload = { ...regionForm, extra_cost: Number(regionForm.extra_cost) || 0, zone_id: activeZoneId };
      if (editRegion) {
        await hxAdminApi.updateDeliveryRegion(editRegion.id, payload);
      } else {
        await hxAdminApi.createDeliveryRegion(payload);
      }
      setShowRegionForm(false);
      loadZones();
    } catch {}
  };

  const handleDeleteRegion = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من حذف هذا الإقليم؟'))) return;
    try { await hxAdminApi.deleteDeliveryRegion(id); loadZones(); } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>🌍 {t('مناطق التوصيل')}</h2>
        <button onClick={openNewZone} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> {t('إضافة دولة')}
        </button>
      </div>

      <p style={{ fontSize: 13, color: subtext, lineHeight: 1.7 }}>
        {t('قم بإضافة الدول التي تدعم التوصيل إليها، ثم أضف الأقاليم/المناطق مع رسوم الشحن الإضافية لكل منطقة.')}
      </p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 80, borderRadius: 16 }} />)}
        </div>
      ) : zones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: subtext }}>
          <Globe size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>{t('لا توجد مناطق توصيل. أضف الدول التي تدعم التوصيل إليها.')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {zones.map(zone => {
            const isExpanded = expandedZone === zone.id;
            return (
              <div key={zone.id} style={{ background: cardBg, borderRadius: 16, border: `1px solid ${isExpanded ? theme.primary + '50' : border}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                {/* Zone header */}
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedZone(isExpanded ? null : zone.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${theme.primary}12`, color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                      {zone.country_code || '🌍'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: text }}>{zone.country}</h3>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: subtext }}>
                        <span>💰 {t('رسوم التوصيل')}: ${zone.base_shipping_cost || 0}</span>
                        {zone.estimated_days && <span>📅 {zone.estimated_days}</span>}
                        <span>📍 {(zone.regions || []).length} {t('إقليم')}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: zone.is_active !== false ? '#10b98115' : '#ef444415',
                      color: zone.is_active !== false ? '#10b981' : '#ef4444',
                    }}>
                      {zone.is_active !== false ? t('مفعل') : t('معطل')}
                    </span>
                    {isExpanded ? <ChevronUp size={18} style={{ color: subtext }} /> : <ChevronDown size={18} style={{ color: subtext }} />}
                  </div>
                </div>

                {/* Expanded: regions + actions */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${border}`, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                      <button onClick={() => openEditZone(zone)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: theme.primary, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Edit3 size={12} /> {t('تعديل الدولة')}
                      </button>
                      <button onClick={() => handleDeleteZone(zone.id)} style={{ background: '#ef444412', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} /> {t('حذف')}
                      </button>
                    </div>

                    {/* Regions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: text, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Navigation size={14} style={{ color: theme.primary }} /> {t('الأقاليم / المناطق')}
                      </h4>
                      <button onClick={() => openNewRegion(zone.id)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: theme.primary, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Plus size={12} /> {t('إضافة إقليم')}
                      </button>
                    </div>

                    {(!zone.regions || zone.regions.length === 0) ? (
                      <div style={{ padding: 20, textAlign: 'center', color: subtext, fontSize: 13, background: darkMode ? '#111827' : '#f8fafc', borderRadius: 10 }}>
                        {t('لا توجد أقاليم. العميل سيرى فقط الدولة عند اختيار التوصيل.')}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {zone.regions.map(r => (
                          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: darkMode ? '#111827' : '#f8fafc', borderRadius: 10 }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{r.name}</span>
                              {r.extra_cost > 0 && <span style={{ fontSize: 12, color: '#f59e0b', marginRight: 8, marginLeft: 8 }}>+${r.extra_cost}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: r.is_active !== false ? '#10b98115' : '#ef444415', color: r.is_active !== false ? '#10b981' : '#ef4444' }}>
                                {r.is_active !== false ? t('مفعل') : t('معطل')}
                              </span>
                              <button onClick={() => openEditRegion(zone.id, r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.primary, padding: 2 }}><Edit3 size={12} /></button>
                              <button onClick={() => handleDeleteRegion(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div className="hx-modal-overlay" onClick={() => setShowZoneForm(false)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editZone ? t('تعديل الدولة') : t('إضافة دولة جديدة')}</h3>
                <button onClick={() => setShowZoneForm(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('اسم الدولة')}</label>
                  <input className="hx-input" value={zoneForm.country} onChange={e => setZoneForm({ ...zoneForm, country: e.target.value })} placeholder={t('مثال: السعودية')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رمز الدولة')}</label>
                    <input className="hx-input" value={zoneForm.country_code} onChange={e => setZoneForm({ ...zoneForm, country_code: e.target.value })} placeholder="SA" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رسوم التوصيل الأساسية ($)')}</label>
                    <input className="hx-input" type="number" value={zoneForm.base_shipping_cost} onChange={e => setZoneForm({ ...zoneForm, base_shipping_cost: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('مدة التوصيل المتوقعة')}</label>
                  <input className="hx-input" value={zoneForm.estimated_days} onChange={e => setZoneForm({ ...zoneForm, estimated_days: e.target.value })} placeholder={t('مثال: 3-7 أيام عمل')} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: text, cursor: 'pointer' }}>
                  <input type="checkbox" checked={zoneForm.is_active} onChange={e => setZoneForm({ ...zoneForm, is_active: e.target.checked })} />
                  {t('مفعل')}
                </label>
              </div>

              <button onClick={handleSaveZone} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={16} /> {t('حفظ')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Region Form Modal */}
      {showRegionForm && (
        <div className="hx-modal-overlay" onClick={() => setShowRegionForm(false)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editRegion ? t('تعديل الإقليم') : t('إضافة إقليم جديد')}</h3>
                <button onClick={() => setShowRegionForm(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('اسم الإقليم / المنطقة')}</label>
                  <input className="hx-input" value={regionForm.name} onChange={e => setRegionForm({ ...regionForm, name: e.target.value })} placeholder={t('مثال: الرياض')} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رسوم إضافية ($)')}</label>
                  <input className="hx-input" type="number" value={regionForm.extra_cost} onChange={e => setRegionForm({ ...regionForm, extra_cost: e.target.value })} placeholder="0" />
                  <span style={{ fontSize: 11, color: subtext, marginTop: 4, display: 'block' }}>{t('تُضاف إلى رسوم التوصيل الأساسية للدولة')}</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: text, cursor: 'pointer' }}>
                  <input type="checkbox" checked={regionForm.is_active} onChange={e => setRegionForm({ ...regionForm, is_active: e.target.checked })} />
                  {t('مفعل')}
                </label>
              </div>

              <button onClick={handleSaveRegion} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={16} /> {t('حفظ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
