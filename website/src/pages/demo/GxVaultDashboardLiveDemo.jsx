import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  Bell, Settings, LogOut, Search, Menu, X, ChevronDown, ChevronLeft,
  ChevronRight, Plus, Edit, Trash2, Eye, Check,
  TrendingUp, DollarSign, ArrowUpRight,
  BarChart3, Calendar, RefreshCw,
  Megaphone, CheckCircle, Clock, Zap, Shield,
  User, Link2, Globe, Palette,
  Type, Moon, Sun, Save, ExternalLink, Gamepad2, Send
} from 'lucide-react';

// ─── Theme ───
const GXV_THEMES = [
  { id: 'neon-violet', name: 'بنفسجي نيون', primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', glow: '0 0 30px rgba(139,92,246,0.4)' },
  { id: 'cyber-blue', name: 'أزرق سايبر', primary: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', glow: '0 0 30px rgba(6,182,212,0.4)' },
  { id: 'fire-red', name: 'أحمر ناري', primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', glow: '0 0 30px rgba(239,68,68,0.4)' },
  { id: 'toxic-green', name: 'أخضر سام', primary: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', glow: '0 0 30px rgba(34,197,94,0.4)' },
  { id: 'gold-royal', name: 'ذهبي ملكي', primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: '0 0 30px rgba(245,158,11,0.4)' },
  { id: 'plasma-pink', name: 'وردي بلازما', primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', glow: '0 0 30px rgba(236,72,153,0.4)' },
];

function getLS(k, fb) { try { return localStorage.getItem(k) || fb; } catch { return fb; } }
function setLS(k, v) { try { localStorage.setItem(k, v); } catch {} }

// ─── Mock Data ───
const statsData = [
  { label: 'إجمالي الإيرادات', value: '$8,240', change: '+22.5%', up: true, icon: DollarSign, color: '#8b5cf6' },
  { label: 'طلبات اليوم', value: '124', change: '+8.3%', up: true, icon: ShoppingCart, color: '#22c55e' },
  { label: 'المستخدمين', value: '1,850', change: '+15.2%', up: true, icon: Users, color: '#06b6d4' },
  { label: 'المنتجات', value: '48', change: '+3', up: true, icon: Package, color: '#f59e0b' },
  { label: 'الأرباح', value: '$2,150', change: '+18.7%', up: true, icon: TrendingUp, color: '#ec4899' },
  { label: 'طلبات الآن', value: '12', change: '', up: true, icon: Zap, color: '#ef4444' },
];

const recentOrders = [
  { id: '#2042', user: 'أحمد محمد', product: 'PUBG 660 UC', price: '$8.99', status: 'مكتمل', statusC: '#22c55e', date: 'منذ 3 دقائق', avatar: '🎯' },
  { id: '#2041', user: 'سارة أحمد', product: 'Fortnite 1000 V-Bucks', price: '$7.99', status: 'قيد المعالجة', statusC: '#f59e0b', date: 'منذ 10 دقائق', avatar: '⚡' },
  { id: '#2040', user: 'خالد علي', product: 'Free Fire 520 جوهرة', price: '$4.99', status: 'مكتمل', statusC: '#22c55e', date: 'منذ 25 دقيقة', avatar: '🔥' },
  { id: '#2039', user: 'ليلى حسن', product: 'CoD 400 CP', price: '$4.99', status: 'ملغي', statusC: '#ef4444', date: 'منذ ساعة', avatar: '💀' },
  { id: '#2038', user: 'محمد يوسف', product: 'Roblox 800 Robux', price: '$9.99', status: 'مكتمل', statusC: '#22c55e', date: 'منذ ساعتين', avatar: '🧱' },
  { id: '#2037', user: 'نور الدين', product: 'Valorant 1000 VP', price: '$9.99', status: 'قيد المعالجة', statusC: '#f59e0b', date: 'منذ 3 ساعات', avatar: '🎮' },
];

const products = [
  { id: 1, name: 'PUBG 60 UC', price: '$0.99', game: 'PUBG', sales: 456, status: true },
  { id: 2, name: 'PUBG 325 UC', price: '$4.99', game: 'PUBG', sales: 312, status: true },
  { id: 3, name: 'PUBG 660 UC', price: '$8.99', game: 'PUBG', sales: 234, status: true },
  { id: 4, name: 'Fortnite 1000 V-Bucks', price: '$7.99', game: 'Fortnite', sales: 189, status: true },
  { id: 5, name: 'Fortnite 2800 V-Bucks', price: '$19.99', game: 'Fortnite', sales: 98, status: true },
  { id: 6, name: 'Free Fire 100 جوهرة', price: '$0.99', game: 'Free Fire', sales: 567, status: true },
  { id: 7, name: 'Free Fire 520 جوهرة', price: '$4.99', game: 'Free Fire', sales: 345, status: true },
  { id: 8, name: 'CoD 80 CP', price: '$0.99', game: 'CoD', sales: 123, status: true },
  { id: 9, name: 'CoD 400 CP', price: '$4.99', game: 'CoD', sales: 87, status: true },
  { id: 10, name: 'Roblox 400 Robux', price: '$4.99', game: 'Roblox', sales: 234, status: true },
];

const users = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', orders: 23, balance: '$85.50', joined: '2025-06-15', status: 'نشط', statusC: '#22c55e' },
  { id: 2, name: 'سارة أحمد', email: 'sara@example.com', orders: 15, balance: '$32.00', joined: '2025-08-01', status: 'نشط', statusC: '#22c55e' },
  { id: 3, name: 'خالد علي', email: 'khaled@example.com', orders: 42, balance: '$0.00', joined: '2025-03-20', status: 'نشط', statusC: '#22c55e' },
  { id: 4, name: 'ليلى حسن', email: 'laila@example.com', orders: 5, balance: '$12.50', joined: '2025-09-28', status: 'محظور', statusC: '#ef4444' },
  { id: 5, name: 'محمد يوسف', email: 'moh@example.com', orders: 31, balance: '$120.00', joined: '2025-01-10', status: 'نشط', statusC: '#22c55e' },
];

const announcements = [
  { id: 1, title: 'عرض خاص — PUBG UC', content: 'خصم 20% على جميع باقات PUBG UC لمدة أسبوع!', date: '2026-02-14', active: true },
  { id: 2, title: 'لعبة جديدة — Valorant', content: 'تمت إضافة شحن Valorant VP. اشحن الآن!', date: '2026-02-10', active: true },
  { id: 3, title: 'صيانة مجدولة', content: 'صيانة للخوادم الجمعة 2-4 صباحاً', date: '2026-02-08', active: false },
];

const sources = [
  { id: 1, name: 'DhruFusion API', type: 'API', products: 24, status: 'متصل', statusC: '#22c55e' },
  { id: 2, name: 'GameSync Pro', type: 'API', products: 18, status: 'متصل', statusC: '#22c55e' },
  { id: 3, name: 'TopUp Direct', type: 'Manual', products: 6, status: 'غير متصل', statusC: '#ef4444' },
];

const chartData = [45, 62, 38, 75, 52, 88, 65, 92, 48, 72, 85, 95];
const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];


// ─── Sidebar ───
function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, theme }) {
  const menuItems = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'payments', label: 'بوابات الدفع', icon: CreditCard },
    { id: 'sources', label: 'مصادر خارجية', icon: Link2 },
    { id: 'customize', label: 'تخصيص الواجهة', icon: Palette },
    { id: 'announcements', label: 'الإعلانات', icon: Megaphone },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        width: collapsed ? 70 : 250, minHeight: 'calc(100vh - 32px)',
        background: '#0a0a1a', borderLeft: '1px solid rgba(255,255,255,0.06)',
        position: 'fixed', right: 0, top: 32, zIndex: 50,
        display: 'flex', flexDirection: 'column', transition: 'width 0.3s', overflow: 'hidden',
      }} className="gxv-desk-sidebar">
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 8px' : '20px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.gradient, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Gamepad2 size={16} color="#fff" />
          </div>
          {!collapsed && <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>GX VAULT</span>}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '12px 0' : '10px 14px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active ? `${theme.primary}12` : 'transparent',
                color: active ? theme.primary : '#777',
                fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                transition: 'all 0.2s', width: '100%', textAlign: 'right',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}>
                {active && <div style={{ position: 'absolute', right: 0, top: '20%', height: '60%', width: 3, borderRadius: 3, background: theme.gradient }} />}
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          padding: '14px', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'none', border: 'none', color: '#555', cursor: 'pointer',
          display: 'flex', justifyContent: 'center',
        }}>
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="gxv-mob-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)', display: 'none', padding: '6px 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {menuItems.slice(0, 6).map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                color: active ? theme.primary : '#555', fontSize: '0.6rem', fontWeight: 600, padding: '4px 6px',
              }}>
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}


