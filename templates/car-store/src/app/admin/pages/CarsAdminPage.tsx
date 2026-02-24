'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { adminApi } from '@/lib/api';
import { Car } from '@/lib/types';
import { Plus, Edit3, Trash2, Search, X, Save, Image } from 'lucide-react';

export default function CarsAdminPage() {
  const { currentTheme, darkMode, t } = useTheme();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');

  const accent = currentTheme.accent || '#e94560';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  const fetchCars = () => {
    setLoading(true);
    adminApi.getCars().then((d: { products?: Car[] }) => {
      setCars(d.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCars(); }, []);

  const handleSave = async () => {
    if (!editCar) return;
    try {
      if (isNew) {
        await adminApi.createCar(editCar as unknown as Record<string, unknown>);
      } else {
        await adminApi.updateCar(editCar.id, editCar as unknown as Record<string, unknown>);
      }
      setEditCar(null);
      fetchCars();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من الحذف؟'))) return;
    try {
      await adminApi.deleteCar(id);
      fetchCars();
    } catch { /* ignore */ }
  };

  const filtered = cars.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.brand?.toLowerCase().includes(q);
  });

  const formatPrice = (p: number) => new Intl.NumberFormat('ar-SA').format(p);

  const newCar = (): Car => ({
    id: 0, name: '', brand: '', model: '', year: new Date().getFullYear(), price: 0,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: '', engine: '',
    images: [], description: '',
  });

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }} className="anim-fade-up">
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: mutedColor }} />
          <input placeholder={t('بحث...')} value={search} onChange={e => setSearch(e.target.value)}
            className="car-filter-input" style={{ width: '100%', paddingRight: 40, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
        </div>
        <button className="car-btn-primary" onClick={() => { setEditCar(newCar()); setIsNew(true); }}
          style={{ background: accent, borderRadius: 14, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> {t('إضافة سيارة')}
        </button>
      </div>

      {/* Cars Table */}
      <div style={{ background: cardBg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} className="anim-fade-up anim-delay-2">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: mutedColor }}>{t('جاري التحميل...')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <th style={{ color: mutedColor }}>{t('الصورة')}</th>
                  <th style={{ color: mutedColor }}>{t('الاسم')}</th>
                  <th style={{ color: mutedColor }}>{t('الماركة')}</th>
                  <th style={{ color: mutedColor }}>{t('السنة')}</th>
                  <th style={{ color: mutedColor }}>{t('الحالة')}</th>
                  <th style={{ color: mutedColor }}>{t('السعر')}</th>
                  <th style={{ color: mutedColor }}>{t('إجراءات')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(car => (
                  <tr key={car.id} style={{ background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <td>
                      {car.images?.[0] ? (
                        <img src={car.images[0]} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div style={{ width: 56, height: 40, borderRadius: 8, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Image size={16} color={mutedColor} />
                        </div>
                      )}
                    </td>
                    <td style={{ color: textColor, fontWeight: 700 }}>{car.name}</td>
                    <td style={{ color: mutedColor }}>{car.brand}</td>
                    <td style={{ color: mutedColor }}>{car.year}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 700,
                        background: car.condition === 'new' ? '#10b98115' : '#f59e0b15',
                        color: car.condition === 'new' ? '#10b981' : '#f59e0b',
                      }}>
                        {car.condition === 'new' ? t('جديدة') : t('مستعملة')}
                      </span>
                    </td>
                    <td style={{ color: accent, fontWeight: 700 }}>{formatPrice(car.price)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditCar({ ...car }); setIsNew(false); }}
                          style={{ padding: 8, borderRadius: 10, background: '#3b82f615', color: '#3b82f6', display: 'flex' }}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(car.id)}
                          style={{ padding: 8, borderRadius: 10, background: '#ef444415', color: '#ef4444', display: 'flex' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editCar && (
        <div className="car-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setEditCar(null); }}>
          <div className="car-modal-content" style={{ background: darkMode ? '#14142a' : '#fff', color: textColor, maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{isNew ? t('إضافة سيارة') : t('تعديل سيارة')}</h3>
              <button onClick={() => setEditCar(null)} style={{ padding: 8, borderRadius: 10, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: textColor }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input className="car-form-input" placeholder={t('اسم السيارة')} value={editCar.name} onChange={e => setEditCar({...editCar, name: e.target.value})} style={{ gridColumn: '1/-1', background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('الماركة')} value={editCar.brand} onChange={e => setEditCar({...editCar, brand: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('الموديل')} value={editCar.model} onChange={e => setEditCar({...editCar, model: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('السنة')} type="number" value={editCar.year} onChange={e => setEditCar({...editCar, year: parseInt(e.target.value) || 0})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('السعر')} type="number" value={editCar.price} onChange={e => setEditCar({...editCar, price: parseInt(e.target.value) || 0})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <select className="car-form-input" value={editCar.condition} onChange={e => setEditCar({...editCar, condition: e.target.value as 'new' | 'used'})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}>
                <option value="new">{t('جديدة')}</option>
                <option value="used">{t('مستعملة')}</option>
              </select>
              <input className="car-form-input" placeholder={t('نوع الوقود')} value={editCar.fuel_type} onChange={e => setEditCar({...editCar, fuel_type: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('ناقل الحركة')} value={editCar.transmission} onChange={e => setEditCar({...editCar, transmission: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('اللون')} value={editCar.color} onChange={e => setEditCar({...editCar, color: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('المحرك')} value={editCar.engine} onChange={e => setEditCar({...editCar, engine: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('القوة (حصان)')} type="number" value={editCar.horsepower || ''} onChange={e => setEditCar({...editCar, horsepower: parseInt(e.target.value) || undefined})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('عدد المقاعد')} type="number" value={editCar.seats || ''} onChange={e => setEditCar({...editCar, seats: parseInt(e.target.value) || undefined})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <input className="car-form-input" placeholder={t('رابط الصورة')} value={editCar.images?.[0] || ''} onChange={e => setEditCar({...editCar, images: [e.target.value]})} style={{ gridColumn: '1/-1', background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
              <textarea className="car-form-input" placeholder={t('الوصف')} value={editCar.description || ''} onChange={e => setEditCar({...editCar, description: e.target.value})} rows={3} style={{ gridColumn: '1/-1', background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="car-btn-primary" onClick={handleSave} style={{ flex: 1, background: accent, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Save size={16} /> {t('حفظ')}
              </button>
              <button onClick={() => setEditCar(null)} style={{ padding: '14px 24px', borderRadius: 14, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textColor, fontWeight: 600 }}>
                {t('إلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
