import { useState, useEffect, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, User, Search, ShoppingCart, ChevronLeft, ChevronRight,
  Star, Shield, Zap, Headphones, DollarSign, Phone, Mail,
  CheckCircle, ArrowLeft, Heart, Eye, Package, Clock, CreditCard,
  Wallet, Lock, Upload, HelpCircle, MessageSquare, Send, Save,
  ChevronDown, ExternalLink, Home, Settings, LogOut, Bell
} from 'lucide-react';

// ─── قراءة التخصيص من localStorage ───
const THEME_LIST = [
  { id: 'purple', primary: '#7c5cff', secondary: '#a78bfa', accent: '#22c55e', gradient: 'linear-gradient(135deg, #7c5cff, #a78bfa)' },
  { id: 'ocean', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#06b6d4', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
  { id: 'emerald', primary: '#10b981', secondary: '#34d399', accent: '#059669', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'rose', primary: '#f43f5e', secondary: '#fb7185', accent: '#e11d48', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  { id: 'amber', primary: '#f59e0b', secondary: '#fbbf24', accent: '#d97706', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'slate', primary: '#475569', secondary: '#64748b', accent: '#334155', gradient: 'linear-gradient(135deg, #475569, #334155)' },
];

function getLS(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }

function useStoreCustomization() {
  const [ver, setVer] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.key?.startsWith('ycz_')) setVer(v => v + 1); };
    window.addEventListener('storage', handler);
    // Re-check every 2s for same-tab changes from dashboard
    const poll = setInterval(() => setVer(v => v + 1), 2000);
    return () => { window.removeEventListener('storage', handler); clearInterval(poll); };
  }, []);

  const themeId = getLS('ycz_themeId', 'purple');
  const theme = THEME_LIST.find(t => t.id === themeId) || THEME_LIST[0];
  const logo = getLS('ycz_logo', '');
  const storeName = getLS('ycz_storeName', 'المتجر');
  const darkMode = getLS('ycz_darkMode', 'false') === 'true';
  const buttonRadius = getLS('ycz_buttonRadius', 'rounded');
  const showBanner = getLS('ycz_showBanner', 'true') !== 'false';

  const pc = theme.primary;
  const sc = theme.secondary;
  const ac = theme.accent;
  const grad = theme.gradient;
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  return { pc, sc, ac, grad, btnR, logo, storeName, darkMode, showBanner, themeId, ver };
}

const ThemeCtx = createContext(null);

