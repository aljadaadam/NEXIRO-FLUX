import { useState, useEffect, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, User, Search, ShoppingCart, ChevronDown,
  Star, Shield, Zap, Headphones, Phone, Mail,
  CheckCircle, Heart, Package, Clock, CreditCard,
  HelpCircle, Home, Gamepad2, ChevronLeft, ArrowLeft,
  ExternalLink, Send
} from 'lucide-react';

// ─── Theme System ───
const GXV_THEMES = [
  { id: 'neon-violet', primary: '#8b5cf6', secondary: '#a78bfa', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', glow: '0 0 30px rgba(139,92,246,0.4)' },
  { id: 'cyber-blue', primary: '#06b6d4', secondary: '#22d3ee', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', glow: '0 0 30px rgba(6,182,212,0.4)' },
  { id: 'fire-red', primary: '#ef4444', secondary: '#f87171', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', glow: '0 0 30px rgba(239,68,68,0.4)' },
  { id: 'toxic-green', primary: '#22c55e', secondary: '#4ade80', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', glow: '0 0 30px rgba(34,197,94,0.4)' },
  { id: 'gold-royal', primary: '#f59e0b', secondary: '#fbbf24', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: '0 0 30px rgba(245,158,11,0.4)' },
  { id: 'plasma-pink', primary: '#ec4899', secondary: '#f472b6', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', glow: '0 0 30px rgba(236,72,153,0.4)' },
];

function getLS(key, fb) { try { return localStorage.getItem(key) || fb; } catch { return fb; } }

function useGxvCustom() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = (e) => { if (e.key?.startsWith('gxv_')) setV(x => x + 1); };
    window.addEventListener('storage', h);
    const poll = setInterval(() => setV(x => x + 1), 2000);
    return () => { window.removeEventListener('storage', h); clearInterval(poll); };
  }, []);
  const themeId = getLS('gxv_themeId', 'neon-violet');
  const theme = GXV_THEMES.find(t => t.id === themeId) || GXV_THEMES[0];
  const storeName = getLS('gxv_storeName', 'GX VAULT');
  const showBanner = getLS('gxv_showBanner', 'true') !== 'false';
  return { ...theme, storeName, showBanner, v };
}

const ThemeCtx = createContext(null);

// ─── Mock Data ───
const GAMES = [
  { slug: 'pubg', name: 'PUBG Mobile', icon: '🎯', color: '#f59e0b' },
  { slug: 'fortnite', name: 'Fortnite', icon: '⚡', color: '#3b82f6' },
  { slug: 'freefire', name: 'Free Fire', icon: '🔥', color: '#ef4444' },
  { slug: 'cod', name: 'Call of Duty', icon: '💀', color: '#22c55e' },
  { slug: 'roblox', name: 'Roblox', icon: '🧱', color: '#ec4899' },
  { slug: 'valorant', name: 'Valorant', icon: '🎮', color: '#ef4444' },
];

const PRODUCTS = [
  { id: 1, name: 'PUBG 60 UC', price: 0.99, icon: '🎯', game: 'pubg', desc: 'شحن 60 UC لببجي موبايل' },
  { id: 2, name: 'PUBG 325 UC', price: 4.99, icon: '🎯', game: 'pubg', desc: 'شحن 325 UC لببجي موبايل' },
  { id: 3, name: 'PUBG 660 UC', price: 8.99, icon: '🎯', game: 'pubg', desc: 'شحن 660 UC لببجي موبايل' },
  { id: 4, name: 'PUBG 1800 UC', price: 24.99, icon: '🎯', game: 'pubg', desc: 'شحن 1800 UC لببجي موبايل' },
  { id: 5, name: 'Fortnite 1000 V-Bucks', price: 7.99, icon: '⚡', game: 'fortnite', desc: '1000 V-Bucks لفورتنايت' },
  { id: 6, name: 'Fortnite 2800 V-Bucks', price: 19.99, icon: '⚡', game: 'fortnite', desc: '2800 V-Bucks لفورتنايت' },
  { id: 7, name: 'Free Fire 100 جوهرة', price: 0.99, icon: '🔥', game: 'freefire', desc: '100 جوهرة لفري فاير' },
  { id: 8, name: 'Free Fire 520 جوهرة', price: 4.99, icon: '🔥', game: 'freefire', desc: '520 جوهرة لفري فاير' },
  { id: 9, name: 'Free Fire 1060 جوهرة', price: 9.99, icon: '🔥', game: 'freefire', desc: '1060 جوهرة لفري فاير' },
  { id: 10, name: 'CoD 80 CP', price: 0.99, icon: '💀', game: 'cod', desc: '80 CP لكول اوف ديوتي' },
  { id: 11, name: 'CoD 400 CP', price: 4.99, icon: '💀', game: 'cod', desc: '400 CP لكول اوف ديوتي' },
  { id: 12, name: 'Roblox 400 Robux', price: 4.99, icon: '🧱', game: 'roblox', desc: '400 Robux لروبلوكس' },
  { id: 13, name: 'Roblox 800 Robux', price: 9.99, icon: '🧱', game: 'roblox', desc: '800 Robux لروبلوكس' },
  { id: 14, name: 'Valorant 475 VP', price: 4.99, icon: '🎮', game: 'valorant', desc: '475 VP لفالورانت' },
  { id: 15, name: 'Valorant 1000 VP', price: 9.99, icon: '🎮', game: 'valorant', desc: '1000 VP لفالورانت' },
];

const MOCK_ORDERS = [
  { id: 1042, product: 'PUBG 660 UC', price: 8.99, status: 'مكتمل', statusC: '#22c55e', date: 'منذ 5 دقائق' },
  { id: 1041, product: 'Fortnite 1000 V-Bucks', price: 7.99, status: 'قيد المعالجة', statusC: '#f59e0b', date: 'منذ ساعة' },
  { id: 1040, product: 'Free Fire 520 جوهرة', price: 4.99, status: 'مكتمل', statusC: '#22c55e', date: 'منذ يوم' },
  { id: 1039, product: 'CoD 400 CP', price: 4.99, status: 'ملغي', statusC: '#ef4444', date: 'منذ 3 أيام' },
];

const FAQS = [
  { q: 'كيف أشحن لعبتي؟', a: 'اختر اللعبة ← اختر الباقة ← أدخل معرّف حسابك ← ادفع. يتم الشحن فوراً!' },
  { q: 'كم يستغرق تنفيذ الطلب؟', a: 'معظم الطلبات تُنفَّذ خلال دقائق معدودة. بعض الخدمات قد تستغرق حتى ساعة.' },
  { q: 'هل يمكنني استرجاع أموالي؟', a: 'في حال عدم تنفيذ الطلب، يتم إرجاع المبلغ تلقائياً.' },
  { q: 'هل البيانات آمنة؟', a: 'نستخدم تشفير SSL وأحدث تقنيات الحماية لضمان أمان بياناتك وحسابك.' },
];

const STEPS = [
  { icon: '🎮', title: 'اختر اللعبة', desc: 'تصفّح الألعاب المتاحة' },
  { icon: '💎', title: 'اختر الباقة', desc: 'حدّد كمية الشحن المناسبة' },
  { icon: '🆔', title: 'أدخل المعرّف', desc: 'أدخل ID حسابك في اللعبة' },
  { icon: '⚡', title: 'شحن فوري', desc: 'يتم إرسال الشحن تلقائياً' },
];


// ─── Components ───

function GxvDemoNav({ currentPage, setCurrentPage, mobileOpen, setMobileOpen }) {
  const t = useContext(ThemeCtx);
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'services', label: 'الألعاب', icon: Gamepad2 },
    { id: 'orders', label: 'طلباتي', icon: ShoppingCart },
    { id: 'support', label: 'الدعم', icon: HelpCircle },
  ];

  return (
    <>
      {/* Desktop Nav */}
      <nav style={{
        position: 'fixed', top: 32, right: 0, left: 0, zIndex: 100,
        background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.gradient, display: 'grid', placeItems: 'center' }}>
              <Gamepad2 size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{t.storeName}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: active ? `${t.primary}15` : 'transparent',
                  color: active ? t.primary : '#888',
                  fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}>
                  <Icon size={15} />
                  <span className="gxv-hide-mobile">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <User size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="gxv-mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'none', padding: '8px 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                color: active ? t.primary : '#555',
                fontSize: '0.65rem', fontWeight: 600,
                position: 'relative', padding: '4px 12px',
              }}>
                {active && <div style={{ position: 'absolute', top: -8, width: 20, height: 3, borderRadius: 3, background: t.gradient }} />}
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function GxvDemoFooter() {
  const t = useContext(ThemeCtx);
  return (
    <footer style={{ background: 'rgba(5,5,16,0.9)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px 100px', marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: t.gradient, display: 'grid', placeItems: 'center' }}>
            <Gamepad2 size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{t.storeName}</span>
        </div>
        <p style={{ color: '#555577', fontSize: '0.8rem' }}>
          © 2026 {t.storeName}. Powered by NEXIRO
        </p>
      </div>
    </footer>
  );
}


