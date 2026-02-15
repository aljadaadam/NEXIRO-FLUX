'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import {
  Plus, RefreshCcw, Settings, Trash2, Wifi, CreditCard,
  Package, Clock, CheckCircle, AlertCircle, PlugZap, Loader2,
} from 'lucide-react';

interface ConnectedSource {
  id: number;
  name: string;
  icon: string;
  type: string;
  url: string;
  status: string;
  statusColor: string;
  lastSync: string;
  products: number;
  balance: string;
}

interface AvailableSource {
  name: string;
  icon: string;
  desc: string;
  category: string;
  fields: string[];
}

interface SyncLog {
  time: string;
  source: string;
  action: string;
  count: string;
  status: string;
}

// بيانات احتياطية تُعرض عند عدم توفر الـ API
const FALLBACK_CONNECTED: ConnectedSource[] = [];
const FALLBACK_AVAILABLE: AvailableSource[] = [
  { name: 'DHRU FUSION', icon: '⚡', desc: 'اتصل بأي نظام DHRU FUSION لجلب خدمات فك القفل والـ IMEI تلقائياً. يدعم SD-Unlocker وغيرها.', category: 'API', fields: ['URL', 'Username', 'API Access Key'] },
];

export default function ExternalSourcesPage() {
  const [activeTab, setActiveTab] = useState('connected');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>(FALLBACK_CONNECTED);
  const [availableSources, setAvailableSources] = useState<AvailableSource[]>(FALLBACK_AVAILABLE);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState({ connected: 0, balance: '$0.00', imported: 0, lastSync: '--' });

  // ─── جلب المصادر من الباك اند ───
  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSources();
      if (data.connected) setConnectedSources(data.connected);
      if (data.available) setAvailableSources(data.available);
      if (data.logs) setSyncLogs(data.logs);
      if (data.stats) setStats(data.stats);
    } catch {
      console.warn('[Sources] فشل جلب المصادر من الخادم');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  // ─── مزامنة مصدر ───
  const handleSync = async (sourceId: number) => {
    setSyncing(sourceId);
    try {
      await adminApi.syncSource(sourceId);
      await fetchSources(); // تحديث البيانات
    } catch {
      console.warn('[Sources] فشل مزامنة المصدر');
    } finally {
      setSyncing(null);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🔗 المصادر الخارجية</h2>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.6rem 1.25rem', borderRadius: 10,
          background: '#7c5cff', color: '#fff',
          border: 'none', fontSize: '0.82rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
        }}>
          <Plus size={16} /> ربط مصدر جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'مصادر متصلة', value: String(stats.connected), icon: Wifi, color: '#22c55e', bg: '#f0fdf4' },
          { label: 'الرصيد', value: stats.balance, icon: CreditCard, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'خدمات مستوردة', value: String(stats.imported), icon: Package, color: '#7c5cff', bg: '#f5f3ff' },
          { label: 'آخر مزامنة', value: stats.lastSync, icon: RefreshCcw, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '1rem',
              border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12,
            }}>
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
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Connected Sources */}
      {activeTab === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {connectedSources.map(src => (
            <div key={src.id} style={{
              background: '#fff', borderRadius: 14, padding: '1.25rem',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.75rem' }}>{src.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{src.name}</h4>
                      <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                        background: '#dcfce7', color: src.statusColor,
                      }}>{src.status}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{src.type} • {src.url}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#64748b',
                  }}>
                    <RefreshCcw size={13} /> مزامنة
                  </button>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#64748b',
                  }}>
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
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '0.5rem 0.85rem', background: '#f8fafc', borderRadius: 8,
                    }}>
                      <InfoIcon size={14} color="#94a3b8" />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {info.label}: <strong style={{ color: '#0b1020' }}>{info.value}</strong>
                      </span>
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
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '1.5rem',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{src.icon}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1020' }}>{src.name}</h4>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: 4,
                    background: '#f0fdf4', color: '#16a34a', fontWeight: 600, border: '1px solid #bbf7d0',
                  }}>{src.category}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{src.desc}</p>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>الحقول المطلوبة للاتصال:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {src.fields.map((f, j) => (
                    <span key={j} style={{
                      fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: 6,
                      background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600,
                    }}>{f}</span>
                  ))}
                </div>
              </div>
              <button style={{
                width: '100%', padding: '0.6rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #7c5cff, #6d4de6)', color: '#fff',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <PlugZap size={15} /> ربط الآن
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sync Logs */}
      {activeTab === 'logs' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020' }}>سجل المزامنة الأخيرة</h3>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              fontFamily: 'Tajawal, sans-serif', color: '#64748b',
            }}>
              <RefreshCcw size={12} /> تحديث
            </button>
          </div>
          {syncLogs.map((log, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0.85rem 1.25rem',
              borderBottom: i < syncLogs.length - 1 ? '1px solid #f8fafc' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#dcfce7', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <CheckCircle size={15} color="#16a34a" />
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