// ─── بيانات وهمية ───
const banners = [
  { title: 'مرحباً بك 👋', subtitle: 'متجرك الإلكتروني جاهز', desc: 'أضف منتجاتك وابدأ البيع الآن', gradient: 'linear-gradient(135deg, #7c5cff 0%, #22c55e 100%)' },
  { title: 'خدمات متنوعة ⚡', subtitle: 'كل ما تحتاجه في مكان واحد', desc: 'تصفح الخدمات واطلب بسهولة', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { title: 'دعم فني 🛡️', subtitle: 'نحن هنا لمساعدتك', desc: 'فريق دعم متاح على مدار الساعة', gradient: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' },
];

const featuredProducts = [
  { id: 1, name: 'Sigma Plus - 3 أيام', price: '$12.00', originalPrice: '$15.00', icon: '🔧', category: 'أدوات سوفتوير', available: true, is_featured: 1, service_type: 'SERVER', group_name: 'Sigma Software', allowsQuantity: false, customFields: [{ key: 'username', label: 'اسم المستخدم', placeholder: 'أدخل اسم المستخدم', required: true }], service_time: '1-5 دقائق' },
  { id: 2, name: 'Sigma Plus - سنة كاملة', price: '$42.00', originalPrice: '$55.00', icon: '🔧', category: 'أدوات سوفتوير', available: true, is_featured: 1, service_type: 'SERVER', group_name: 'Sigma Software', allowsQuantity: false, customFields: [{ key: 'username', label: 'اسم المستخدم', placeholder: 'أدخل اسم المستخدم', required: true }], service_time: '1-5 دقائق' },
  { id: 3, name: 'UnlockTool - 12 شهر', price: '$38.50', originalPrice: '$45.00', icon: '🔓', category: 'أدوات سوفتوير', available: true, is_featured: 1, service_type: 'SERVER', group_name: 'UnlockTool', allowsQuantity: false, customFields: [{ key: 'username', label: 'اسم المستخدم', placeholder: 'أدخل اسم المستخدم', required: true }], service_time: '1-10 دقائق' },
  { id: 4, name: 'فحص IMEI كامل (GSX Report)', price: '$2.50', originalPrice: '$5.00', icon: '📱', category: 'خدمات IMEI', available: true, is_featured: 1, service_type: 'IMEI', group_name: 'IMEI Checks', allowsQuantity: false, customFields: [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }], service_time: '1-24 ساعة' },
  { id: 5, name: 'Samsung FRP Remove (All Models)', price: '$8.99', originalPrice: '$12.00', icon: '📱', category: 'خدمات IMEI', available: true, is_featured: 1, service_type: 'IMEI', group_name: 'Samsung Services', allowsQuantity: false, customFields: [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }, { key: 'model', label: 'موديل الجهاز', placeholder: 'مثال: SM-G998B', required: true }], service_time: '1-48 ساعة' },
  { id: 6, name: 'iPhone Network Unlock (AT&T)', price: '$25.00', originalPrice: '$35.00', icon: '📱', category: 'خدمات IMEI', available: true, is_featured: 1, service_type: 'IMEI', group_name: 'iPhone Unlock', allowsQuantity: false, customFields: [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }], service_time: '1-5 أيام' },
  { id: 7, name: 'EFT Dongle - 6 أشهر', price: '$22.00', originalPrice: '$28.00', icon: '🔧', category: 'أدوات سوفتوير', available: true, is_featured: 1, service_type: 'SERVER', group_name: 'EFT Dongle', allowsQuantity: false, customFields: [{ key: 'serial', label: 'رقم السيريال', placeholder: 'أدخل رقم السيريال', required: true }], service_time: '1-5 دقائق' },
  { id: 8, name: 'Chimera Tool - 12 شهر', price: '$55.00', originalPrice: '$65.00', icon: '🔧', category: 'أدوات سوفتوير', available: true, is_featured: 1, service_type: 'SERVER', group_name: 'Chimera Tool', allowsQuantity: false, customFields: [{ key: 'hwid', label: 'HWID', placeholder: 'أدخل رقم HWID', required: true }], service_time: '1-5 دقائق' },
  { id: 9, name: 'iPhone iCloud Unlock (Clean)', price: '$45.00', originalPrice: '$60.00', icon: '📱', category: 'خدمات IMEI', available: true, is_featured: 1, service_type: 'IMEI', group_name: 'iPhone Unlock', allowsQuantity: false, customFields: [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }], service_time: '3-10 أيام' },
  { id: 10, name: 'Z3X Box - سنة', price: '$30.00', originalPrice: '$38.00', icon: '🔧', category: 'أدوات سوفتوير', available: true, is_featured: 1, service_type: 'SERVER', group_name: 'Z3X Box', allowsQuantity: true, minQuantity: 1, maxQuantity: 10, customFields: [{ key: 'username', label: 'اسم المستخدم', placeholder: 'أدخل اسم المستخدم', required: true }], service_time: '1-10 دقائق' },
  { id: 11, name: 'PUBG UC 660', price: '$8.99', originalPrice: '$10.00', icon: '🎮', category: 'ألعاب', available: true, is_featured: 0, service_type: 'CODE', group_name: 'PUBG Mobile', allowsQuantity: true, minQuantity: 1, maxQuantity: 50, customFields: [{ key: 'player_id', label: 'معرف اللاعب', placeholder: 'أدخل Player ID', required: true }], service_time: '1-5 دقائق' },
  { id: 12, name: 'فري فاير 520 جوهرة', price: '$5.99', originalPrice: '$7.00', icon: '🎮', category: 'ألعاب', available: true, is_featured: 0, service_type: 'CODE', group_name: 'Free Fire', allowsQuantity: true, minQuantity: 1, maxQuantity: 20, customFields: [{ key: 'player_id', label: 'معرف اللاعب', placeholder: 'أدخل Player ID', required: true }], service_time: '1-5 دقائق' },
  { id: 13, name: 'Huawei FRP Remove', price: '$6.50', originalPrice: '$9.00', icon: '📱', category: 'خدمات IMEI', available: true, is_featured: 0, service_type: 'IMEI', group_name: 'Huawei Services', allowsQuantity: false, customFields: [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }], service_time: '1-24 ساعة' },
  { id: 14, name: 'Octoplus Box - 6 أشهر', price: '$18.00', originalPrice: '$24.00', icon: '🔧', category: 'أدوات سوفتوير', available: true, is_featured: 0, service_type: 'SERVER', group_name: 'Octoplus', allowsQuantity: false, customFields: [{ key: 'username', label: 'اسم المستخدم', placeholder: 'أدخل اسم المستخدم', required: true }], service_time: '1-5 دقائق' },
  { id: 15, name: 'Samsung MDM Remove', price: '$15.00', originalPrice: '$20.00', icon: '📱', category: 'خدمات IMEI', available: true, is_featured: 0, service_type: 'IMEI', group_name: 'Samsung Services', allowsQuantity: false, customFields: [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }, { key: 'model', label: 'موديل الجهاز', placeholder: 'مثال: SM-A536B', required: true }], service_time: '1-48 ساعة' },
];

const categories = [
  { id: 'all', name: 'الكل', icon: '📦' },
  { id: 'أدوات سوفتوير', name: 'أدوات سوفتوير', icon: '🛠️' },
  { id: 'خدمات IMEI', name: 'خدمات IMEI', icon: '📱' },
  { id: 'ألعاب', name: 'ألعاب', icon: '🎮' },
];

const steps = [
  { icon: '�', title: 'اختر الخدمة', desc: 'تصفح واختر الخدمة المناسبة' },
  { icon: '📝', title: 'أدخل البيانات', desc: 'أدخل المعلومات المطلوبة' },
  { icon: '💳', title: 'ادفع بأمان', desc: 'اختر طريقة الدفع المناسبة' },
  { icon: '✅', title: 'استلم فوراً', desc: 'احصل على الخدمة خلال دقائق' },
];

const faqs = [
  { q: 'كم يستغرق تنفيذ الطلب؟', a: 'معظم الخدمات تُنفّذ خلال 1-24 ساعة حسب نوع الخدمة.' },
  { q: 'هل الدفع آمن؟', a: 'نعم، نستخدم بوابات دفع مشفرة ومعتمدة عالمياً.' },
  { q: 'ماذا لو فشل الطلب؟', a: 'يتم استرداد المبلغ كاملاً أو إعادة المحاولة مجاناً.' },
  { q: 'هل يوجد دعم فني؟', a: 'نعم، فريق الدعم متاح 24/7 عبر التذاكر والواتساب.' },
];

// ─── المكونات ───