// ─── PAGES ───

function HomePage({ setPage, setOrderModal }) {
  const t = useContext(ThemeCtx);
  const [selectedGame, setSelectedGame] = useState(null);
  const filtered = selectedGame ? PRODUCTS.filter(p => p.game === selectedGame) : PRODUCTS.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      {t.showBanner && (
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20,
          background: 'rgba(10,10,30,0.6)', border: '1px solid rgba(255,255,255,0.06)',
          padding: '60px 40px', marginBottom: 40, textAlign: 'center',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${t.primary}08`, filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: `${t.secondary || t.primary}08`, filter: 'blur(60px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
              اشحن ألعابك المفضلة <span style={{ color: t.primary }}>بأسرع وقت</span>
            </h1>
            <p style={{ color: '#888', fontSize: '1rem', maxWidth: 500, margin: '0 auto 24px' }}>
              PUBG • Fortnite • Free Fire • Call of Duty • Roblox • Valorant
            </p>
            <button onClick={() => setPage('services')} style={{
              padding: '14px 32px', borderRadius: 14, background: t.gradient, color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700,
              boxShadow: t.glow, display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <Gamepad2 size={18} /> تصفّح الألعاب
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 40 }}>
        {[
          { num: '50K+', label: 'عملية شحن' },
          { num: '10K+', label: 'عميل سعيد' },
          { num: '6+', label: 'ألعاب مدعومة' },
          { num: '⚡', label: 'شحن فوري' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '18px', borderRadius: 14, textAlign: 'center',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: t.primary, marginBottom: 4 }}>{s.num}</div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Games Selector */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
        🎮 اختر اللعبة
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 32 }}>
        <button onClick={() => setSelectedGame(null)} style={{
          padding: '16px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
          background: !selectedGame ? `${t.primary}12` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${!selectedGame ? `${t.primary}40` : 'rgba(255,255,255,0.06)'}`,
          color: !selectedGame ? t.primary : '#888', fontSize: '0.85rem', fontWeight: 700,
        }}>
          📦 الكل
        </button>
        {GAMES.map(g => (
          <button key={g.slug} onClick={() => setSelectedGame(g.slug)} style={{
            padding: '16px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
            background: selectedGame === g.slug ? `${g.color}12` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${selectedGame === g.slug ? `${g.color}40` : 'rgba(255,255,255,0.06)'}`,
            color: selectedGame === g.slug ? g.color : '#888', fontSize: '0.85rem', fontWeight: 700,
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: 4 }}>{g.icon}</span>
            {g.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14, marginBottom: 50 }}>
        {filtered.map(product => {
          const game = GAMES.find(g => g.slug === product.game);
          const ac = game?.color || t.primary;
          return (
            <div key={product.id} style={{
              borderRadius: 16, overflow: 'hidden',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.3s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${ac}30`; e.currentTarget.style.boxShadow = `0 8px 30px ${ac}10`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ height: 3, background: `linear-gradient(90deg, ${ac}, ${ac}60, transparent)` }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.2rem' }}>{product.icon}</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff', flex: 1 }}>{product.name}</span>
                </div>
                <p style={{ color: '#666', fontSize: '0.78rem', marginBottom: 14 }}>{product.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>${product.price}</span>
                  <button onClick={() => setOrderModal(product)} style={{
                    padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${ac}, ${ac}cc)`, color: '#fff',
                    fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: `0 4px 15px ${ac}30`,
                  }}>
                    <ShoppingCart size={14} /> اشحن
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
        كيف تشحن لعبتك؟
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 50 }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{
            padding: '24px', borderRadius: 16, textAlign: 'center',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}>{step.icon}</span>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 4, fontSize: '0.95rem' }}>{step.title}</h4>
            <p style={{ color: '#666', fontSize: '0.78rem' }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
        الأسئلة الشائعة
      </h2>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {FAQS.map((faq, i) => (
          <FAQItem key={i} faq={faq} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  const t = useContext(ThemeCtx);
  return (
    <div style={{
      marginBottom: 8, borderRadius: 14, overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '16px 20px', border: 'none', cursor: 'pointer',
        background: 'transparent', color: '#e8e8ff', fontSize: '0.9rem', fontWeight: 700,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'right',
      }}>
        {faq.q}
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', color: t.primary }} />
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', color: '#888', fontSize: '0.82rem', lineHeight: 1.7 }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}

function ServicesPage({ setOrderModal }) {
  const t = useContext(ThemeCtx);
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState(null);

  const filtered = PRODUCTS.filter(p => {
    if (gameFilter && p.game !== gameFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>🎮 جميع الألعاب</h2>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن لعبة أو باقة..."
          style={{
            width: '100%', padding: '12px 40px 12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
          }}
        />
      </div>

      {/* Game Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => setGameFilter(null)} style={{
          padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: !gameFilter ? `${t.primary}15` : 'rgba(255,255,255,0.03)',
          color: !gameFilter ? t.primary : '#666', fontSize: '0.8rem', fontWeight: 600,
        }}>الكل</button>
        {GAMES.map(g => (
          <button key={g.slug} onClick={() => setGameFilter(g.slug)} style={{
            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: gameFilter === g.slug ? `${g.color}15` : 'rgba(255,255,255,0.03)',
            color: gameFilter === g.slug ? g.color : '#666', fontSize: '0.8rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {g.icon} {g.name}
          </button>
        ))}
      </div>

      {/* Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
        {filtered.map(product => {
          const game = GAMES.find(g => g.slug === product.game);
          const ac = game?.color || t.primary;
          return (
            <div key={product.id} style={{
              borderRadius: 16, overflow: 'hidden',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${ac}, transparent)` }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>{product.icon}</span>
                  <h4 style={{ flex: 1, fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>{product.name}</h4>
                </div>
                <p style={{ color: '#666', fontSize: '0.78rem', marginBottom: 14 }}>{product.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>${product.price}</span>
                  <button onClick={() => setOrderModal(product)} style={{
                    padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${ac}, ${ac}cc)`, color: '#fff',
                    fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <ShoppingCart size={14} /> اشحن
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersPage() {
  const t = useContext(ThemeCtx);
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 20 }}>📋 طلباتي</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MOCK_ORDERS.map(order => (
          <div key={order.id} style={{
            padding: '18px 20px', borderRadius: 14,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>#{order.id}</span>
                <span style={{ padding: '2px 10px', borderRadius: 8, background: `${order.statusC}15`, color: order.statusC, fontSize: '0.7rem', fontWeight: 600 }}>
                  {order.status}
                </span>
              </div>
              <p style={{ color: '#888', fontSize: '0.82rem', margin: 0 }}>{order.product}</p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>${order.price}</div>
              <div style={{ color: '#555', fontSize: '0.72rem' }}>{order.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportPage() {
  const t = useContext(ThemeCtx);
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 20 }}>🎧 الدعم الفني</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { icon: <Mail size={20} />, label: 'البريد الإلكتروني', value: 'support@gxvault.com' },
          { icon: <Phone size={20} />, label: 'الهاتف', value: '+966 50 123 4567' },
          { icon: <Clock size={20} />, label: 'ساعات العمل', value: '24/7' },
        ].map((c, i) => (
          <div key={i} style={{
            padding: '24px', borderRadius: 16, textAlign: 'center',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ color: t.primary, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{c.icon}</div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>{c.label}</h4>
            <p style={{ color: '#888', fontSize: '0.78rem', margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>الأسئلة الشائعة</h3>
      {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
    </div>
  );
}

// ─── Order Modal ───
function OrderModal({ product, onClose }) {
  const t = useContext(ThemeCtx);
  const [playerId, setPlayerId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const game = GAMES.find(g => g.slug === product.game);
  const ac = game?.color || t.primary;

  const handleSubmit = () => {
    if (!playerId.trim()) return;
    setSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420, borderRadius: 20,
        background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
      }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${ac}, ${ac}60, transparent)` }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>{product.icon}</span>
              <div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{product.name}</h3>
                <p style={{ color: '#666', fontSize: '0.78rem', margin: 0 }}>{product.desc}</p>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}><X size={15} /></button>
          </div>

          {!submitted ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                  🆔 معرّف اللاعب (Player ID)
                </label>
                <input
                  type="text" value={playerId} onChange={e => setPlayerId(e.target.value)}
                  placeholder="أدخل معرّف حسابك في اللعبة"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                  }}
                />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>المبلغ الإجمالي</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>${product.price}</span>
              </div>
              <button onClick={handleSubmit} style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: `linear-gradient(135deg, ${ac}, ${ac}cc)`, color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700,
                boxShadow: `0 4px 20px ${ac}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <ShoppingCart size={16} /> تأكيد الشحن
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.1)',
                display: 'grid', placeItems: 'center', margin: '0 auto 16px',
              }}>
                <CheckCircle size={28} color="#22c55e" />
              </div>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                تم إنشاء الطلب بنجاح!
              </h4>
              <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: 4 }}>
                سيتم شحن {product.name} لحسابك خلال دقائق
              </p>
              <p style={{ color: '#555', fontSize: '0.75rem' }}>
                هذا ديمو تجريبي — لا يتم تنفيذ طلبات حقيقية
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── MAIN COMPONENT ───
export default function GxVaultStoreLiveDemo() {
  const theme = useGxvCustom();
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orderModal, setOrderModal] = useState(null);

  return (
    <ThemeCtx.Provider value={theme}>
      <div dir="rtl" style={{
        minHeight: '100vh',
        background: '#050510',
        color: '#e8e8ff',
        fontFamily: 'Tajawal, sans-serif',
      }}>
        {/* Demo Banner */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', padding: '6px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 32,
        }}>
          <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
            🎮 هذا ديمو تجريبي لقالب GX-VAULT — متجر شحن ألعاب
          </span>
          <Link to="/template/game-topup-store" style={{
            padding: '2px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.2)',
            color: '#fff', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            اشترِ الآن <ExternalLink size={10} />
          </Link>
        </div>

        <GxvDemoNav currentPage={currentPage} setCurrentPage={setCurrentPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '112px 24px 40px' }}>
          {currentPage === 'home' && <HomePage setPage={setCurrentPage} setOrderModal={setOrderModal} />}
          {currentPage === 'services' && <ServicesPage setOrderModal={setOrderModal} />}
          {currentPage === 'orders' && <OrdersPage />}
          {currentPage === 'support' && <SupportPage />}
        </main>

        <GxvDemoFooter />

        {orderModal && <OrderModal product={orderModal} onClose={() => setOrderModal(null)} />}

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 768px) {
            .gxv-hide-mobile { display: none !important; }
            .gxv-mobile-nav { display: block !important; }
          }
        `}</style>
      </div>
    </ThemeCtx.Provider>
  );
}
