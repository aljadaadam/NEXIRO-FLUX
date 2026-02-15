import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  Bell, Settings, LogOut, Search, Menu, X, ChevronDown, ChevronLeft,
  ChevronRight, MoreVertical, Plus, Edit, Trash2, Eye, Check,
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Activity, Calendar, Filter, Download, RefreshCw,
  Megaphone, AlertCircle, CheckCircle, Clock, Star, Zap, Shield,
  ChevronUp, User, Link2, Globe, Wifi, WifiOff, PlugZap, RefreshCcw,
  ExternalLink, Database, Cloud, CloudOff, Palette, Upload, Image,
  Type, Layout, Monitor, Moon, Sun, Paintbrush
} from 'lucide-react';

// ─── بيانات وهمية ───

const statsData = [
  { label: 'إجمالي المبيعات', value: '$12,450', change: '+18.2%', up: true, icon: DollarSign, color: '#7c5cff', bgColor: '#f5f3ff' },
  { label: 'الطلبات اليوم', value: '86', change: '+5.3%', up: true, icon: ShoppingCart, color: '#22c55e', bgColor: '#f0fdf4' },
  { label: 'المستخدمين', value: '2,340', change: '+12.7%', up: true, icon: Users, color: '#3b82f6', bgColor: '#eff6ff' },
  { label: 'المنتجات النشطة', value: '148', change: '-2.1%', up: false, icon: Package, color: '#f59e0b', bgColor: '#fffbeb' },
];

const recentOrders = [
  { id: '#1042', user: 'أحمد محمد', product: 'Sigma Plus - 3 أيام', price: '$12.00', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7', date: 'منذ 5 دقائق', avatar: '👤' },
  { id: '#1041', user: 'سارة أحمد', product: 'UnlockTool - 12 شهر', price: '$38.50', status: 'قيد المعالجة', statusColor: '#f59e0b', statusBg: '#fef3c7', date: 'منذ 12 دقيقة', avatar: '👩' },
  { id: '#1040', user: 'خالد علي', product: 'PUBG UC 660', price: '$8.99', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7', date: 'منذ 30 دقيقة', avatar: '👨' },
  { id: '#1039', user: 'ليلى حسن', product: 'فحص IMEI كامل', price: '$2.50', status: 'ملغي', statusColor: '#dc2626', statusBg: '#fee2e2', date: 'منذ ساعة', avatar: '👩' },
  { id: '#1038', user: 'محمد يوسف', product: 'Sigma Plus - سنة', price: '$42.00', status: 'مكتمل', statusColor: '#16a34a', statusBg: '#dcfce7', date: 'منذ ساعتين', avatar: '👤' },
  { id: '#1037', user: 'نور الدين', product: 'فري فاير 520 جوهرة', price: '$5.99', status: 'قيد المعالجة', statusColor: '#f59e0b', statusBg: '#fef3c7', date: 'منذ 3 ساعات', avatar: '👨' },
];

const products = [
  { id: 1, name: 'Sigma Plus - 3 أيام', price: '$12.00', stock: 'متاح', stockColor: '#16a34a', category: 'أدوات سوفت', sales: 234, status: true },
  { id: 2, name: 'Sigma Plus - سنة كاملة', price: '$42.00', stock: 'متاح', stockColor: '#16a34a', category: 'أدوات سوفت', sales: 156, status: true },
  { id: 3, name: 'UnlockTool - 12 شهر', price: '$38.50', stock: 'متاح', stockColor: '#16a34a', category: 'أدوات سوفت', sales: 89, status: true },
  { id: 4, name: 'فحص IMEI كامل', price: '$2.50', stock: 'متاح', stockColor: '#16a34a', category: 'خدمات IMEI', sales: 567, status: true },
  { id: 5, name: 'PUBG UC 660', price: '$8.99', stock: 'محدود', stockColor: '#f59e0b', category: 'شحن ألعاب', sales: 312, status: true },
  { id: 6, name: 'فري فاير 520 جوهرة', price: '$5.99', stock: 'نفذ', stockColor: '#dc2626', category: 'شحن ألعاب', sales: 198, status: false },
];

const users = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', orders: 12, balance: '$125.50', joined: '2025-01-15', status: 'نشط', statusColor: '#16a34a' },
  { id: 2, name: 'سارة أحمد', email: 'sara@example.com', orders: 8, balance: '$45.00', joined: '2025-02-01', status: 'نشط', statusColor: '#16a34a' },
  { id: 3, name: 'خالد علي', email: 'khaled@example.com', orders: 23, balance: '$0.00', joined: '2024-11-20', status: 'نشط', statusColor: '#16a34a' },
  { id: 4, name: 'ليلى حسن', email: 'laila@example.com', orders: 3, balance: '$12.50', joined: '2025-01-28', status: 'محظور', statusColor: '#dc2626' },
  { id: 5, name: 'محمد يوسف', email: 'mohammed@example.com', orders: 17, balance: '$230.00', joined: '2024-09-10', status: 'نشط', statusColor: '#16a34a' },
];

const announcements = [
  { id: 1, title: 'تحديث الأسعار — Sigma Plus', content: 'تم تحديث أسعار منتجات Sigma Plus بخصم 20% لفترة محدودة', date: '2026-02-10', active: true },
  { id: 2, title: 'صيانة مجدولة', content: 'سيتم إجراء صيانة للخوادم يوم الجمعة من الساعة 2-4 صباحاً', date: '2026-02-08', active: true },
  { id: 3, title: 'ترحيب بالمستخدمين الجدد', content: 'احصل على $5 مجاناً عند التسجيل لأول مرة!', date: '2026-02-05', active: false },
];

const chartData = [65, 42, 78, 55, 89, 72, 95, 60, 82, 45, 73, 88];
const chartLabels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// ─── مكون الشريط الجانبي ───

function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, theme, logoPreview, storeName }) {
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
    <aside className={`dash-sidebar${mobileOpen ? ' dash-sidebar-open' : ''}`} style={{
      width: collapsed ? 70 : 260, minHeight: 'calc(100vh - 32px)',
      background: '#0f172a', color: '#e2e8f0',
      transition: 'all 0.3s', position: 'fixed', right: 0, top: 32, zIndex: 50,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '1.75rem 0.5rem 1.25rem' : '1.75rem 1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {logoPreview ? (
          <img src={logoPreview} alt="logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: theme?.gradient || 'linear-gradient(135deg, #7c5cff, #22c55e)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Zap size={18} color="#fff" />
          </div>
        )}
        {!collapsed && <span style={{ fontSize: '1rem', fontWeight: 800 }}>{storeName || 'لوحة التحكم'}</span>}
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '0.75rem' : '0.75rem 1rem',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: isActive ? (theme?.primary || '#7c5cff') : 'transparent',
              color: isActive ? '#fff' : '#94a3b8',
              fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
              transition: 'all 0.2s', width: '100%', textAlign: 'right',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
              <Icon size={18} />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width: '100%', padding: '0.6rem', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'Tajawal, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {collapsed ? <ChevronLeft size={16} /> : <><ChevronRight size={16} /> طي القائمة</>}
        </button>
      </div>
    </aside>
  );
}