function DemoHeader({ currentPage, setCurrentPage, mobileMenuOpen, setMobileMenuOpen }) {
  const t = useContext(ThemeCtx);
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'services', label: 'الخدمات', icon: Package },
    { id: 'orders', label: 'طلباتي', icon: ShoppingCart },
    { id: 'support', label: 'الدعم', icon: HelpCircle },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        {/* Mobile: notification icon */}
        <button className="demo-mobile-toggle" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#0b1020', padding: 4, position: 'relative' }}>
          <Bell size={20} />
          <div style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
        </button>

        {/* Nav */}
        <nav className="demo-desktop-nav" style={{ display: 'flex', gap: '0.25rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.5rem 1rem', borderRadius: t.btnR,
                  border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  fontFamily: 'Tajawal, sans-serif',
                  background: currentPage === item.id ? t.pc : 'transparent',
                  color: currentPage === item.id ? '#fff' : '#64748b',
                  transition: 'all 0.3s',
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {t.logo ? (
            <img src={t.logo} alt="logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.grad, display: 'grid', placeItems: 'center' }}>
              <Zap size={18} color="#fff" />
            </div>
          )}
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', fontFamily: 'Tajawal, sans-serif' }}>{t.storeName}</span>
        </div>

        {/* Profile */}
        <button
          onClick={() => setCurrentPage('profile')}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: currentPage === 'profile' ? `2px solid ${t.pc}` : '1px solid #e2e8f0',
            background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}
        >
          <User size={16} color="#64748b" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', background: currentPage === item.id ? `${t.pc}10` : '#fff', color: currentPage === item.id ? t.pc : '#334155', textAlign: 'right', width: '100%' }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function HeroBanner() {
  const t = useContext(ThemeCtx);
  const [active, setActive] = useState(0);
  useEffect(() => { const i = setInterval(() => setActive(p => (p + 1) % banners.length), 4500); return () => clearInterval(i); }, []);

  const dynamicBanners = [
    { ...banners[0], gradient: `linear-gradient(135deg, ${t.pc} 0%, ${t.ac} 100%)` },
    banners[1],
    banners[2],
  ];
  const b = dynamicBanners[active];

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: b.gradient, padding: '2rem 1.5rem', marginBottom: '1.5rem', transition: 'all 0.5s', minHeight: 150 }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: 4, color: '#fff' }}>{b.title}</p>
        <h2 className="demo-banner-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{b.subtitle}</h2>
        <p style={{ fontSize: '0.82rem', opacity: 0.75, color: '#fff', marginBottom: 14 }}>{b.desc}</p>
        <button style={{ padding: '0.5rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          تسوق الآن
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
        {banners.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 24 : 8, height: 8, borderRadius: 4, background: i === active ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const t = useContext(ThemeCtx);
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '1rem',
      cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }} className="demo-product-card">
      <div style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: 8, height: 48, display: 'grid', placeItems: 'center', background: '#f8fafc', borderRadius: 10 }}>
        {product.icon}
      </div>
      <p style={{ fontSize: '0.7rem', color: t.pc, fontWeight: 600, marginBottom: 4 }}>{product.category}</p>
      <h4 style={{
        fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 8, lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '2.52rem',
      }}>{product.name}</h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: t.pc }}>{product.price}</span>
          {product.originalPrice && <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', marginRight: 6 }}>{product.originalPrice}</span>}
        </div>
        <div style={{ padding: '0.35rem 0.75rem', borderRadius: t.btnR, background: product.available ? '#dcfce7' : '#fee2e2', color: product.available ? '#16a34a' : '#dc2626', fontSize: '0.7rem', fontWeight: 700 }}>
          {product.available ? 'متاح' : 'نفذ'}
        </div>
      </div>
    </div>
  );
}

function OrderModal({ product, onClose }) {
  const t = useContext(ThemeCtx);
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [qty, setQty] = useState(product.minQuantity || 1);

  const demoWalletBalance = 125.50;
  const parsePriceToNumber = (price) => {
    const cleaned = String(price || '').replace(/[^0-9.]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };
  const unitPrice = parsePriceToNumber(product.price);
  const totalPrice = unitPrice * qty;
  const canPayWithWallet = demoWalletBalance >= totalPrice;

  const orderFields = Array.isArray(product.customFields) && product.customFields.length > 0
    ? product.customFields
    : String(product.service_type || '').toUpperCase() === 'IMEI'
      ? [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }]
      : [];

  const allRequiredFilled = orderFields
    .filter(f => f.required !== false)
    .every(f => (formValues[f.key] || '').trim().length > 0);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep(2); }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 440, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020' }}>طلب المنتج</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {step === 1 && (
          <>
            {/* Product Info Card */}
            <div style={{ display: 'flex', gap: 12, padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontSize: '2rem', width: 50, height: 50, display: 'grid', placeItems: 'center', background: '#fff', borderRadius: 10 }}>{product.icon}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 2 }}>{product.name}</h4>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: t.pc }}>{product.price}</p>
                {product.service_time && (
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> مدة التنفيذ: {product.service_time}
                  </p>
                )}
              </div>
            </div>

            {/* Wallet Balance Bar */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #334155)', borderRadius: 12, padding: '0.75rem 1rem',
              marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wallet size={16} color="#94a3b8" />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>رصيد المحفظة</span>
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: canPayWithWallet ? '#22c55e' : '#ef4444' }}>
                ${demoWalletBalance.toFixed(2)}
              </span>
            </div>

            {/* Quantity Input */}
            {product.allowsQuantity && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>الكمية</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setQty(q => Math.max(product.minQuantity || 1, q - 1))} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '1rem', display: 'grid', placeItems: 'center' }}>−</button>
                  <input value={qty} onChange={e => setQty(Math.max(product.minQuantity || 1, Math.min(product.maxQuantity || 100, Number(e.target.value) || 1)))} style={{ width: 60, textAlign: 'center', padding: '0.5rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
                  <button onClick={() => setQty(q => Math.min(product.maxQuantity || 100, q + 1))} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '1rem', display: 'grid', placeItems: 'center' }}>+</button>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: 4 }}>(الإجمالي: ${totalPrice.toFixed(2)})</span>
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {orderFields.map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  value={formValues[field.key] || ''}
                  onChange={e => setFormValues(v => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!allRequiredFilled || submitting}
              style={{ width: '100%', marginTop: 8, padding: '0.75rem', borderRadius: t.btnR, background: t.pc, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: allRequiredFilled ? 'pointer' : 'not-allowed', fontFamily: 'Tajawal, sans-serif', opacity: allRequiredFilled ? 1 : 0.6 }}>
              {submitting ? 'جارٍ إرسال الطلب...' : 'تقديم الطلب'}
            </button>

            {!canPayWithWallet && (
              <p style={{ marginTop: 10, fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>
                الرصيد غير كافٍ لإتمام الطلب (المطلوب: ${totalPrice.toFixed(2)})
              </p>
            )}
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>تم إرسال الطلب بنجاح!</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>سيتم معالجة طلبك خلال دقائق. يمكنك متابعة حالة الطلب من صفحة &ldquo;طلباتي&rdquo;.</p>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 6 }}>الرصيد المتبقي: <strong style={{ color: '#0b1020' }}>${(demoWalletBalance - totalPrice).toFixed(2)}</strong></p>
            <button onClick={onClose} style={{ marginTop: 20, padding: '0.65rem 2rem', borderRadius: t.btnR, background: t.pc, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>حسناً</button>
          </div>
        )}
      </div>
    </div>
  );
}

