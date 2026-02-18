'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { adminApi } from '@/lib/api';
import { Branch } from '@/lib/types';
import { Plus, Edit3, Trash2, MapPin, Save, X, Star } from 'lucide-react';

export default function BranchesAdminPage() {
  const { currentTheme, darkMode, t } = useTheme();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [isNew, setIsNew] = useState(false);

  const accent = currentTheme.accent || '#e94560';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  const fetchBranches = () => {
    setLoading(true);
    adminApi.getBranches().then((d: { branches?: Branch[] }) => {
      setBranches(d.branches || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleSave = async () => {
    if (!editBranch) return;
    try {
      if (isNew) {
        await adminApi.createBranch(editBranch as unknown as Record<string, unknown>);
      } else {
        await adminApi.updateBranch(editBranch.id, editBranch as unknown as Record<string, unknown>);
      }
      setEditBranch(null);
      fetchBranches();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من الحذف؟'))) return;
    try { await adminApi.deleteBranch(id); fetchBranches(); } catch { /* ignore */ }
  };

  const newBranch = (): Branch => ({
    id: 0, name: '', address: '', city: '', phone: '', is_main: false,
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }} className="anim-fade-up">
        <button className="car-btn-primary" onClick={() => { setEditBranch(newBranch()); setIsNew(true); }}
          style={{ background: accent, borderRadius: 14, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> {t('إضافة فرع')}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 20 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {branches.map((branch, i) => (
            <div key={branch.id} className={`anim-fade-up anim-delay-${(i % 3) + 1}`} style={{
              background: cardBg, borderRadius: 20, padding: 24,
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              transition: 'all 0.3s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} color={accent} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: textColor }}>{branch.name}</h3>
                    {branch.is_main && <span style={{ fontSize: 11, color: accent, fontWeight: 700 }}><Star size={10} style={{ verticalAlign: 'middle' }} /> {t('رئيسي')}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditBranch({...branch}); setIsNew(false); }} style={{ padding: 8, borderRadius: 10, background: '#3b82f615', color: '#3b82f6', display: 'flex' }}><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(branch.id)} style={{ padding: 8, borderRadius: 10, background: '#ef444415', color: '#ef4444', display: 'flex' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <p style={{ color: mutedColor, fontSize: 14, marginBottom: 8 }}>{branch.address}</p>
              <p style={{ color: mutedColor, fontSize: 13 }} dir="ltr">{branch.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editBranch && (
        <div className="car-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setEditBranch(null); }}>
          <div className="car-modal-content" style={{ background: darkMode ? '#14142a' : '#fff', color: textColor }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{isNew ? t('إضافة فرع') : t('تعديل فرع')}</h3>
              <button onClick={() => setEditBranch(null)} style={{ padding: 8, borderRadius: 10, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: textColor }}><X size={18} /></button>
            </div>
            <input className="car-form-input" placeholder={t('اسم الفرع')} value={editBranch.name} onChange={e => setEditBranch({...editBranch, name: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
            <input className="car-form-input" placeholder={t('العنوان')} value={editBranch.address} onChange={e => setEditBranch({...editBranch, address: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
            <input className="car-form-input" placeholder={t('المدينة')} value={editBranch.city} onChange={e => setEditBranch({...editBranch, city: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
            <input className="car-form-input" placeholder={t('الهاتف')} dir="ltr" value={editBranch.phone} onChange={e => setEditBranch({...editBranch, phone: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
            <input className="car-form-input" placeholder={t('البريد الإلكتروني')} value={editBranch.email || ''} onChange={e => setEditBranch({...editBranch, email: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
            <input className="car-form-input" placeholder={t('ساعات العمل')} value={editBranch.working_hours || ''} onChange={e => setEditBranch({...editBranch, working_hours: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: textColor, cursor: 'pointer' }}>
              <input type="checkbox" checked={editBranch.is_main || false} onChange={e => setEditBranch({...editBranch, is_main: e.target.checked})} />
              {t('فرع رئيسي')}
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="car-btn-primary" onClick={handleSave} style={{ flex: 1, background: accent, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Save size={16} /> {t('حفظ')}
              </button>
              <button onClick={() => setEditBranch(null)} style={{ padding: '14px 24px', borderRadius: 14, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textColor, fontWeight: 600 }}>{t('إلغاء')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
