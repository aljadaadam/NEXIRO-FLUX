'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import { Car as CarType } from '@/lib/types';
import {
  Search, Fuel, Gauge, Settings2, Star, ChevronLeft, ChevronRight,
  Calendar, Palette, Users, Zap, ArrowLeft, ArrowRight, Trophy,
  Shield, Wrench, Award, TrendingUp, Eye
} from 'lucide-react';

export default function HomePage() {
  const { currentTheme, darkMode, t, isRTL, storeName, loaded } = useTheme();
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'used'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingCar, setBookingCar] = useState<CarType | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', notes: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#0a0a12' : '#fafafe';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  useEffect(() => {
    setHeroVisible(true);
    storeApi.getCars().then((data: { products?: CarType[] }) => {
      setCars(data.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredCars = cars.filter(car => {
    if (activeFilter === 'new' && car.condition !== 'new') return false;
    if (activeFilter === 'used' && car.condition !== 'used') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return car.name.toLowerCase().includes(q) || car.brand?.toLowerCase().includes(q) || car.model?.toLowerCase().includes(q);
    }
    return true;
  });

  const featuredCars = cars.filter(c => c.is_featured);

  const handleBooking = async () => {
    try {
      await storeApi.createOrder({ car_id: bookingCar?.id, customer_name: bookingForm.name, customer_phone: bookingForm.phone, notes: bookingForm.notes });
      setBookingSuccess(true);
      setTimeout(() => { setBookingCar(null); setBookingSuccess(false); setBookingForm({ name: '', phone: '', notes: '' }); }, 3000);
    } catch { /* ignore */ }
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('ar-SA').format(p) + ' ر.س';
  };

  return (
    <div style={{ background: bg, color: textColor, minHeight: '100vh' }}>

      {/* ═══════════════════════════════════════════
          HERO SECTION — Full-Screen with particles
         ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="car-hero" style={{ background: darkMode ? 'linear-gradient(180deg, #0a0a12 0%, #0f1628 50%, #0a0a12 100%)' : 'linear-gradient(180deg, #f0f4ff 0%, #e8eeff 50%, #fafafe 100%)' }}>
        {/* Background Particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="car-hero-particle" style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
            background: i % 2 === 0 ? accent : currentTheme.primary,
            opacity: 0.4,
            width: 3 + Math.random() * 5,
            height: 3 + Math.random() * 5,
          }} />
        ))}

        {/* Speed Lines */}
        {[...Array(4)].map((_, i) => (
          <div key={`line-${i}`} className="car-hero-speed-line" style={{
            top: `${20 + i * 18}%`,
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 0.8}s`,
            background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
          }} />
        ))}

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, padding: '120px 24px 60px' }}>
          {/* Badge */}
          <div className={heroVisible ? 'anim-fade-down' : ''} style={{ opacity: heroVisible ? 1 : 0, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 30, background: `${accent}15`, border: `1px solid ${accent}30`, marginBottom: 28, fontSize: 14, fontWeight: 600, color: accent }}>
            <Trophy size={16} />
            <span>{t('أفضل معرض سيارات في المملكة')}</span>
          </div>

          {/* Title */}
          <h1 className={heroVisible ? 'anim-fade-up' : ''} style={{
            opacity: heroVisible ? 1 : 0,
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 24,
            letterSpacing: -1,
          }}>
            {t('اعثر على سيارة')}{' '}
            <span className="gradient-text">{t('أحلامك')}</span>
          </h1>

          {/* Subtitle */}
          <p className={heroVisible ? 'anim-fade-up anim-delay-2' : ''} style={{
            opacity: heroVisible ? 1 : 0,
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: mutedColor,
            lineHeight: 1.7,
            maxWidth: 600,
            margin: '0 auto 40px',
          }}>
            {t('نقدم لك أفضل السيارات الجديدة والمستعملة بأسعار منافسة وضمان شامل')}
          </p>

          {/* CTA Buttons */}
          <div className={heroVisible ? 'anim-fade-up anim-delay-3' : ''} style={{ opacity: heroVisible ? 1 : 0, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/cars" className="car-btn-primary" style={{ background: accent, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={18} />
              {t('تصفح السيارات')}
            </a>
            <a href="/branches" className="car-btn-outline" style={{ borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Eye size={18} />
              {t('زيارة أقرب فرع')}
            </a>
          </div>

          {/* Stats */}
          <div className={heroVisible ? 'anim-fade-up anim-delay-5' : ''} style={{
            opacity: heroVisible ? 1 : 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginTop: 60,
            maxWidth: 700,
            margin: '60px auto 0',
          }}>
            {[
              { num: `${cars.length || 150}+`, label: t('سيارة متاحة'), icon: Zap },
              { num: '3', label: t('فرع'), icon: Star },
              { num: '2000+', label: t('عميل سعيد'), icon: Users },
              { num: '15+', label: t('سنة خبرة'), icon: Award },
            ].map((stat, i) => (
              <div key={i} className="car-stat-item glass-light" style={{ borderRadius: 20, padding: 16 }}>
                <stat.icon size={22} color={accent} style={{ marginBottom: 8 }} />
                <div className="car-stat-number" style={{ color: textColor, fontSize: 28 }}>{stat.num}</div>
                <div style={{ color: mutedColor, fontSize: 12, fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BRANDS MARQUEE
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '40px 0', overflow: 'hidden', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}` }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="car-marquee-track">
            {['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Toyota', 'Lexus', 'Land Rover', 'Hyundai', 'Nissan', 'Kia', 'Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Toyota', 'Lexus', 'Land Rover', 'Hyundai', 'Nissan', 'Kia'].map((brand, i) => (
              <span key={i} style={{ fontSize: 20, fontWeight: 800, color: mutedColor, opacity: 0.4, whiteSpace: 'nowrap', letterSpacing: 2 }}>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CHOOSE US
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 className="section-title anim-fade-up" style={{ color: textColor }}>
            {t('لماذا تختارنا')}
            <span style={{ display: 'block', width: 60, height: 4, background: accent, borderRadius: 2, margin: '12px auto 0' }} />
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            { icon: Shield, title: t('ضمان شامل'), desc: t('نوفر ضمان شامل على جميع السيارات الجديدة والمستعملة') },
            { icon: Wrench, title: t('فحص شامل'), desc: t('كل سيارة تمر بفحص دقيق من 200 نقطة قبل العرض') },
            { icon: TrendingUp, title: t('أسعار منافسة'), desc: t('أفضل الأسعار في السوق مع خيارات تمويل مرنة') },
            { icon: Award, title: t('خبرة طويلة'), desc: t('أكثر من 15 سنة خبرة في مجال السيارات والخدمة المتميزة') },
          ].map((item, i) => (
            <div key={i} className={`anim-fade-up anim-delay-${i + 1}`} style={{
              padding: 32,
              borderRadius: 24,
              background: cardBg,
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`; e.currentTarget.style.borderColor = `${accent}40`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <item.icon size={26} color={accent} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: mutedColor, fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED CARS
         ═══════════════════════════════════════════ */}
      {featuredCars.length > 0 && (
        <section style={{ padding: '60px 24px 80px', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <h2 className="section-title anim-fade-up" style={{ color: textColor }}>
              {t('سيارات مميزة')}
              <span style={{ display: 'block', width: 60, height: 4, background: accent, borderRadius: 2, marginTop: 12 }} />
            </h2>
            <a href="/cars" className="anim-fade-up" style={{ color: accent, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              {t('عرض الكل')}
              {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {featuredCars.slice(0, 4).map((car, i) => (
              <CarCard key={car.id} car={car} index={i} accent={accent} darkMode={darkMode} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} t={t} formatPrice={formatPrice} onBook={() => setBookingCar(car)} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          ALL CARS SECTION WITH FILTERS
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px 100px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="section-title anim-fade-up" style={{ color: textColor }}>
            {t('السيارات')}
            <span style={{ display: 'block', width: 60, height: 4, background: accent, borderRadius: 2, margin: '12px auto 0' }} />
          </h2>
        </div>

        {/* Filter Bar */}
        <div className="car-filter-bar" style={{ background: cardBg, border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 350 }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: 14, color: mutedColor }} />
            <input
              type="text"
              placeholder={t('بحث عن سيارة...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="car-filter-input"
              style={{ width: '100%', [isRTL ? 'paddingRight' : 'paddingLeft']: 44, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}
            />
          </div>
          {(['all', 'new', 'used'] as const).map(f => (
            <button key={f} className={`car-filter-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
              style={{
                background: activeFilter === f ? accent : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                color: activeFilter === f ? '#fff' : textColor,
                borderColor: activeFilter === f ? accent : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              }}>
              {f === 'all' ? t('الكل') : f === 'new' ? t('جديد') : t('مستعمل')}
            </button>
          ))}
        </div>

        {/* Car Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: 400, borderRadius: 20 }} />
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: mutedColor }}>
            <Search size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 18, fontWeight: 600 }}>{t('لا توجد نتائج')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filteredCars.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} accent={accent} darkMode={darkMode} cardBg={cardBg} textColor={textColor} mutedColor={mutedColor} t={t} formatPrice={formatPrice} onBook={() => setBookingCar(car)} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          BOOKING MODAL
         ═══════════════════════════════════════════ */}
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
                <p style={{ color: mutedColor, marginBottom: 24, fontSize: 14 }}>{bookingCar.name}</p>
                <input
                  className="car-form-input" placeholder={t('الاسم الكامل')}
                  value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}
                />
                <input
                  className="car-form-input" placeholder={t('رقم الهاتف')} dir="ltr"
                  value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}
                />
                <textarea
                  className="car-form-input" placeholder={t('ملاحظات')} rows={3}
                  value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button className="car-btn-primary" onClick={handleBooking}
                    style={{ flex: 1, background: accent, borderRadius: 14, fontSize: 15 }}>
                    {t('إرسال الطلب')}
                  </button>
                  <button onClick={() => setBookingCar(null)}
                    style={{ padding: '14px 24px', borderRadius: 14, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textColor, fontWeight: 600 }}>
                    {t('إلغاء')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CAR CARD COMPONENT
   ═══════════════════════════════════════════ */
function CarCard({ car, index, accent, darkMode, cardBg, textColor, mutedColor, t, formatPrice, onBook }: {
  car: CarType; index: number; accent: string; darkMode: boolean; cardBg: string;
  textColor: string; mutedColor: string; t: (k: string) => string;
  formatPrice: (p: number) => string; onBook: () => void;
}) {
  return (
    <div className={`car-card anim-fade-up anim-delay-${(index % 4) + 1}`}
      style={{ background: cardBg, border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
        <img
          src={car.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'}
          alt={car.name}
          className="car-card-image"
          loading="lazy"
        />
        <div className="car-card-overlay" />

        {/* Badges */}
        <div className="car-card-badge" style={{
          background: car.condition === 'new' ? '#10b981' : '#f59e0b',
          color: '#fff',
        }}>
          {car.condition === 'new' ? t('جديدة') : t('مستعملة')}
        </div>

        {car.is_featured && (
          <div className="car-card-featured">
            <Star size={12} style={{ marginLeft: 4 }} />
            {t('مميزة')}
          </div>
        )}

        {car.is_sold && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 900, color: '#ef4444', borderRadius: '20px 20px 0 0',
          }}>
            {t('تم البيع')}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: textColor }}>{car.name}</h3>
        <p style={{ fontSize: 13, color: mutedColor, marginBottom: 14 }}>{car.brand} — {car.model} — {car.year}</p>

        {/* Specs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {car.fuel_type && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: mutedColor, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8 }}>
              <Fuel size={13} color={accent} /> {car.fuel_type}
            </span>
          )}
          {car.transmission && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: mutedColor, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8 }}>
              <Settings2 size={13} color={accent} /> {car.transmission}
            </span>
          )}
          {car.horsepower && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: mutedColor, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8 }}>
              <Gauge size={13} color={accent} /> {car.horsepower} {t('حصان')}
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 22, fontWeight: 900, color: accent }}>{formatPrice(car.price)}</span>
            {car.original_price && car.original_price > car.price && (
              <span style={{ fontSize: 13, color: mutedColor, textDecoration: 'line-through', marginInlineStart: 8 }}>
                {formatPrice(car.original_price)}
              </span>
            )}
          </div>
          <button className="car-btn-primary" onClick={onBook}
            style={{ background: accent, borderRadius: 14, padding: '10px 22px', fontSize: 13 }}>
            {t('احجز الآن')}
          </button>
        </div>
      </div>
    </div>
  );
}