function WalletChargeModal({ onClose }) {
  const t = useContext(ThemeCtx);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(false);

  const methods = [
    { id: 'binance', name: 'Binance Pay', icon: '₿', color: '#f0b90b', desc: 'USDT — شبكة TRC20' },
    { id: 'paypal', name: 'PayPal', icon: '💳', color: '#003087', desc: 'تحويل عبر PayPal' },
    { id: 'bank', name: 'تحويل بنكي', icon: '🏦', color: '#059669', desc: 'حوالة بنكية مباشرة' },
    { id: 'vodafone', name: 'محفظة إلكترونية', icon: '📱', color: '#e60000', desc: 'فودافون كاش / STC Pay' },
  ];

  const presetAmounts = [5, 10, 25, 50, 100];

  const paymentInfo = {
    binance: [
      { label: 'العنوان', value: 'TXrk8a...dK7VzH8' },
      { label: 'الشبكة', value: 'TRC20 (Tron)' },
      { label: 'العملة', value: 'USDT' },
    ],
    paypal: [
      { label: 'إيميل PayPal', value: 'pay@store-demo.com' },
      { label: 'ملاحظة', value: 'أرسل كـ Friends & Family' },
    ],
    bank: [
      { label: 'البنك', value: 'بنك الراجحي' },
      { label: 'اسم الحساب', value: 'مؤسسة المتجر التقني' },
      { label: 'IBAN', value: 'SA03 8000 0000 6080 1016 7519' },
    ],
    vodafone: [
      { label: 'رقم المحفظة', value: '01XX XXX XXXX' },
      { label: 'الاسم', value: 'محمد أحمد' },
    ],
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1020' }}>
            {step === 1 ? '💰 شحن المحفظة' : step === 2 ? '📋 تفاصيل الدفع' : step === 3 ? '📎 رفع الإيصال' : '✅ تم الإرسال'}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Amount + Method */}
        {step === 1 && (
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 10, display: 'block' }}>المبلغ ($)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {presetAmounts.map(a => (
                <button key={a} onClick={() => setAmount(String(a))} style={{
                  padding: '0.5rem 1rem', borderRadius: 10, border: amount === String(a) ? `2px solid ${t.pc}` : '1px solid #e2e8f0',
                  background: amount === String(a) ? `${t.pc}10` : '#f8fafc', color: amount === String(a) ? t.pc : '#64748b',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', minWidth: 48,
                }}>${a}</button>
              ))}
            </div>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="أو أدخل مبلغ مخصص" type="number" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.88rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 10, display: 'block' }}>طريقة الدفع</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {methods.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem',
                  borderRadius: 12, cursor: 'pointer', width: '100%', fontFamily: 'Tajawal, sans-serif', textAlign: 'right',
                  border: method === m.id ? `2px solid ${t.pc}` : '1px solid #e2e8f0',
                  background: method === m.id ? `${t.pc}08` : '#fff',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, color: m.color, display: 'grid', placeItems: 'center', fontSize: '1.2rem', fontWeight: 800, flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020' }}>{m.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.desc}</p>
                  </div>
                  {method === m.id && <CheckCircle size={18} color={t.pc} />}
                </button>
              ))}
            </div>

            <button onClick={() => amount && method && setStep(2)} disabled={!amount || !method} style={{
              width: '100%', marginTop: 20, padding: '0.75rem', borderRadius: t.btnR,
              background: amount && method ? t.pc : '#e2e8f0', color: amount && method ? '#fff' : '#94a3b8',
              border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: amount && method ? 'pointer' : 'not-allowed',
              fontFamily: 'Tajawal, sans-serif',
            }}>متابعة — ${amount || '0'}</button>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && method && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${t.pc}, ${t.ac})`, borderRadius: 14, padding: '1.25rem', marginBottom: 20, color: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>المبلغ المطلوب</p>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>${amount}</p>
              <p style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 4 }}>عبر {methods.find(m => m.id === method)?.name}</p>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 14, padding: '1.25rem', marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} color={t.pc} /> بيانات التحويل
              </h4>
              {paymentInfo[method]?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < paymentInfo[method].length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020', direction: 'ltr', maxWidth: '60%', textAlign: 'left', wordBreak: 'break-all' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.6 }}>تأكد من إرسال المبلغ الصحيح. بعد التحويل أرفق إيصال الدفع للتأكيد.</p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.7rem', borderRadius: t.btnR, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>رجوع</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, padding: '0.7rem', borderRadius: t.btnR, background: t.pc, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Upload size={14} /> رفع الإيصال
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Receipt */}
        {step === 3 && (
          <div>
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: 16, padding: '2.5rem 1rem', textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: receipt ? '#f0fdf4' : '#fafafa' }} onClick={() => setReceipt(true)}>
              {receipt ? (
                <>
                  <CheckCircle size={40} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>تم رفع الإيصال بنجاح</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>receipt_2026.jpg</p>
                </>
              ) : (
                <>
                  <Upload size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>اضغط لرفع صورة الإيصال</p>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>JPG, PNG — حد أقصى 5MB</p>
                </>
              )}
            </div>

            <input placeholder="ملاحظات إضافية (اختياري)" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.7rem', borderRadius: t.btnR, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>رجوع</button>
              <button onClick={() => receipt && setStep(4)} disabled={!receipt} style={{
                flex: 2, padding: '0.7rem', borderRadius: t.btnR,
                background: receipt ? t.pc : '#e2e8f0', color: receipt ? '#fff' : '#94a3b8',
                border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: receipt ? 'pointer' : 'not-allowed',
                fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}><Send size={14} /> إرسال للمراجعة</button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>تم إرسال طلب الشحن!</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 6 }}>سيتم مراجعة الإيصال وإضافة الرصيد لمحفظتك خلال دقائق.</p>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: 10, background: '#f0f9ff', marginBottom: 20 }}>
              <span style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>رقم العملية: #WC-{Math.floor(Math.random() * 9000 + 1000)}</span>
            </div>
            <br />
            <button onClick={onClose} style={{ padding: '0.7rem 2.5rem', borderRadius: t.btnR, background: t.pc, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>حسناً</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── الصفحات ───

function HomePage({ onProductClick }) {
  const t = useContext(ThemeCtx);
  return (
    <>
      <HeroBanner />

      {/* Featured Products */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🔥 المنتجات المميزة</h3>
          <button onClick={() => {}} style={{ background: 'none', border: 'none', color: t.pc, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>عرض الكل ←</button>
        </div>
        <div className="demo-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {(featuredProducts.filter(p => p.is_featured).length > 0 ? featuredProducts.filter(p => p.is_featured) : featuredProducts).slice(0, 15).map(p => (
            <ProductCard key={p.id} product={p} onClick={() => onProductClick(p)} />
          ))}
        </div>
      </section>

      {/* How to Order */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', textAlign: 'center', marginBottom: '1.5rem' }}>كيف تطلب؟</h3>
        <div className="demo-steps-grid">
          {steps.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{step.icon}</div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.pc, color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 8px', fontSize: '0.8rem', fontWeight: 800 }}>{i + 1}</div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{step.title}</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', textAlign: 'center', marginBottom: '1.5rem' }}>لماذا نحن؟</h3>
        <div className="demo-about-grid">
          {[
            { icon: <Zap size={24} />, title: 'تنفيذ سريع', desc: 'طلباتك تُنفَّذ خلال دقائق', color: '#f59e0b' },
            { icon: <Shield size={24} />, title: 'حماية بياناتك', desc: 'تشفير SSL وحماية متقدمة', color: '#3b82f6' },
            { icon: <DollarSign size={24} />, title: 'أسعار منافسة', desc: 'أفضل أسعار في السوق', color: '#22c55e' },
            { icon: <Headphones size={24} />, title: 'دعم مستمر', desc: 'فريق دعم متاح على مدار الساعة', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}15`, color: item.color, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                {item.icon}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{item.title}</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ServicesPage({ onProductClick }) {
  const t = useContext(ThemeCtx);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGroup, setActiveGroup] = useState('all');
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Group filter logic matching real store
  const groupSourceCategory = activeCategory === 'أدوات سوفتوير' || activeCategory === 'خدمات IMEI'
    ? activeCategory : '';

  const availableGroups = groupSourceCategory
    ? [...new Set(featuredProducts
        .filter(p => p.category === groupSourceCategory)
        .map(p => (p.group_name || '').trim())
        .filter(g => g.length > 0)
      )]
    : [];

  // Reset group when category changes
  useEffect(() => { setActiveGroup('all'); setGroupsOpen(false); }, [activeCategory]);

  const filtered = featuredProducts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchGroup = activeGroup === 'all' || (p.group_name || '').trim() === activeGroup;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.includes(searchQuery);
    return matchCat && matchGroup && matchSearch;
  });

  return (
    <>
      {/* Banner */}
      <div style={{ borderRadius: 20, overflow: 'hidden', background: `linear-gradient(135deg, ${t.pc}, ${t.ac})`, padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>تصفّح جميع خدماتنا</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>اختر الخدمة المناسبة من بين مجموعة واسعة</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            padding: '0.5rem 1rem', borderRadius: t.btnR, border: 'none', cursor: 'pointer',
            background: activeCategory === cat.id ? t.pc : '#fff',
            color: activeCategory === cat.id ? '#fff' : '#64748b',
            fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Search + Group Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1rem', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', marginBottom: 20, position: 'relative' }}>
        <Search size={16} color="#94a3b8" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث في الخدمات..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', color: '#0b1020', background: 'transparent' }} />

        {/* Group Dropdown */}
        <div style={{ position: 'relative', minWidth: 0, width: 'clamp(140px, 42vw, 240px)' }}>
          <button
            onClick={() => setGroupsOpen(v => !v)}
            disabled={!groupSourceCategory}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 0.7rem', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: groupSourceCategory ? '#334155' : '#94a3b8',
              cursor: groupSourceCategory ? 'pointer' : 'not-allowed',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
              width: '100%', minWidth: 0, justifyContent: 'space-between', overflow: 'hidden',
            }}
          >
            <span style={{ flex: 1, minWidth: 0, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
              {activeGroup === 'all' ? 'اختر الجروب' : activeGroup}
            </span>
            <ChevronDown size={14} />
          </button>

          {groupsOpen && groupSourceCategory && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              width: '100%', minWidth: 220, background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 20,
              maxHeight: 260, overflowY: 'auto',
            }}>
              <button
                onClick={() => { setActiveGroup('all'); setGroupsOpen(false); }}
                style={{
                  width: '100%', textAlign: 'right', padding: '0.6rem 0.8rem', border: 'none', background: activeGroup === 'all' ? '#f8fafc' : '#fff',
                  fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', cursor: 'pointer', color: '#334155',
                }}
              >
                كل الجروبات
              </button>
              {availableGroups.length === 0 ? (
                <div style={{ padding: '0.7rem 0.8rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  لا توجد جروبات ضمن هذا التصنيف
                </div>
              ) : (
                availableGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => { setActiveGroup(group); setGroupsOpen(false); }}
                    style={{
                      width: '100%', textAlign: 'right', padding: '0.6rem 0.8rem', border: 'none', background: activeGroup === group ? '#f8fafc' : '#fff',
                      fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', cursor: 'pointer', color: '#334155',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {group}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="demo-products-grid">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onClick={() => onProductClick(p)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</p>
          <p>لا توجد نتائج مطابقة</p>
        </div>
      )}
    </>
  );
}

function OrdersPage() {
  const t = useContext(ThemeCtx);
  const [filter, setFilter] = useState('all');
  const orders = [
    { id: '#10042', product: 'Sigma Plus - 3 أيام', date: '2026-02-15', price: '$12.00', status: 'مكتمل', statusKey: 'completed', statusColor: '#16a34a', statusBg: '#dcfce7', server_response: 'Username: demo_user\nPassword: xxxxxxxx\nExpiry: 2026-02-18' },
    { id: '#10041', product: 'Samsung FRP Remove', date: '2026-02-14', price: '$8.99', status: 'قيد المعالجة', statusKey: 'processing', statusColor: '#f59e0b', statusBg: '#fef3c7', server_response: null },
    { id: '#10040', product: 'UnlockTool - 12 شهر', date: '2026-02-13', price: '$38.50', status: 'مكتمل', statusKey: 'completed', statusColor: '#16a34a', statusBg: '#dcfce7', server_response: 'Username: unlock_demo\nActivation Code: XXXX-XXXX-XXXX' },
    { id: '#10039', product: 'فحص IMEI كامل (GSX Report)', date: '2026-02-12', price: '$2.50', status: 'مكتمل', statusKey: 'completed', statusColor: '#16a34a', statusBg: '#dcfce7', server_response: 'Model: iPhone 15 Pro Max\nColor: Natural Titanium\nCarrier: AT&T (Locked)\nFMI: OFF\nCoverage: Active' },
    { id: '#10038', product: 'iPhone Network Unlock (AT&T)', date: '2026-02-10', price: '$25.00', status: 'مرفوض', statusKey: 'failed', statusColor: '#dc2626', statusBg: '#fee2e2', server_response: 'الجهاز غير مؤهل لفتح الشبكة — تم استرداد المبلغ' },
    { id: '#10037', product: 'EFT Dongle - 6 أشهر', date: '2026-02-08', price: '$22.00', status: 'مكتمل', statusKey: 'completed', statusColor: '#16a34a', statusBg: '#dcfce7', server_response: 'Serial: EFT-DEMO-XXXX\nExpiry: 2026-08-08' },
    { id: '#10036', product: 'Chimera Tool - 12 شهر', date: '2026-02-05', price: '$55.00', status: 'مسترد', statusKey: 'refunded', statusColor: '#8b5cf6', statusBg: '#f5f3ff', server_response: 'تم استرداد المبلغ للمحفظة' },
  ];

  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'completed', label: 'مكتملة' },
    { key: 'processing', label: 'قيد المعالجة' },
    { key: 'failed', label: 'مرفوضة' },
    { key: 'refunded', label: 'مستردة' },
  ];

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.statusKey === filter);

  return (
    <>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>📋 سجل الطلبات</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: filter === f.key ? t.pc : '#f1f5f9', color: filter === f.key ? '#fff' : '#64748b',
            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredOrders.map(order => (
          <div key={order.id} style={{ background: '#fff', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{order.id}</span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: order.statusBg, color: order.statusColor }}>{order.status}</span>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{order.product}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
              <span>{order.date}</span>
              <span style={{ fontWeight: 700, color: '#0b1020' }}>{order.price}</span>
            </div>

            {/* Server Response for completed orders */}
            {order.server_response && order.statusKey === 'completed' && (
              <div style={{ marginTop: 10, padding: '0.75rem', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> نتيجة الخدمة:
                </p>
                <pre style={{ fontSize: '0.75rem', color: '#0b1020', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontFamily: 'monospace', lineHeight: 1.6 }}>{order.server_response}</pre>
              </div>
            )}

            {/* Rejection reason for failed orders */}
            {order.server_response && order.statusKey === 'failed' && (
              <div style={{ marginTop: 10, padding: '0.75rem', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={12} /> سبب الرفض:
                </p>
                <p style={{ fontSize: '0.78rem', color: '#991b1b', margin: 0 }}>{order.server_response}</p>
              </div>
            )}

            {/* Refund info */}
            {order.server_response && order.statusKey === 'refunded' && (
              <div style={{ marginTop: 10, padding: '0.75rem', background: '#f5f3ff', borderRadius: 10, border: '1px solid #ddd6fe' }}>
                <p style={{ fontSize: '0.78rem', color: '#6d28d9', margin: 0 }}>{order.server_response}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>📦</p>
          <p>لا توجد طلبات بهذا الفلتر</p>
        </div>
      )}
    </>
  );
}

function SupportPage() {
  const t = useContext(ThemeCtx);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${t.pc}, ${t.sc})`, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>مركز الدعم</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>نحن هنا لمساعدتك</p>
      </div>

      {/* Contact Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: '2rem' }}>
        {[
          { icon: <MessageSquare size={20} />, title: 'واتساب', desc: 'تواصل مباشر', color: '#25d366' },
          { icon: <Mail size={20} />, title: 'البريد', desc: 'support@store.com', color: '#3b82f6' },
          { icon: <Phone size={20} />, title: 'اتصل بنا', desc: '+966 xxx xxx xxxx', color: '#8b5cf6' },
        ].map((m, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', textAlign: 'center', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, color: m.color, display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>{m.icon}</div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{m.title}</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 12 }}>الأسئلة الشائعة</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0b1020', textAlign: 'right' }}>{faq.q}</span>
              <ChevronDown size={16} color="#94a3b8" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.7 }}>{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      {/* Ticket Form */}
      <div style={{ marginTop: '2rem', background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>إرسال تذكرة دعم</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="الموضوع" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
          <textarea placeholder="اكتب رسالتك هنا..." rows={4} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical' }} />
          <button style={{ padding: '0.7rem', borderRadius: t.btnR, background: t.pc, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Send size={16} /> إرسال
          </button>
        </div>
      </div>
    </>
  );
}

function ProfilePage({ onChargeWallet }) {
  const t = useContext(ThemeCtx);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tab, setTab] = useState('login');
  const [view, setView] = useState('menu');
  const [personalData, setPersonalData] = useState({ name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+966 5XX XXX XXX', country: 'السعودية' });
  const [personalSaved, setPersonalSaved] = useState(false);

  const transactions = [
    { id: '#WC-4821', type: 'شحن', amount: '+$50.00', method: 'Binance', date: '2026-02-13', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7' },
    { id: '#WC-4820', type: 'شراء', amount: '-$12.00', method: 'Sigma Plus', date: '2026-02-12', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7' },
    { id: '#WC-4819', type: 'شحن', amount: '+$25.00', method: 'PayPal', date: '2026-02-10', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7' },
    { id: '#WC-4818', type: 'شراء', amount: '-$8.99', method: 'PUBG UC', date: '2026-02-09', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7' },
    { id: '#WC-4817', type: 'شحن', amount: '+$100.00', method: 'تحويل بنكي', date: '2026-02-07', status: 'قيد المراجعة', statusColor: '#f59e0b', statusBg: '#fef3c7' },
    { id: '#WC-4816', type: 'استرجاع', amount: '+$2.50', method: 'فحص IMEI', date: '2026-02-05', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7' },
  ];

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
            {['login', 'register'].map(t2 => (
              <button key={t2} onClick={() => setTab(t2)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.85rem', fontWeight: 600, background: tab === t2 ? '#fff' : 'transparent', color: tab === t2 ? t.pc : '#94a3b8', boxShadow: tab === t2 ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {t2 === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'register' && (
              <input placeholder="الاسم الكامل" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            )}
            <input placeholder="البريد الإلكتروني" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            <input type="password" placeholder="كلمة المرور" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            <button onClick={() => setIsLoggedIn(true)} style={{ padding: '0.75rem', borderRadius: t.btnR, background: t.pc, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
              {tab === 'login' ? 'دخول' : 'إنشاء حساب'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Personal Info Sub-View ───
  if (view === 'personal') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.pc, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${t.pc}, ${t.ac})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px', position: 'relative' }}>
              <User size={30} color="#fff" />
              <button style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: t.pc, border: '2px solid #fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <Upload size={10} color="#fff" />
              </button>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>البيانات الشخصية</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'الاسم الكامل', type: 'text' },
              { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
              { key: 'phone', label: 'رقم الهاتف', type: 'tel' },
              { key: 'country', label: 'الدولة', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={personalData[field.key]}
                  onChange={e => { setPersonalData(d => ({ ...d, [field.key]: e.target.value })); setPersonalSaved(false); }}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>كلمة المرور الجديدة</label>
              <input type="password" placeholder="اتركه فارغاً إذا لم ترد تغييرها" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => setPersonalSaved(true)} style={{
              padding: '0.75rem', borderRadius: t.btnR,
              background: personalSaved ? '#16a34a' : t.pc,
              color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.3s',
            }}>
              {personalSaved ? <><CheckCircle size={16} /> تم الحفظ</> : <><Save size={16} /> حفظ التغييرات</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Wallet Sub-View ───
  if (view === 'wallet') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.pc, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>

        {/* Balance Card */}
        <div style={{ background: `linear-gradient(135deg, ${t.pc}, ${t.sc})`, borderRadius: 18, padding: '1.75rem', marginBottom: 20, color: '#fff' }}>
          <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: 4 }}>رصيدك الحالي</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>$125.50</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={onChargeWallet} style={{ padding: '0.55rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
              <DollarSign size={14} /> شحن رصيد
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'إجمالي الشحن', value: '$175.00', color: '#22c55e' },
            { label: 'إجمالي الشراء', value: '$49.49', color: '#f59e0b' },
            { label: 'المسترجع', value: '$2.50', color: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '1rem 0.75rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 12 }}>سجل العمليات</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.1rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{tx.type}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{tx.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.method}</span>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.date}</span>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: tx.amount.startsWith('+') ? '#16a34a' : '#ef4444', direction: 'ltr' }}>{tx.amount}</p>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: tx.statusBg, color: tx.statusColor }}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Security / Verification Sub-View ───
  if (view === 'security') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.pc, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color={t.pc} /> التحقق من الهوية
          </h3>

          {/* Verification Status */}
          <div style={{ background: '#fffbeb', borderRadius: 14, padding: '1.25rem', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>غير متحقق</p>
              <p style={{ fontSize: '0.78rem', color: '#b45309' }}>يرجى رفع بطاقة هوية لتوثيق حسابك</p>
            </div>
          </div>

          {/* Benefits */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 10 }}>مميزات التوثيق:</p>
            {[
              'رفع حد السحب والشحن',
              'أولوية في معالجة الطلبات',
              'الوصول لعروض حصرية',
              'حماية إضافية للحساب',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CheckCircle size={14} color="#22c55e" />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Upload ID */}
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 10 }}>رفع صورة الهوية</p>
          <div style={{ border: '2px dashed #e2e8f0', borderRadius: 14, padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <Upload size={28} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>اضغط لرفع صورة بطاقة الهوية</p>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: 4 }}>JPG, PNG — حد أقصى 5MB</p>
          </div>

          <button style={{ width: '100%', padding: '0.75rem', borderRadius: t.btnR, background: t.pc, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Send size={14} /> إرسال للتوثيق
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Menu ───
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Avatar & Name */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${t.pc}, ${t.ac})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <User size={36} color="#fff" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1020' }}>أحمد محمد</h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>ahmed@example.com</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '0.3rem 0.75rem', borderRadius: 20, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <Clock size={12} color="#f59e0b" />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#92400e' }}>غير متحقق</span>
        </div>
      </div>

      {/* Wallet */}
      <div style={{ background: `linear-gradient(135deg, ${t.pc}, ${t.sc})`, borderRadius: 16, padding: '1.5rem', marginBottom: 20, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>رصيد المحفظة</p>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>$125.50</p>
          </div>
          <Wallet size={32} style={{ opacity: 0.3 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={onChargeWallet} style={{ padding: '0.5rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            شحن المحفظة
          </button>
          <button onClick={() => setView('wallet')} style={{ padding: '0.5rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            التفاصيل
          </button>
        </div>
      </div>

      {/* Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: <User size={18} />, label: 'البيانات الشخصية', color: '#3b82f6', action: () => setView('personal') },
          { icon: <Wallet size={18} />, label: 'المحفظة والعمليات', color: '#22c55e', action: () => setView('wallet') },
          { icon: <CreditCard size={18} />, label: 'شحن الرصيد', color: '#f59e0b', action: onChargeWallet },
          { icon: <ShoppingCart size={18} />, label: 'طلباتي', color: '#8b5cf6', action: () => {} },
          { icon: <Shield size={18} />, label: 'التحقق من الهوية', color: '#06b6d4', action: () => setView('security') },
          { icon: <Bell size={18} />, label: 'الإشعارات', color: '#8b5cf6', action: () => {}, badge: 3 },
          { icon: <Settings size={18} />, label: 'الإعدادات', color: '#64748b', action: () => {} },
          { icon: <LogOut size={18} />, label: 'تسجيل الخروج', color: '#ef4444', action: () => setIsLoggedIn(false) },
        ].map((item, i) => (
          <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', cursor: 'pointer', width: '100%', fontFamily: 'Tajawal, sans-serif', textAlign: 'right' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, color: item.color, display: 'grid', placeItems: 'center' }}>{item.icon}</div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: item.color === '#ef4444' ? '#ef4444' : '#0b1020', flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'grid', placeItems: 'center' }}>{item.badge}</span>
            )}
            <ChevronLeft size={16} color="#cbd5e1" />
          </button>
        ))}
      </div>
    </div>
  );
}

function DemoFooter() {
  return (
    <footer className="demo-footer" style={{ background: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: '1.75rem 0 5.5rem', borderTop: '1px solid #f1f5f9', marginTop: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>نحن نقبل</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Binance', 'PayPal', 'Bank'].map(m => (
                <span key={m} style={{ padding: '0.3rem 0.75rem', borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{m}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>روابط مهمة</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['سياسة الخصوصية', 'الشروط والأحكام', 'سياسة الاسترجاع'].map(l => (
                <span key={l} style={{ fontSize: '0.78rem', color: '#64748b', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>تواصل معنا</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['📘', '📸', '💬'].map((s, i) => (
                <span key={i} style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: '1.1rem' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>© 2026 المتجر. جميع الحقوق محفوظة — قالب من NEXIRO-FLUX</p>
        </div>
      </div>
    </footer>
  );
}

function MobileBottomNav({ currentPage, setCurrentPage }) {
  const t = useContext(ThemeCtx);
  const items = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'services', label: 'الخدمات', icon: Package },
    { id: 'orders', label: 'طلباتي', icon: ShoppingCart },
    { id: 'support', label: 'الدعم', icon: HelpCircle },
    { id: 'profile', label: 'حسابي', icon: User },
  ];

  return (
    <nav className="demo-bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      padding: '0.4rem 0.5rem 0.6rem',
      display: 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 500, margin: '0 auto' }}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem',
              fontFamily: 'Tajawal, sans-serif', transition: 'all 0.2s',
              position: 'relative',
            }}>
              {isActive && <div style={{ position: 'absolute', top: -6, width: 24, height: 3, borderRadius: 2, background: t.pc }} />}
              <Icon size={20} color={isActive ? t.pc : '#94a3b8'} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 800 : 500, color: isActive ? t.pc : '#94a3b8' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── المكون الرئيسي ───

export default function YCZStoreLiveDemo() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const theme = useStoreCustomization();

  return (
    <ThemeCtx.Provider value={theme}>
    <div dir="rtl" style={{ fontFamily: 'Tajawal, Cairo, sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#0b1020' }}>
      {/* Demo Banner */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: `linear-gradient(90deg, ${theme.pc}, ${theme.ac})`,
        padding: '0.5rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>🎯 هذا عرض ديمو تجريبي — <Link to="/template/digital-services-store" style={{ color: '#fff', textDecoration: 'underline' }}>اشترِ القالب الآن</Link></span>
      </div>

      <DemoHeader currentPage={currentPage} setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        {currentPage === 'home' && <HomePage onProductClick={setSelectedProduct} />}
        {currentPage === 'services' && <ServicesPage onProductClick={setSelectedProduct} />}
        {currentPage === 'orders' && <OrdersPage />}
        {currentPage === 'support' && <SupportPage />}
        {currentPage === 'profile' && <ProfilePage onChargeWallet={() => setWalletModalOpen(true)} />}
      </main>

      <DemoFooter />
      <MobileBottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {selectedProduct && <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {walletModalOpen && <WalletChargeModal onClose={() => setWalletModalOpen(false)} />}

      <style>{`
        .demo-products-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .demo-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .demo-about-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .demo-product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }

        @media (max-width: 1024px) {
          .demo-products-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .demo-products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .demo-steps-grid { grid-template-columns: repeat(2, 1fr); }
          .demo-about-grid { grid-template-columns: repeat(2, 1fr); }
          .demo-mobile-toggle { display: block !important; }
          .demo-desktop-nav { display: none !important; }
          .demo-bottom-nav { display: block !important; }
          .demo-footer { padding-bottom: 5.5rem !important; }
        }
        @media (max-width: 480px) {
          .demo-products-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .demo-steps-grid { grid-template-columns: 1fr 1fr; }
          .demo-about-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 360px) {
          .demo-products-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      </div>
    </ThemeCtx.Provider>
  );
}