function DashHeader({ collapsed, onMenuToggle, theme, logoPreview }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #f1f5f9', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1rem', transition: 'all 0.3s',
    }}>
      {/* Mobile menu + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <button className="dash-menu-btn" onClick={onMenuToggle} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Menu size={22} color="#0b1020" />
        </button>
        <div className="dash-search" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.45rem 0.85rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', width: 260, maxWidth: '100%' }}>
          <Search size={15} color="#94a3b8" />
          <input placeholder="بحث..." style={{ border: 'none', outline: 'none', background: 'none', fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif', width: '100%' }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Bell size={15} color="#64748b" />
          <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
        </button>
        <div className="dash-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.3rem 0.65rem 0.3rem 0.4rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          {logoPreview ? (
            <img src={logoPreview} alt="logo" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: 8, background: theme?.gradient || 'linear-gradient(135deg, #7c5cff, #22c55e)', display: 'grid', placeItems: 'center' }}>
              <User size={13} color="#fff" />
            </div>
          )}
          <div className="dash-profile-text">
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0b1020', lineHeight: 1.2 }}>المسؤول</p>
            <p style={{ fontSize: '0.6rem', color: '#94a3b8' }}>admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav({ currentPage, setCurrentPage, theme }) {
  const pc = theme?.primary || '#7c5cff';
  const items = [
    { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav className="dash-bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      padding: '0.35rem 0.5rem 0.55rem',
      display: 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 500, margin: '0 auto' }}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem',
              fontFamily: 'Tajawal, sans-serif', transition: 'all 0.2s', position: 'relative',
            }}>
              {isActive && <div style={{ position: 'absolute', top: -5, width: 20, height: 3, borderRadius: 2, background: pc }} />}
              <Icon size={19} color={isActive ? pc : '#94a3b8'} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 800 : 500, color: isActive ? pc : '#94a3b8' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── صفحات الداشبورد ───

function OverviewPage({ theme }) {
  const maxChart = Math.max(...chartData);
  const pc = theme?.primary || '#7c5cff';

  return (
    <>
      {/* Stats */}
      <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: stat.bgColor, display: 'grid', placeItems: 'center' }}>
                  <Icon size={20} color={stat.color} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.up ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.change}
                </span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1020', marginBottom: 2 }}>{stat.value}</p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>📊 المبيعات الشهرية</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['أسبوعي', 'شهري', 'سنوي'].map((f, i) => (
              <button key={f} style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', background: i === 1 ? pc : '#f1f5f9', color: i === 1 ? '#fff' : '#64748b' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, padding: '0 0.5rem' }}>
          {chartData.map((val, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{val}%</span>
              <div style={{
                width: '100%', maxWidth: 40, borderRadius: '6px 6px 0 0',
                height: `${(val / maxChart) * 140}px`,
                background: `linear-gradient(to top, ${pc}, ${val > 70 ? (theme?.accent || '#22c55e') : (theme?.secondary || '#a78bfa')})`,
                transition: 'height 0.5s ease',
                opacity: 0.9,
              }} />
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', writingMode: 'horizontal-tb' }}>{chartLabels[i]?.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>📋 آخر الطلبات</h3>
          <button style={{ padding: '0.4rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>عرض الكل</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['رقم الطلب', 'العميل', 'المنتج', 'السعر', 'الحالة', 'التاريخ'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#94a3b8', fontSize: '0.75rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: pc }}>{order.id}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{order.avatar}</span>
                      <span style={{ fontWeight: 600, color: '#0b1020' }}>{order.user}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#334155' }}>{order.product}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0b1020' }}>{order.price}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: order.statusBg, color: order.statusColor }}>{order.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>📦 إدارة المنتجات</h2>
        <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          <Plus size={16} /> إضافة منتج
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['#', 'المنتج', 'السعر', 'الفئة', 'التوفر', 'المبيعات', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8' }}>{p.id}</td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#0b1020' }}>{p.name}</td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#7c5cff' }}>{p.price}</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>{p.category}</span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span style={{ color: p.stockColor, fontWeight: 700, fontSize: '0.78rem' }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#334155', fontWeight: 600 }}>{p.sales}</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ width: 36, height: 20, borderRadius: 10, background: p.status ? '#22c55e' : '#e2e8f0', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'all 0.2s', ...(p.status ? { left: 2 } : { right: 2 }) }} />
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={13} color="#3b82f6" /></button>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={13} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 480, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020' }}>إضافة منتج جديد</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>اسم المنتج</label>
                <input placeholder="مثال: Sigma Plus - شهر" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>السعر</label>
                  <input placeholder="$0.00" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>الفئة</label>
                  <select style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    <option>أدوات سوفت</option>
                    <option>خدمات IMEI</option>
                    <option>شحن ألعاب</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>الوصف</label>
                <textarea rows={3} placeholder="وصف المنتج..." style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                حفظ المنتج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OrdersAdminPage() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🛒 إدارة الطلبات</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>
            <Filter size={14} /> تصفية
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>
            <Download size={14} /> تصدير
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['رقم الطلب', 'العميل', 'المنتج', 'السعر', 'الحالة', 'التاريخ', 'إجراءات'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#7c5cff' }}>{order.id}</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{order.avatar}</span>
                      <div>
                        <span style={{ fontWeight: 600, color: '#0b1020', display: 'block', fontSize: '0.82rem' }}>{order.user}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#334155' }}>{order.product}</td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0b1020' }}>{order.price}</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: order.statusBg, color: order.statusColor }}>{order.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem' }}>{order.date}</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Eye size={13} color="#3b82f6" /></button>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#dcfce7', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Check size={13} color="#16a34a" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function UsersAdminPage() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>👥 إدارة المستخدمين</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 1rem', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', width: 240 }}>
          <Search size={14} color="#94a3b8" />
          <input placeholder="بحث عن مستخدم..." style={{ border: 'none', outline: 'none', background: 'none', fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif', width: '100%' }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['#', 'المستخدم', 'البريد', 'الطلبات', 'الرصيد', 'تاريخ التسجيل', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8' }}>{u.id}</td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#0b1020' }}>{u.name}</td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#64748b', fontSize: '0.78rem' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#334155' }}>{u.orders}</td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#22c55e' }}>{u.balance}</td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem' }}>{u.joined}</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: u.statusColor === '#16a34a' ? '#dcfce7' : '#fee2e2', color: u.statusColor }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Eye size={13} color="#3b82f6" /></button>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Shield size={13} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PaymentsPage() {
  const gateways = [
    { name: 'Binance Pay', icon: '🟡', status: true, fees: '0.5%', desc: 'دفع عبر العملات الرقمية' },
    { name: 'PayPal', icon: '🔵', status: true, fees: '2.9%', desc: 'بطاقات ائتمان و PayPal' },
    { name: 'التحويل البنكي', icon: '🏦', status: true, fees: '0%', desc: 'تحويل بنكي مباشر' },
    { name: 'Stripe', icon: '💳', status: false, fees: '2.5%', desc: 'بطاقات ائتمان دولية' },
    { name: 'USDT (TRC20)', icon: '💚', status: true, fees: '1%', desc: 'تيثر على شبكة Tron' },
  ];

  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>💳 بوابات الدفع</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {gateways.map((gw, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{gw.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020' }}>{gw.name}</h4>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{gw.desc}</p>
                </div>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: gw.status ? '#22c55e' : '#e2e8f0', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'all 0.2s', ...(gw.status ? { left: 2 } : { right: 2 }) }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 10 }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>رسوم المعالجة</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>{gw.fees}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AnnouncementsPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>📢 الإعلانات</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          <Plus size={16} /> إعلان جديد
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="عنوان الإعلان" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            <textarea rows={3} placeholder="محتوى الإعلان..." style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>نشر</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {announcements.map(ann => (
          <div key={ann.id} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{ann.title}</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{ann.content}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: ann.active ? '#dcfce7' : '#f1f5f9', color: ann.active ? '#16a34a' : '#94a3b8' }}>{ann.active ? 'نشط' : 'متوقف'}</span>
                <button style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={12} color="#3b82f6" /></button>
                <button style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={12} color="#dc2626" /></button>
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {ann.date}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsAdminPage() {
  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>⚙️ الإعدادات</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Store Settings */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>🏪 إعدادات المتجر</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>اسم المتجر</label>
              <input defaultValue="المتجر" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>العملة</label>
              <select style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option>USD ($)</option>
                <option>SAR (ر.س)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>🔔 الإشعارات</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'إشعار طلب جديد', desc: 'عند استلام طلب جديد', on: true },
              { label: 'إشعار تسجيل مستخدم', desc: 'عند تسجيل مستخدم جديد', on: true },
              { label: 'إشعار بريد إلكتروني', desc: 'إرسال ملخص يومي', on: false },
            ].map((n, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 10 }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0b1020' }}>{n.label}</p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{n.desc}</p>
                </div>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: n.on ? '#22c55e' : '#e2e8f0', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'all 0.2s', ...(n.on ? { left: 2 } : { right: 2 }) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>🔒 الأمان</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>كلمة المرور الحالية</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>كلمة المرور الجديدة</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button style={{ padding: '0.7rem 1.5rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', alignSelf: 'flex-start' }}>
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ExternalSourcesPage() {
  const [activeTab, setActiveTab] = useState('connected');

  const connectedSources = [
    { id: 1, name: 'SD-UNLOCKER', icon: '🔓', type: 'DHRU FUSION', url: 'sd-unlocker.com', status: 'متصل', statusColor: '#16a34a', lastSync: 'منذ 5 دقائق', products: 1250, balance: '$45.30' },
  ];

  const availableSources = [
    { name: 'DHRU FUSION', icon: '⚡', desc: 'اتصل بأي نظام DHRU FUSION لجلب خدمات فك القفل والـ IMEI تلقائياً. يدعم SD-Unlocker وغيرها.', category: 'API', fields: ['URL', 'Username', 'API Access Key'] },
  ];

  const syncLogs = [
    { time: '14:32', source: 'SD-UNLOCKER', action: 'مزامنة خدمات', count: '120 خدمة محدّثة', status: 'success' },
    { time: '13:15', source: 'SD-UNLOCKER', action: 'فحص طلبات', count: '3 طلبات مكتملة', status: 'success' },
    { time: '12:00', source: 'SD-UNLOCKER', action: 'فحص الرصيد', count: 'الرصيد: $45.30', status: 'success' },
    { time: '10:30', source: 'SD-UNLOCKER', action: 'إرسال طلب IMEI', count: 'المرجع: REF-78452', status: 'success' },
    { time: '09:00', source: 'SD-UNLOCKER', action: 'مزامنة أسعار', count: '1250 سعر محدّث', status: 'success' },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🔗 المصادر الخارجية</h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          <Plus size={16} /> ربط مصدر جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'مصادر متصلة', value: '1', icon: Wifi, color: '#22c55e', bg: '#f0fdf4' },
          { label: 'الرصيد', value: '$45.30', icon: CreditCard, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'خدمات مستوردة', value: '1,250', icon: Package, color: '#7c5cff', bg: '#f5f3ff' },
          { label: 'آخر مزامنة', value: '5 د', icon: RefreshCcw, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '1rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon size={18} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0b1020', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #f1f5f9' }}>
        {[
          { id: 'connected', label: 'المصادر المتصلة' },
          { id: 'available', label: 'المصادر المتاحة' },
          { id: 'logs', label: 'سجل المزامنة' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '0.55rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif', fontSize: '0.8rem', fontWeight: 600,
            background: activeTab === tab.id ? '#7c5cff' : 'transparent',
            color: activeTab === tab.id ? '#fff' : '#64748b',
            transition: 'all 0.2s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Connected Sources */}
      {activeTab === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {connectedSources.map(src => (
            <div key={src.id} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.75rem' }}>{src.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{src.name}</h4>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: src.statusColor === '#16a34a' ? '#dcfce7' : '#fee2e2', color: src.statusColor }}>{src.status}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{src.type} • {src.url}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>
                    <RefreshCcw size={13} /> مزامنة
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>
                    <Settings size={13} /> إعدادات
                  </button>
                  <button style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Trash2 size={13} color="#dc2626" />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'الخدمات', value: src.products, icon: Package },
                  { label: 'الرصيد', value: src.balance, icon: CreditCard },
                  { label: 'آخر مزامنة', value: src.lastSync, icon: Clock },
                ].map((info, j) => {
                  const InfoIcon = info.icon;
                  return (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.85rem', background: '#f8fafc', borderRadius: 8 }}>
                      <InfoIcon size={14} color="#94a3b8" />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{info.label}: <strong style={{ color: '#0b1020' }}>{info.value}</strong></span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Sources */}
      {activeTab === 'available' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {availableSources.map((src, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{src.icon}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1020' }}>{src.name}</h4>
                  <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: 4, background: '#f0fdf4', color: '#16a34a', fontWeight: 600, border: '1px solid #bbf7d0' }}>{src.category}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{src.desc}</p>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>الحقول المطلوبة للاتصال:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {src.fields.map((f, j) => (
                    <span key={j} style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>{f}</span>
                  ))}
                </div>
              </div>
              <button style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c5cff, #6d4de6)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
                <PlugZap size={15} /> ربط الآن
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sync Logs */}
      {activeTab === 'logs' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020' }}>سجل المزامنة الأخيرة</h3>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>
              <RefreshCcw size={12} /> تحديث
            </button>
          </div>
          {syncLogs.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.25rem', borderBottom: i < syncLogs.length - 1 ? '1px solid #f8fafc' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: log.status === 'success' ? '#dcfce7' : '#fee2e2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {log.status === 'success' ? <CheckCircle size={15} color="#16a34a" /> : <AlertCircle size={15} color="#dc2626" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{log.source} — {log.action}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.count}</p>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{log.time}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function CustomizePage({ customize }) {
  const {
    themeId, setThemeId,
    logoPreview, setLogoPreview,
    storeName, setStoreName,
    darkMode, setDarkMode,
    buttonRadius, setButtonRadius,
    headerStyle, setHeaderStyle,
    showBanner, setShowBanner,
    fontFamily, setFontFamily,
    currentTheme, colorThemes,
  } = customize;

  const [saved, setSaved] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selectedTheme = themeId;
  const setSelectedTheme = setThemeId;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🎨 تخصيص الواجهة الأمامية</h2>
        <button onClick={handleSave} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.5rem', borderRadius: 10,
          background: saved ? '#22c55e' : currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.82rem',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', transition: 'all 0.3s',
        }}>
          {saved ? <><CheckCircle size={16} /> تم الحفظ!</> : <><Paintbrush size={16} /> حفظ التغييرات</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

        {/* ─── الشعار واسم المتجر ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image size={18} color={currentTheme.primary} /> الشعار والهوية
          </h3>

          {/* Logo Upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>شعار الموقع</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 14,
                background: logoPreview ? `url(${logoPreview}) center/cover no-repeat` : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                border: '2px dashed #cbd5e1', display: 'grid', placeItems: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {!logoPreview && <Upload size={24} color="#94a3b8" />}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem',
                  borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc',
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#64748b',
                  fontFamily: 'Tajawal, sans-serif',
                }}>
                  <Upload size={14} /> رفع شعار
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 6 }}>PNG, SVG أو JPG — الحد الأقصى 2MB</p>
                {logoPreview && (
                  <button onClick={() => { setLogoPreview(null); }} style={{
                    marginTop: 4, background: 'none', border: 'none', color: '#dc2626',
                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                  }}>
                    إزالة الشعار
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Store Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>اسم المتجر</label>
            <input value={storeName} onChange={e => setStoreName(e.target.value)} style={{
              width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0',
              fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
            }} />
          </div>

          {/* Font Family */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>الخط المستخدم</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'tajawal', name: 'Tajawal', sample: 'تجول' },
                { id: 'cairo', name: 'Cairo', sample: 'القاهرة' },
                { id: 'ibm', name: 'IBM Plex', sample: 'آي بي إم' },
                { id: 'noto', name: 'Noto Sans', sample: 'نوتو' },
              ].map(f => (
                <button key={f.id} onClick={() => setFontFamily(f.id)} style={{
                  flex: 1, minWidth: 75, padding: '0.6rem 0.5rem', borderRadius: 10,
                  border: fontFamily === f.id ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                  background: fontFamily === f.id ? `${currentTheme.primary}10` : '#fff',
                  cursor: 'pointer', textAlign: 'center', fontFamily: 'Tajawal, sans-serif',
                }}>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 2 }}>{f.sample}</span>
                  <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── ألوان الموقع ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} color={currentTheme.primary} /> ألوان الموقع
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {colorThemes.map(theme => (
              <button key={theme.id} onClick={() => setSelectedTheme(theme.id)} style={{
                padding: '0.85rem 0.5rem', borderRadius: 12,
                border: selectedTheme === theme.id ? `2px solid ${theme.primary}` : '1px solid #e2e8f0',
                background: selectedTheme === theme.id ? `${theme.primary}08` : '#fff',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                position: 'relative',
              }}>
                {selectedTheme === theme.id && (
                  <div style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: '50%', background: theme.primary, display: 'grid', placeItems: 'center' }}>
                    <Check size={10} color="#fff" />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.primary }} />
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.secondary }} />
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.accent }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155' }}>{theme.name}</span>
              </button>
            ))}
          </div>

          {/* Preview Current */}
          <div style={{ padding: '1rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>معاينة اللون المختار</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ flex: 1, height: 36, borderRadius: 8, background: currentTheme.gradient }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '0.5rem', borderRadius: 8, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>زر رئيسي</button>
              <button style={{ flex: 1, padding: '0.5rem', borderRadius: 8, background: 'transparent', color: currentTheme.primary, border: `2px solid ${currentTheme.primary}`, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>زر ثانوي</button>
            </div>
          </div>
        </div>

        {/* ─── تخطيط الصفحة ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layout size={18} color={currentTheme.primary} /> تخطيط الصفحة
          </h3>

          {/* Header Style */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>نوع الهيدر</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'sticky', label: 'ثابت', desc: 'يبقى أعلى الصفحة' },
                { id: 'static', label: 'عادي', desc: 'يختفي عند التمرير' },
                { id: 'transparent', label: 'شفاف', desc: 'شفاف فوق البانر' },
              ].map(h => (
                <button key={h.id} onClick={() => setHeaderStyle(h.id)} style={{
                  flex: 1, padding: '0.65rem 0.5rem', borderRadius: 10, textAlign: 'center',
                  border: headerStyle === h.id ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                  background: headerStyle === h.id ? `${currentTheme.primary}10` : '#fff',
                  cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                }}>
                  <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0b1020' }}>{h.label}</span>
                  <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{h.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Button Radius */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>شكل الأزرار</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'sharp', label: 'حاد', radius: '4px' },
                { id: 'rounded', label: 'مدوّر', radius: '10px' },
                { id: 'pill', label: 'كبسولة', radius: '50px' },
              ].map(b => (
                <button key={b.id} onClick={() => setButtonRadius(b.id)} style={{
                  flex: 1, padding: '0.55rem', borderRadius: b.radius,
                  border: buttonRadius === b.id ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                  background: buttonRadius === b.id ? currentTheme.primary : '#fff',
                  color: buttonRadius === b.id ? '#fff' : '#334155',
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
                }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'الوضع الداكن', desc: 'تفعيل الثيم الداكن', value: darkMode, setter: setDarkMode, icon: Moon },
              { label: 'بانر الإعلانات', desc: 'عرض البانر في الرئيسية', value: showBanner, setter: setShowBanner, icon: Megaphone },
            ].map((toggle, i) => {
              const ToggleIcon = toggle.icon;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0.85rem', background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ToggleIcon size={16} color="#64748b" />
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{toggle.label}</p>
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{toggle.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => toggle.setter(!toggle.value)} style={{
                    width: 42, height: 24, borderRadius: 12,
                    background: toggle.value ? currentTheme.primary : '#e2e8f0',
                    border: 'none', position: 'relative', cursor: 'pointer', transition: 'all 0.3s',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', ...(toggle.value ? { left: 3 } : { right: 3 }) }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── معاينة حية ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Monitor size={18} color={currentTheme.primary} /> معاينة حية
          </h3>

          <div style={{
            borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0',
            background: darkMode ? '#0f172a' : '#f8fafc',
            transition: 'all 0.3s',
          }}>
            {/* Mini Header Preview */}
            <div style={{
              padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: headerStyle === 'transparent' ? 'transparent' : (darkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)'),
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: currentTheme.gradient, display: 'grid', placeItems: 'center' }}>
                    <Zap size={12} color="#fff" />
                  </div>
                )}
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: darkMode ? '#e2e8f0' : '#0b1020' }}>{storeName}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['الرئيسية', 'الخدمات', 'طلباتي'].map(n => (
                  <span key={n} style={{ fontSize: '0.55rem', padding: '0.2rem 0.4rem', borderRadius: 4, color: darkMode ? '#94a3b8' : '#64748b' }}>{n}</span>
                ))}
              </div>
            </div>

            {/* Mini Banner */}
            {showBanner && (
              <div style={{ padding: '1.25rem 1rem', background: currentTheme.gradient, textAlign: 'center' }}>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>عروض حصرية 🔥</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>خصم 30% على جميع الخدمات</p>
                <button style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '8px',
                  background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                }}>تسوق الآن</button>
              </div>
            )}

            {/* Mini Products */}
            <div style={{ padding: '0.85rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {['🔧', '📱', '🎮'].map((emoji, i) => (
                <div key={i} style={{
                  padding: '0.5rem', borderRadius: buttonRadius === 'sharp' ? '4px' : '10px',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                  <div style={{ height: 4, borderRadius: 2, background: '#e2e8f0', marginTop: 6 }} />
                  <div style={{ height: 3, borderRadius: 2, background: '#f1f5f9', marginTop: 3, width: '60%', marginLeft: 'auto', marginRight: 'auto' }} />
                  <div style={{
                    marginTop: 6, padding: '0.2rem',
                    borderRadius: buttonRadius === 'sharp' ? '3px' : buttonRadius === 'pill' ? '50px' : '5px',
                    background: currentTheme.primary, fontSize: '0.5rem', color: '#fff', fontWeight: 700,
                  }}>اطلب</div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>المعاينة تقريبية — التغييرات تُطبَّق فوراً بعد الحفظ</p>
        </div>
      </div>
    </>
  );
}

// ─── المكون الرئيسي ───

const COLOR_THEMES = [
  { id: 'purple', name: 'بنفسجي كلاسيكي', primary: '#7c5cff', secondary: '#a78bfa', accent: '#22c55e', gradient: 'linear-gradient(135deg, #7c5cff, #a78bfa)' },
  { id: 'ocean', name: 'أزرق محيطي', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#06b6d4', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
  { id: 'emerald', name: 'أخضر زمردي', primary: '#10b981', secondary: '#34d399', accent: '#059669', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'rose', name: 'وردي أنيق', primary: '#f43f5e', secondary: '#fb7185', accent: '#e11d48', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  { id: 'amber', name: 'ذهبي فاخر', primary: '#f59e0b', secondary: '#fbbf24', accent: '#d97706', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'slate', name: 'رمادي عصري', primary: '#475569', secondary: '#64748b', accent: '#334155', gradient: 'linear-gradient(135deg, #475569, #334155)' },
];

export default function YCZDashboardLiveDemo() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ─── حالة التخصيص العامة ───
  const [themeId, setThemeId] = useState(() => { try { return localStorage.getItem('ycz_themeId') || 'purple'; } catch { return 'purple'; } });
  const [logoPreview, setLogoPreview] = useState(() => { try { return localStorage.getItem('ycz_logo') || null; } catch { return null; } });
  const [storeName, setStoreName] = useState(() => { try { return localStorage.getItem('ycz_storeName') || 'لوحة التحكم'; } catch { return 'لوحة التحكم'; } });
  const [darkMode, setDarkMode] = useState(() => { try { return localStorage.getItem('ycz_darkMode') === 'true'; } catch { return false; } });
  const [buttonRadius, setButtonRadius] = useState(() => { try { return localStorage.getItem('ycz_buttonRadius') || 'rounded'; } catch { return 'rounded'; } });
  const [headerStyle, setHeaderStyle] = useState(() => { try { return localStorage.getItem('ycz_headerStyle') || 'sticky'; } catch { return 'sticky'; } });
  const [showBanner, setShowBanner] = useState(() => { try { return localStorage.getItem('ycz_showBanner') !== 'false'; } catch { return true; } });
  const [fontFamily, setFontFamily] = useState(() => { try { return localStorage.getItem('ycz_fontFamily') || 'tajawal'; } catch { return 'tajawal'; } });

  // ─── مزامنة التخصيص مع localStorage ───
  useEffect(() => {
    try {
      localStorage.setItem('ycz_themeId', themeId);
      if (logoPreview) localStorage.setItem('ycz_logo', logoPreview); else localStorage.removeItem('ycz_logo');
      localStorage.setItem('ycz_storeName', storeName);
      localStorage.setItem('ycz_darkMode', String(darkMode));
      localStorage.setItem('ycz_buttonRadius', buttonRadius);
      localStorage.setItem('ycz_headerStyle', headerStyle);
      localStorage.setItem('ycz_showBanner', String(showBanner));
      localStorage.setItem('ycz_fontFamily', fontFamily);
    } catch {}
  }, [themeId, logoPreview, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily]);

  const currentTheme = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];

  const customize = {
    themeId, setThemeId,
    logoPreview, setLogoPreview,
    storeName, setStoreName,
    darkMode, setDarkMode,
    buttonRadius, setButtonRadius,
    headerStyle, setHeaderStyle,
    showBanner, setShowBanner,
    fontFamily, setFontFamily,
    currentTheme, colorThemes: COLOR_THEMES,
  };

  const pages = {
    overview: <OverviewPage theme={currentTheme} />,
    products: <ProductsPage theme={currentTheme} />,
    orders: <OrdersAdminPage theme={currentTheme} />,
    users: <UsersAdminPage theme={currentTheme} />,
    payments: <PaymentsPage theme={currentTheme} />,
    sources: <ExternalSourcesPage theme={currentTheme} />,
    customize: <CustomizePage customize={customize} />,
    announcements: <AnnouncementsPage theme={currentTheme} />,
    settings: <SettingsAdminPage theme={currentTheme} />,
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Tajawal, Cairo, sans-serif', background: '#f1f5f9', minHeight: '100vh', color: '#0b1020' }}>
      {/* Demo Banner */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.accent})`,
        padding: '0.4rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>📊 ديمو لوحة التحكم — <Link to="/template/digital-services-store" style={{ color: '#fff', textDecoration: 'underline' }}>اشترِ القالب الآن</Link></span>
      </div>

      <div style={{ paddingTop: 32 }}>
        {/* Mobile Drawer Overlay */}
        {mobileDrawerOpen && (
          <div className="dash-overlay" onClick={() => setMobileDrawerOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 45, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
        )}

        <Sidebar currentPage={currentPage} setCurrentPage={(id) => { setCurrentPage(id); setMobileDrawerOpen(false); }} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileDrawerOpen} theme={currentTheme} logoPreview={logoPreview} storeName={storeName} />

        <div className="dash-main-content" style={{ marginRight: collapsed ? 70 : 260, transition: 'margin-right 0.3s', minHeight: '100vh', paddingBottom: '1rem' }}>
          <DashHeader collapsed={collapsed} onMenuToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)} theme={currentTheme} logoPreview={logoPreview} />
          <main style={{ padding: '1rem' }}>
            {pages[currentPage]}
          </main>
        </div>

        <MobileBottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} theme={currentTheme} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar {
            transform: translateX(100%);
            width: 260px !important;
            top: 32px !important;
          }
          .dash-sidebar-open {
            transform: translateX(0) !important;
          }
          .dash-main-content { margin-right: 0 !important; padding-bottom: 4.5rem !important; }
          .dash-menu-btn { display: block !important; }
          .dash-search { width: 160px !important; }
          .dash-profile-text { display: none !important; }
          .dash-bottom-nav { display: block !important; }
          .dash-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .dash-stats-grid > div { padding: 0.85rem !important; }
          .dash-stats-grid p:first-of-type { font-size: 1.15rem !important; }
        }
        @media (max-width: 480px) {
          .dash-search { width: 120px !important; }
          .dash-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