// ─── Header ───
function Header({ title, theme }) {
  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 24, flexWrap: 'wrap', gap: 12,
    }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{
          width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer',
          display: 'grid', placeItems: 'center', position: 'relative',
        }}>
          <Bell size={16} />
          <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
        </button>
        <button style={{
          padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer',
          fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <LogOut size={14} /> خروج
        </button>
      </div>
    </header>
  );
}


// ─── Pages ───

function OverviewPage({ theme }) {
  const maxVal = Math.max(...chartData);
  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{
              padding: '18px', borderRadius: 14,
              background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}12`, display: 'grid', placeItems: 'center' }}>
                  <Icon size={16} color={stat.color} />
                </div>
                {stat.change && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: stat.up ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ArrowUpRight size={10} /> {stat.change}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#666' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div style={{
        padding: '20px', borderRadius: 16, marginBottom: 24,
        background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>📊 إيرادات الشهور</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
          {chartData.map((val, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', maxWidth: 30, height: `${(val / maxVal) * 100}%`,
                borderRadius: '6px 6px 0 0', background: theme.gradient, minHeight: 6,
                transition: 'height 0.5s',
              }} />
              <span style={{ fontSize: '0.55rem', color: '#555', whiteSpace: 'nowrap' }}>{months[i]?.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{
        padding: '20px', borderRadius: 16,
        background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>🕐 آخر الطلبات</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                {['#', 'العميل', 'المنتج', 'المبلغ', 'الحالة', 'التاريخ'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.72rem', color: '#555', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem', color: '#bbb', fontWeight: 600 }}>{order.id}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1rem' }}>{order.avatar}</span>
                      <span style={{ fontSize: '0.82rem', color: '#ddd' }}>{order.user}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem', color: '#888' }}>{order.product}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>{order.price}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 6, background: `${order.statusC}12`, color: order.statusC, fontSize: '0.7rem', fontWeight: 600 }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#555' }}>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ theme }) {
  const [search, setSearch] = useState('');
  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
            style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e8e8ff', fontSize: '0.82rem', outline: 'none', fontFamily: 'Tajawal' }}
          />
        </div>
        <button style={{ padding: '10px 18px', borderRadius: 10, background: theme.gradient, color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> إضافة منتج
        </button>
      </div>
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                {['المنتج', 'اللعبة', 'السعر', 'المبيعات', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontSize: '0.72rem', color: '#555', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#ddd', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#888' }}>{p.game}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{p.price}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#888' }}>{p.sales}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 6, background: p.status ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: p.status ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: 600 }}>
                      {p.status ? 'متاح' : 'معطّل'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', display: 'flex', gap: 4 }}>
                    <button style={{ width: 30, height: 30, borderRadius: 6, background: `${theme.primary}10`, border: 'none', color: theme.primary, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={12} /></button>
                    <button style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: 'none', color: '#f87171', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersPage({ theme }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const statuses = ['all', 'مكتمل', 'قيد المعالجة', 'ملغي'];
  const filtered = recentOrders.filter(o => statusFilter === 'all' || o.status === statusFilter);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: statusFilter === s ? `${theme.primary}15` : 'rgba(255,255,255,0.03)',
            color: statusFilter === s ? theme.primary : '#666', fontSize: '0.8rem', fontWeight: 600,
          }}>{s === 'all' ? 'الكل' : s}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(order => (
          <div key={order.id} style={{
            padding: '16px 20px', borderRadius: 14,
            background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <span style={{ fontSize: '1.1rem' }}>{order.avatar}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ color: '#ddd', fontWeight: 700, fontSize: '0.88rem' }}>{order.id}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 6, background: `${order.statusC}12`, color: order.statusC, fontSize: '0.68rem', fontWeight: 600 }}>{order.status}</span>
                </div>
                <span style={{ color: '#666', fontSize: '0.78rem' }}>{order.user} — {order.product}</span>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>{order.price}</div>
              <div style={{ color: '#555', fontSize: '0.7rem' }}>{order.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersPage({ theme }) {
  return (
    <div>
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                {['المستخدم', 'الطلبات', 'الرصيد', 'الحالة', 'التسجيل'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontSize: '0.72rem', color: '#555', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '12px 14px' }}>
                    <div>
                      <div style={{ color: '#ddd', fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</div>
                      <div style={{ color: '#555', fontSize: '0.72rem' }}>{u.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#888' }}>{u.orders}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{u.balance}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 6, background: `${u.statusC}12`, color: u.statusC, fontSize: '0.7rem', fontWeight: 600 }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: '#555' }}>{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentsPage({ theme }) {
  const gateways = [
    { name: 'Binance Pay', icon: '₿', status: 'مفعّل', statusC: '#22c55e', desc: 'دفع بالعملات الرقمية' },
    { name: 'PayPal', icon: '💳', status: 'مفعّل', statusC: '#22c55e', desc: 'PayPal Checkout' },
    { name: 'USDT (TRC20)', icon: '💰', status: 'معطّل', statusC: '#f59e0b', desc: 'تحويل USDT مباشر' },
    { name: 'تحويل بنكي', icon: '🏦', status: 'مفعّل', statusC: '#22c55e', desc: 'حوالة بنكية' },
  ];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {gateways.map((gw, i) => (
          <div key={i} style={{
            padding: '24px', borderRadius: 16,
            background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: '2rem' }}>{gw.icon}</span>
              <span style={{ padding: '4px 12px', borderRadius: 8, background: `${gw.statusC}12`, color: gw.statusC, fontSize: '0.7rem', fontWeight: 600 }}>{gw.status}</span>
            </div>
            <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 4px', fontSize: '0.95rem' }}>{gw.name}</h4>
            <p style={{ color: '#666', fontSize: '0.78rem', margin: 0 }}>{gw.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourcesPage({ theme }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button style={{ padding: '10px 18px', borderRadius: 10, background: theme.gradient, color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> ربط مصدر جديد
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sources.map(src => (
          <div key={src.id} style={{
            padding: '18px 20px', borderRadius: 14,
            background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Link2 size={15} style={{ color: theme.primary }} />
                <span style={{ color: '#ddd', fontWeight: 700, fontSize: '0.92rem' }}>{src.name}</span>
                <span style={{ padding: '2px 10px', borderRadius: 6, background: `${src.statusC}12`, color: src.statusC, fontSize: '0.68rem', fontWeight: 600 }}>{src.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: '#555' }}>
                <span>{src.type}</span>
                <span>{src.products} منتج</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ade80', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={12} /> مزامنة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomizePage({ theme, themeId, setThemeId }) {
  const [storeName, setStoreName] = useState(getLS('gxv_storeName', 'GX VAULT'));
  const [darkMode, setDarkMode] = useState(getLS('gxv_darkMode', 'true') === 'true');
  const [showBanner, setShowBanner] = useState(getLS('gxv_showBanner', 'true') !== 'false');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLS('gxv_storeName', storeName);
    setLS('gxv_darkMode', String(darkMode));
    setLS('gxv_showBanner', String(showBanner));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Store Name */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
          <Type size={14} style={{ color: theme.primary }} /> اسم المتجر
        </label>
        <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
          style={{ width: '100%', maxWidth: 400, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal' }}
        />
      </div>

      {/* Theme selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 12 }}>
          <Palette size={14} style={{ color: theme.primary }} /> ثيم الألوان
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {GXV_THEMES.map(ct => (
            <button key={ct.id} onClick={() => { setThemeId(ct.id); setLS('gxv_themeId', ct.id); }} style={{
              padding: '14px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
              background: themeId === ct.id ? `${ct.primary}10` : 'rgba(255,255,255,0.02)',
              border: `2px solid ${themeId === ct.id ? ct.primary : 'rgba(255,255,255,0.06)'}`,
              position: 'relative',
            }}>
              {themeId === ct.id && (
                <div style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: '50%', background: ct.primary, display: 'grid', placeItems: 'center' }}>
                  <Check size={10} color="#fff" />
                </div>
              )}
              <div style={{ width: 32, height: 32, borderRadius: 8, background: ct.gradient, margin: '0 auto 8px', boxShadow: themeId === ct.id ? ct.glow : 'none' }} />
              <span style={{ color: themeId === ct.id ? ct.primary : '#666', fontSize: '0.75rem', fontWeight: 600 }}>{ct.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'الوضع الداكن', icon: darkMode ? <Moon size={14} /> : <Sun size={14} />, val: darkMode, set: setDarkMode },
          { label: 'البانر الرئيسي', icon: <Globe size={14} />, val: showBanner, set: setShowBanner },
        ].map((toggle, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ color: '#b8b8cc', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: theme.primary }}>{toggle.icon}</span>
              {toggle.label}
            </span>
            <button onClick={() => toggle.set(!toggle.val)} style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: toggle.val ? theme.primary : '#333', position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, right: toggle.val ? 3 : 23, transition: 'right 0.2s' }} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSave} style={{
        padding: '14px 28px', borderRadius: 14,
        background: saved ? 'rgba(34,197,94,0.15)' : theme.gradient,
        border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
        color: saved ? '#4ade80' : '#fff', cursor: 'pointer',
        fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: saved ? 'none' : theme.glow,
      }}>
        {saved ? <><CheckCircle size={16} /> تم الحفظ!</> : <><Save size={16} /> حفظ التخصيص</>}
      </button>
    </div>
  );
}

function AnnouncementsPage({ theme }) {
  const [items, setItems] = useState(announcements);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button style={{ padding: '10px 18px', borderRadius: 10, background: theme.gradient, color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> إعلان جديد
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(ann => (
          <div key={ann.id} style={{
            padding: '18px 20px', borderRadius: 14,
            background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Megaphone size={14} style={{ color: theme.primary }} />
                  <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>{ann.title}</h4>
                  {ann.active && <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '0.6rem', fontWeight: 600 }}>نشط</span>}
                </div>
                <p style={{ color: '#666', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>{ann.content}</p>
                <span style={{ color: '#444', fontSize: '0.7rem', marginTop: 6, display: 'block' }}>{ann.date}</span>
              </div>
              <button onClick={() => setItems(prev => prev.filter(a => a.id !== ann.id))} style={{
                width: 30, height: 30, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                color: '#f87171', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage({ theme }) {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ maxWidth: 500 }}>
      {[
        { label: 'اسم المتجر', placeholder: 'GX VAULT', icon: <Globe size={14} /> },
        { label: 'وصف المتجر', placeholder: 'أفضل متجر لشحن الألعاب', icon: <Settings size={14} /> },
        { label: 'بريد التواصل', placeholder: 'support@gxvault.com', icon: <Shield size={14} /> },
      ].map((field, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: theme.primary }}>{field.icon}</span> {field.label}
          </label>
          <input type="text" placeholder={field.placeholder} defaultValue={field.placeholder}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal' }}
          />
        </div>
      ))}
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{
        padding: '14px 28px', borderRadius: 14,
        background: saved ? 'rgba(34,197,94,0.15)' : theme.gradient,
        border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
        color: saved ? '#4ade80' : '#fff', cursor: 'pointer',
        fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {saved ? <><CheckCircle size={16} /> تم الحفظ!</> : <><Save size={16} /> حفظ الإعدادات</>}
      </button>
    </div>
  );
}


// ─── Page Titles Map ───
const PAGE_TITLES = {
  overview: '📊 نظرة عامة',
  products: '📦 المنتجات',
  orders: '🛒 الطلبات',
  users: '👥 المستخدمين',
  payments: '💳 بوابات الدفع',
  sources: '🔗 مصادر خارجية',
  customize: '🎨 تخصيص الواجهة',
  announcements: '📢 الإعلانات',
  settings: '⚙️ الإعدادات',
};


// ─── MAIN ───
export default function GxVaultDashboardLiveDemo() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [themeId, setThemeId] = useState(() => getLS('gxv_themeId', 'neon-violet'));
  const theme = GXV_THEMES.find(t => t.id === themeId) || GXV_THEMES[0];

  const sidebarW = collapsed ? 70 : 250;

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <OverviewPage theme={theme} />;
      case 'products': return <ProductsPage theme={theme} />;
      case 'orders': return <OrdersPage theme={theme} />;
      case 'users': return <UsersPage theme={theme} />;
      case 'payments': return <PaymentsPage theme={theme} />;
      case 'sources': return <SourcesPage theme={theme} />;
      case 'customize': return <CustomizePage theme={theme} themeId={themeId} setThemeId={setThemeId} />;
      case 'announcements': return <AnnouncementsPage theme={theme} />;
      case 'settings': return <SettingsPage theme={theme} />;
      default: return <OverviewPage theme={theme} />;
    }
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#050510', color: '#e8e8ff', fontFamily: 'Tajawal, sans-serif' }}>
      {/* Demo Banner */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', padding: '6px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 32,
      }}>
        <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
          📊 هذا ديمو تجريبي للوحة تحكم GX-VAULT
        </span>
        <Link to="/template/game-topup-store" style={{
          padding: '2px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.2)',
          color: '#fff', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          اشترِ الآن <ExternalLink size={10} />
        </Link>
      </div>

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        theme={theme}
      />

      {/* Main Content */}
      <div className="gxv-main-content" style={{
        marginRight: sidebarW, minHeight: 'calc(100vh - 32px)',
        padding: '60px 30px 40px', transition: 'margin-right 0.3s',
      }}>
        <Header title={PAGE_TITLES[currentPage] || 'نظرة عامة'} theme={theme} />
        {renderPage()}
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .gxv-desk-sidebar { display: none !important; }
          .gxv-mob-nav { display: block !important; }
          .gxv-main-content { margin-right: 0 !important; padding: 50px 16px 80px !important; }
        }
      `}</style>
    </div>
  );
}
