'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import { Car as CarType } from '@/lib/types';
import {
  Search, Fuel, Gauge, Settings2, Star, ChevronDown,
  Calendar, Palette, Users, Filter, X, Award, SlidersHorizontal
} from 'lucide-react';

export default function CarsPage() {
  const { currentTheme, darkMode, t, isRTL } = useTheme();
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [condition, setCondition] = useState<'all' | 'new' | 'used'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [bookingCar, setBookingCar] = useState<CarType | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', notes: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#0a0a12' : '#fafafe';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  useEffect(() => {
    storeApi.getCars().then((data: { products?: CarType[] }) => {
      setCars(data.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))];

  const filtered = cars
    .filter(car => {
      if (condition === 'new' && car.condition !== 'new') return false;
      if (condition === 'used' && car.condition !== 'used') return false;
      if (selectedBrand && car.brand !== selectedBrand) return false;
      if (car.price < priceRange[0] || car.price > priceRange[1]) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return car.name.toLowerCase().includes(q) || car.brand?.toLowerCase().includes(q) || car.model?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return (b.id || 0) - (a.id || 0);
    });

  const formatPrice = (p: number) => new Intl.NumberFormat('ar-SA').format(p) + ' ر.س';

  const handleBooking = async () => {
    try {
      await storeApi.createOrder({ car_id: bookingCar?.id, customer_name: bookingForm.name, customer_phone: bookingForm.phone, notes: bookingForm.notes });
      setBookingSuccess(true);
      setTimeout(() => { setBookingCar(null); setBookingSuccess(false); setBookingForm({ name: '', phone: '', notes: '' }); }, 3000);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ background: bg, color: textColor, minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 100px' }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: 50 }} className="anim-fade-up">
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, marginBottom: 12 }}>
            {t('السيارات')}
          </h1>
          <p style={{ color: mutedColor, fontSize: 16 }}>
            {t('تصفح مجموعتنا الواسعة من السيارات الجديدة والمستعملة')}
          </p>
        </div>

        {/* Filters */}
        <div className="car-filter-bar anim-fade-up anim-delay-2" style={{
          background: cardBg,
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          marginBottom: 32,
        }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: 14, color: mutedColor }} />
            <input
              type="text" placeholder={t('بحث عن سيارة...')} value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="car-filter-input"
              style={{ width: '100%', [isRTL ? 'paddingRight' : 'paddingLeft']: 44, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}
            />
          </div>

          {(['all', 'new', 'used'] as const).map(f => (
            <button key={f} className={`car-filter-chip ${condition === f ? 'active' : ''}`}
              onClick={() => setCondition(f)}
              style={{
                background: condition === f ? accent : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                color: condition === f ? '#fff' : textColor,
                borderColor: condition === f ? accent : 'transparent',
              }}>
              {f === 'all' ? t('الكل') : f === 'new' ? t('جديد') : t('مستعمل')}
            </button>
          ))}

          <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
            className="car-filter-input"
            style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor, appearance: 'none', cursor: 'pointer' }}>
            <option value="">{t('كل الماركات')}</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="car-filter-input"
            style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor, appearance: 'none', cursor: 'pointer' }}>
            <option value="newest">{t('الأحدث')}</option>
            <option value="price_asc">{t('السعر: من الأقل')}</option>
            <option value="price_desc">{t('السعر: من الأعلى')}</option>
          </select>
        </div>

        {/* Results count */}
        <p className="anim-fade-up anim-delay-3" style={{ color: mutedColor, marginBottom: 24, fontSize: 14 }}>
          {loading ? t('جاري التحميل...') : `${filtered.length} ${t('سيارة')}`}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 20 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: mutedColor }}>
            <Search size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 18, fontWeight: 600 }}>{t('لا توجد نتائج')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map((car, i) => (
              <div key={car.id} className={`car-card anim-fade-up anim-delay-${(i % 4) + 1}`}
                style={{ background: cardBg, border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                  <img src={car.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'} alt={car.name} className="car-card-image" loading="lazy" />
                  <div className="car-card-overlay" />
                  <div className="car-card-badge" style={{ background: car.condition === 'new' ? '#10b981' : '#f59e0b', color: '#fff' }}>
                    {car.condition === 'new' ? t('جديدة') : t('مستعملة')}
                  </div>
                  {car.is_featured && <div className="car-card-featured"><Star size={12} style={{ marginLeft: 4 }} />{t('مميزة')}</div>}
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{car.name}</h3>
                  <p style={{ fontSize: 13, color: mutedColor, marginBottom: 14 }}>{car.brand} — {car.model} — {car.year}</p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    {car.fuel_type && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: mutedColor, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8 }}><Fuel size={13} color={accent} /> {car.fuel_type}</span>}
                    {car.transmission && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: mutedColor, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8 }}><Settings2 size={13} color={accent} /> {car.transmission}</span>}
                    {car.horsepower && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: mutedColor, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8 }}><Gauge size={13} color={accent} /> {car.horsepower} {t('حصان')}</span>}
                    {car.mileage && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: mutedColor, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8 }}><Calendar size={13} color={accent} /> {new Intl.NumberFormat('ar-SA').format(car.mileage)} {t('كم')}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 22, fontWeight: 900, color: accent }}>{formatPrice(car.price)}</span>
                      {car.original_price && car.original_price > car.price && (
                        <span style={{ fontSize: 13, color: mutedColor, textDecoration: 'line-through', marginInlineStart: 8 }}>{formatPrice(car.original_price)}</span>
                      )}
                    </div>
                    <button className="car-btn-primary" onClick={() => setBookingCar(car)}
                      style={{ background: accent, borderRadius: 14, padding: '10px 22px', fontSize: 13 }}>
                      {t('احجز الآن')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingCar && (
        <div className="car-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setBookingCar(null); }}>
          <div className="car-modal-content" style={{ background: darkMode ? '#14142a' : '#fff', color: textColor }}>
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: 40 }} className="anim-scale-in">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Award size={36} color="#10b981" />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{t('تم إرسال طلبك بنجاح')}</h3>
                <p style={{ color: mutedColor }}>{t('سنتواصل معك قريباً')}</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t('طلب شراء')}</h3>
                <p style={{ color: mutedColor, marginBottom: 24, fontSize: 14 }}>{bookingCar.name} — {formatPrice(bookingCar.price)}</p>
                <input className="car-form-input" placeholder={t('الاسم الكامل')} value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
                <input className="car-form-input" placeholder={t('رقم الهاتف')} dir="ltr" value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
                <textarea className="car-form-input" placeholder={t('ملاحظات')} rows={3} value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button className="car-btn-primary" onClick={handleBooking} style={{ flex: 1, background: accent, borderRadius: 14, fontSize: 15 }}>{t('إرسال الطلب')}</button>
                  <button onClick={() => setBookingCar(null)} style={{ padding: '14px 24px', borderRadius: 14, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textColor, fontWeight: 600 }}>{t('إلغاء')}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
