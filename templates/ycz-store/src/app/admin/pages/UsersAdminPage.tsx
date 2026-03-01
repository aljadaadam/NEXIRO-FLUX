'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Eye, Shield, Wallet, X, Plus, Minus, Users, UserCheck,
  UserX, ShieldCheck, RefreshCw, Inbox, ChevronLeft, ChevronRight, AlertCircle,
  Download, ArrowUpDown, Copy, CheckCircle, Globe, UserPlus, Trophy,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { User } from '@/lib/types';
import UserDetailsPage from './UserDetailsPage';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

/* ═══ Country → coordinates on simplified world map (percentage-based) ═══ */
const COUNTRY_COORDS: Record<string, { x: number; y: number; nameAr: string }> = {
  'السعودية': { x: 57, y: 42, nameAr: 'السعودية' },
  'saudi arabia': { x: 57, y: 42, nameAr: 'السعودية' },
  'sa': { x: 57, y: 42, nameAr: 'السعودية' },
  'مصر': { x: 52, y: 40, nameAr: 'مصر' },
  'egypt': { x: 52, y: 40, nameAr: 'مصر' },
  'eg': { x: 52, y: 40, nameAr: 'مصر' },
  'الإمارات': { x: 60, y: 42, nameAr: 'الإمارات' },
  'uae': { x: 60, y: 42, nameAr: 'الإمارات' },
  'ae': { x: 60, y: 42, nameAr: 'الإمارات' },
  'العراق': { x: 57, y: 37, nameAr: 'العراق' },
  'iraq': { x: 57, y: 37, nameAr: 'العراق' },
  'iq': { x: 57, y: 37, nameAr: 'العراق' },
  'الأردن': { x: 54, y: 39, nameAr: 'الأردن' },
  'jordan': { x: 54, y: 39, nameAr: 'الأردن' },
  'jo': { x: 54, y: 39, nameAr: 'الأردن' },
  'الكويت': { x: 58, y: 40, nameAr: 'الكويت' },
  'kuwait': { x: 58, y: 40, nameAr: 'الكويت' },
  'kw': { x: 58, y: 40, nameAr: 'الكويت' },
  'قطر': { x: 59, y: 42, nameAr: 'قطر' },
  'qatar': { x: 59, y: 42, nameAr: 'قطر' },
  'qa': { x: 59, y: 42, nameAr: 'قطر' },
  'البحرين': { x: 59, y: 41, nameAr: 'البحرين' },
  'bahrain': { x: 59, y: 41, nameAr: 'البحرين' },
  'bh': { x: 59, y: 41, nameAr: 'البحرين' },
  'عمان': { x: 61, y: 44, nameAr: 'عمان' },
  'oman': { x: 61, y: 44, nameAr: 'عمان' },
  'om': { x: 61, y: 44, nameAr: 'عمان' },
  'اليمن': { x: 58, y: 46, nameAr: 'اليمن' },
  'yemen': { x: 58, y: 46, nameAr: 'اليمن' },
  'ye': { x: 58, y: 46, nameAr: 'اليمن' },
  'سوريا': { x: 55, y: 37, nameAr: 'سوريا' },
  'syria': { x: 55, y: 37, nameAr: 'سوريا' },
  'sy': { x: 55, y: 37, nameAr: 'سوريا' },
  'لبنان': { x: 54, y: 37, nameAr: 'لبنان' },
  'lebanon': { x: 54, y: 37, nameAr: 'لبنان' },
  'lb': { x: 54, y: 37, nameAr: 'لبنان' },
  'فلسطين': { x: 54, y: 39, nameAr: 'فلسطين' },
  'palestine': { x: 54, y: 39, nameAr: 'فلسطين' },
  'ps': { x: 54, y: 39, nameAr: 'فلسطين' },
  'ليبيا': { x: 48, y: 40, nameAr: 'ليبيا' },
  'libya': { x: 48, y: 40, nameAr: 'ليبيا' },
  'ly': { x: 48, y: 40, nameAr: 'ليبيا' },
  'تونس': { x: 47, y: 37, nameAr: 'تونس' },
  'tunisia': { x: 47, y: 37, nameAr: 'تونس' },
  'tn': { x: 47, y: 37, nameAr: 'تونس' },
  'الجزائر': { x: 44, y: 38, nameAr: 'الجزائر' },
  'algeria': { x: 44, y: 38, nameAr: 'الجزائر' },
  'dz': { x: 44, y: 38, nameAr: 'الجزائر' },
  'المغرب': { x: 42, y: 38, nameAr: 'المغرب' },
  'morocco': { x: 42, y: 38, nameAr: 'المغرب' },
  'ma': { x: 42, y: 38, nameAr: 'المغرب' },
  'السودان': { x: 52, y: 46, nameAr: 'السودان' },
  'sudan': { x: 52, y: 46, nameAr: 'السودان' },
  'sd': { x: 52, y: 46, nameAr: 'السودان' },
  'تركيا': { x: 53, y: 34, nameAr: 'تركيا' },
  'turkey': { x: 53, y: 34, nameAr: 'تركيا' },
  'tr': { x: 53, y: 34, nameAr: 'تركيا' },
  'إيران': { x: 60, y: 37, nameAr: 'إيران' },
  'iran': { x: 60, y: 37, nameAr: 'إيران' },
  'ir': { x: 60, y: 37, nameAr: 'إيران' },
  'الهند': { x: 68, y: 43, nameAr: 'الهند' },
  'india': { x: 68, y: 43, nameAr: 'الهند' },
  'in': { x: 68, y: 43, nameAr: 'الهند' },
  'باكستان': { x: 65, y: 40, nameAr: 'باكستان' },
  'pakistan': { x: 65, y: 40, nameAr: 'باكستان' },
  'pk': { x: 65, y: 40, nameAr: 'باكستان' },
  'أمريكا': { x: 20, y: 36, nameAr: 'أمريكا' },
  'united states': { x: 20, y: 36, nameAr: 'أمريكا' },
  'us': { x: 20, y: 36, nameAr: 'أمريكا' },
  'بريطانيا': { x: 45, y: 28, nameAr: 'بريطانيا' },
  'united kingdom': { x: 45, y: 28, nameAr: 'بريطانيا' },
  'gb': { x: 45, y: 28, nameAr: 'بريطانيا' },
  'ألمانيا': { x: 47, y: 29, nameAr: 'ألمانيا' },
  'germany': { x: 47, y: 29, nameAr: 'ألمانيا' },
  'de': { x: 47, y: 29, nameAr: 'ألمانيا' },
  'فرنسا': { x: 45, y: 31, nameAr: 'فرنسا' },
  'france': { x: 45, y: 31, nameAr: 'فرنسا' },
  'fr': { x: 45, y: 31, nameAr: 'فرنسا' },
  'كندا': { x: 20, y: 26, nameAr: 'كندا' },
  'canada': { x: 20, y: 26, nameAr: 'كندا' },
  'ca': { x: 20, y: 26, nameAr: 'كندا' },
};

function resolveCountry(country: string): { x: number; y: number; nameAr: string } | null {
  if (!country) return null;
  const lower = country.toLowerCase().trim();
  return COUNTRY_COORDS[lower] || null;
}

/* ═══ LiveVisitorsCard ═══ */
function LiveVisitorsCard({ theme, isRTL, t }: { theme: ColorTheme; isRTL: boolean; t: (s: string) => string }) {
  const [data, setData] = useState<{
    onlineCount: number;
    countryBreakdown: { country: string; count: number }[];
    todayNewUsers: number;
    onlineUsers: { id: number; name: string; email: string; country: string; last_active_at: string }[];
  } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminApi.getOnlineStats();
      setData(res);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadStats();
    intervalRef.current = setInterval(loadStats, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadStats]);

  const onlineCount = data?.onlineCount ?? 0;
  const todayNew = data?.todayNewUsers ?? 0;
  const countries = data?.countryBreakdown ?? [];
  const topCountry = countries.length > 0 ? countries[0] : null;
  const maxCount = countries.length > 0 ? Math.max(...countries.map(c => c.count)) : 1;

  // Map dots
  const mapDots = countries.map(c => {
    const coords = resolveCountry(c.country);
    if (!coords) return null;
    return { ...coords, count: c.count, country: c.country };
  }).filter(Boolean) as { x: number; y: number; nameAr: string; count: number; country: string }[];

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid #f1f5f9',
      marginBottom: 16, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', minHeight: 200,
      }}>
        {/* ─── Left: Stats ─── */}
        <div style={{
          flex: '0 0 280px', padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: 16,
          borderLeft: isRTL ? 'none' : '1px solid #f1f5f9',
          borderRight: isRTL ? '1px solid #f1f5f9' : 'none',
        }}>
          {/* Title with pulse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: onlineCount > 0 ? '#22c55e' : '#cbd5e1',
              boxShadow: onlineCount > 0 ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
              animation: onlineCount > 0 ? 'online-pulse 2s ease-in-out infinite' : 'none',
            }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0b1020' }}>
              {isRTL ? 'المتصلون الآن' : 'Online Now'}
            </h3>
          </div>

          {/* Big number */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '1rem', borderRadius: 14,
            background: `linear-gradient(135deg, ${theme.primary}08, ${theme.primary}15)`,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: theme.gradient, display: 'grid', placeItems: 'center',
            }}>
              <Users size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: theme.primary, lineHeight: 1 }}>
                {onlineCount}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
                {isRTL ? 'متصل الآن' : 'online now'}
              </p>
            </div>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              flex: 1, padding: '0.75rem', borderRadius: 12,
              background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <UserPlus size={16} color="#22c55e" />
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', lineHeight: 1 }}>{todayNew}</p>
                <p style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>{isRTL ? 'جدد اليوم' : 'new today'}</p>
              </div>
            </div>
            <div style={{
              flex: 1, padding: '0.75rem', borderRadius: 12,
              background: '#fffbeb', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Trophy size={16} color="#f59e0b" />
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0b1020', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {topCountry ? (resolveCountry(topCountry.country)?.nameAr || topCountry.country) : '--'}
                </p>
                <p style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>{isRTL ? 'الأكثر نشاطاً' : 'most active'}</p>
              </div>
            </div>
          </div>

          {/* Country list */}
          {countries.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {countries.slice(0, 5).map((c, i) => {
                const resolved = resolveCountry(c.country);
                const name = resolved?.nameAr || c.country;
                const pct = Math.round((c.count / maxCount) * 100);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', width: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: theme.primary, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', minWidth: 16, textAlign: 'center' }}>{c.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Right: World Map ─── */}
        <div style={{
          flex: 1, minWidth: 300, padding: '1.25rem', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fafbfc',
        }}>
          {/* Simplified world map SVG */}
          <svg viewBox="0 0 100 60" style={{ width: '100%', maxWidth: 520, height: 'auto', opacity: 0.12 }}>
            {/* Simplified continents path */}
            <path d="M8,18 Q12,15 18,17 Q22,14 26,16 Q28,12 32,15 L28,22 Q24,26 20,24 Q16,28 12,25 Q8,24 8,18Z" fill="#94a3b8" /> {/* North America */}
            <path d="M22,30 Q24,28 26,30 Q28,34 26,38 Q24,42 22,40 Q20,36 22,30Z" fill="#94a3b8" /> {/* South America */}
            <path d="M42,16 Q44,14 48,15 Q52,14 54,16 Q56,14 58,16 Q56,18 54,20 Q52,22 48,20 Q44,22 42,18Z" fill="#94a3b8" /> {/* Europe */}
            <path d="M42,24 Q46,22 50,24 Q54,22 58,26 Q62,30 58,36 Q54,40 50,42 Q46,44 44,40 Q40,36 42,30Z" fill="#94a3b8" /> {/* Africa */}
            <path d="M56,16 Q60,14 66,16 Q72,14 78,18 Q82,22 80,28 Q76,32 72,30 Q68,34 62,30 Q58,26 56,22Z" fill="#94a3b8" /> {/* Asia */}
            <path d="M78,38 Q82,34 86,36 Q90,38 88,42 Q84,46 80,44 Q76,42 78,38Z" fill="#94a3b8" /> {/* Australia */}
          </svg>

          {/* Glowing dots on map */}
          {mapDots.map((dot, i) => {
            const size = Math.min(12, Math.max(6, 4 + dot.count * 2));
            return (
              <div key={i} title={`${dot.nameAr}: ${dot.count}`} style={{
                position: 'absolute',
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                transform: 'translate(-50%, -50%)',
                width: size, height: size,
                borderRadius: '50%',
                background: theme.primary,
                boxShadow: `0 0 ${size}px ${theme.primary}80`,
                animation: 'map-dot-pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.3}s`,
                cursor: 'default',
                zIndex: 2,
              }}>
                {/* Label */}
                <div style={{
                  position: 'absolute', bottom: size + 4, left: '50%', transform: 'translateX(-50%)',
                  background: '#0b1020', color: '#fff', padding: '2px 6px', borderRadius: 4,
                  fontSize: '0.55rem', fontWeight: 700, whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  {dot.nameAr} ({dot.count})
                </div>
              </div>
            );
          })}

          {/* No visitors overlay */}
          {onlineCount === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', zIndex: 3,
            }}>
              <Globe size={36} color="#cbd5e1" />
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginTop: 8 }}>
                {isRTL ? 'لا يوجد متصلين حالياً' : 'No visitors online'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes online-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
          50% { opacity: 0.6; box-shadow: 0 0 16px rgba(34,197,94,0.8); }
        }
        @keyframes map-dot-pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.4); }
        }
      `}</style>
    </div>
  );
}

// ─── Skeleton Row ───
function SkeletonBlock({ w, h, r = 6 }: { w: string | number; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  );
}

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
          <td style={{ padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SkeletonBlock w={34} h={34} r={10} />
              <div>
                <SkeletonBlock w={100} h={14} />
                <div style={{ marginTop: 6 }}><SkeletonBlock w={140} h={10} /></div>
              </div>
            </div>
          </td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={50} h={20} r={6} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={60} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={30} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={55} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={42} h={20} r={6} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={70} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <SkeletonBlock w={30} h={30} r={6} />
              <SkeletonBlock w={30} h={30} r={6} />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── مودال تأكيد الحظر ───
function BlockConfirmModal({ user, theme, onClose, onConfirm, blocking }: {
  user: User; theme: ColorTheme; onClose: () => void; onConfirm: () => void; blocking: boolean;
}) {
  const isBlocked = user.status === 'محظور';
  const { t, isRTL } = useAdminLang();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', width: '90%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: isBlocked ? '#f0fdf4' : '#fef2f2',
            display: 'grid', placeItems: 'center',
          }}>
            {isBlocked ? <UserCheck size={26} color="#16a34a" /> : <UserX size={26} color="#dc2626" />}
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020', marginBottom: 6 }}>
            {isBlocked ? t('إلغاء الحظر') : t('حظر المستخدم')}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
            {isBlocked
              ? (isRTL ? <>هل تريد إلغاء حظر <strong>{user.name}</strong>؟ سيتمكن من الوصول للمتجر مجدداً.</> : <>Do you want to unblock <strong>{user.name}</strong>? They will regain access to the store.</>)
              : (isRTL ? <>هل أنت متأكد من حظر <strong>{user.name}</strong>؟ لن يتمكن من تسجيل الدخول أو الشراء.</> : <>Are you sure you want to block <strong>{user.name}</strong>? They won't be able to log in or purchase.</>)
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '0.65rem', borderRadius: 12,
            background: '#f1f5f9', border: 'none', color: '#64748b',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
          }}>{t('إلغاء')}</button>
          <button onClick={onConfirm} disabled={blocking} style={{
            flex: 1, padding: '0.65rem', borderRadius: 12,
            background: isBlocked ? '#16a34a' : '#dc2626', border: 'none', color: '#fff',
            fontSize: '0.85rem', fontWeight: 700, cursor: blocking ? 'wait' : 'pointer',
            fontFamily: 'Tajawal, sans-serif', opacity: blocking ? 0.7 : 1,
          }}>
            {blocking ? t('جارٍ...') : isBlocked ? t('إلغاء الحظر') : t('تأكيد الحظر')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── مودال تعديل الرصيد ───
function WalletModal({ user, theme, onClose, onDone }: { user: User; theme: ColorTheme; onClose: () => void; onDone: (newBalance: number) => void }) {
  const [mode, setMode] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const { t, isRTL } = useAdminLang();

  const submit = async () => {
    if (submitting || numAmount <= 0) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const finalAmount = mode === 'deduct' ? -numAmount : numAmount;
      const res = await adminApi.updateCustomerWallet(user.id, finalAmount);
      const nb = parseFloat(res?.wallet_balance ?? 0);
      setSuccess(isRTL ? `تم ${mode === 'add' ? 'إضافة' : 'خصم'} $${numAmount.toFixed(2)} بنجاح. الرصيد الجديد: $${nb.toFixed(2)}` : `Successfully ${mode === 'add' ? 'added' : 'deducted'} $${numAmount.toFixed(2)}. New balance: $${nb.toFixed(2)}`);
      onDone(nb);
      setAmount('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('فشلت العملية'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', width: '90%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={20} color={theme.primary} /> {t('تعديل الرصيد')}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={14} /></button>
        </div>

        {/* معلومات المستخدم */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem', background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.gradient, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>{user.name.charAt(0)}</div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>{user.name}</p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('الرصيد الحالي:')} <strong style={{ color: '#0b1020' }}>${(user.wallet_balance ?? 0).toFixed(2)}</strong></p>
          </div>
        </div>

        {/* اختيار إضافة / خصم */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button onClick={() => { setMode('add'); setError(null); setSuccess(null); }} style={{ flex: 1, padding: '0.6rem', borderRadius: 10, border: mode === 'add' ? `2px solid ${theme.primary}` : '2px solid #e2e8f0', background: mode === 'add' ? `${theme.primary}15` : '#fff', color: mode === 'add' ? theme.primary : '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={14} /> {t('إضافة رصيد')}
          </button>
          <button onClick={() => { setMode('deduct'); setError(null); setSuccess(null); }} style={{ flex: 1, padding: '0.6rem', borderRadius: 10, border: mode === 'deduct' ? '2px solid #ef4444' : '2px solid #e2e8f0', background: mode === 'deduct' ? '#fef2f215' : '#fff', color: mode === 'deduct' ? '#ef4444' : '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Minus size={14} /> {t('خصم رصيد')}
          </button>
        </div>

        {/* حقل المبلغ */}
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>{t('المبلغ ($)')}</label>
        <input
          type="number" min="0" step="0.01" value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '1rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }}
        />

        {error && <div style={{ marginTop: 10, padding: '0.6rem 0.85rem', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.78rem', fontWeight: 700 }}>{error}</div>}
        {success && <div style={{ marginTop: 10, padding: '0.6rem 0.85rem', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>{success}</div>}

        <button
          onClick={submit}
          disabled={numAmount <= 0 || submitting}
          style={{
            width: '100%', marginTop: 14, padding: '0.7rem',
            borderRadius: 12,
            background: mode === 'add' ? theme.primary : '#ef4444',
            color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700,
            cursor: numAmount > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'Tajawal, sans-serif',
            opacity: numAmount > 0 ? 1 : 0.5,
          }}>
          {submitting ? t('جارٍ التنفيذ...') : mode === 'add' ? (isRTL ? `إضافة $${numAmount.toFixed(2)}` : `Add $${numAmount.toFixed(2)}`) : (isRTL ? `خصم $${numAmount.toFixed(2)}` : `Deduct $${numAmount.toFixed(2)}`)}
        </button>
      </div>
    </div>
  );
}

// ─── Role filter tabs ───
const ROLE_FILTERS = [
  { key: 'all', label: 'الكل', icon: Users },
  { key: 'customer', label: 'الزبائن', icon: UserCheck },
  { key: 'staff', label: 'المشرفين', icon: ShieldCheck },
  { key: 'blocked', label: 'المحظورين', icon: UserX },
] as const;

type RoleFilter = typeof ROLE_FILTERS[number]['key'];

const PER_PAGE = 15;

export default function UsersAdminPage({ theme, isActive }: { theme: ColorTheme; isActive?: boolean }) {
  const { t, isRTL } = useAdminLang();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [total, setTotal] = useState(0);
  const [walletUser, setWalletUser] = useState<User | null>(null);
  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; type: 'customer' | 'staff' } | null>(null);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [copiedEmail, setCopiedEmail] = useState('');
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [customersRes, staffRes] = await Promise.allSettled([
        adminApi.getCustomers(1, 200, ''),
        adminApi.getUsers(),
      ]);

      const allUsers: User[] = [];
      let customersCount = 0;
      let staffCount = 0;

      if (customersRes.status === 'fulfilled') {
        const raw = customersRes.value;
        const customers = Array.isArray(raw) ? raw : (Array.isArray(raw?.customers) ? raw.customers : []);
        customersCount = customers.length;
        customers.forEach((u: Record<string, unknown>) => {
          allUsers.push({
            id: Number(u.id),
            name: String(u.name || ''),
            email: String(u.email || ''),
            role: u.is_blocked ? 'محظور' : 'زبون',
            status: u.is_blocked ? 'محظور' : 'نشط',
            joined: u.created_at ? new Date(String(u.created_at)).toLocaleDateString('ar-EG') : '--',
            _raw_created_at: u.created_at ? String(u.created_at) : '',
            orders: Number(u.orders || 0),
            spent: String(u.spent || '$0.00'),
            wallet_balance: Number(u.wallet_balance || 0),
            _type: 'customer',
          });
        });
      }

      if (staffRes.status === 'fulfilled') {
        const raw = staffRes.value;
        const staff = Array.isArray(raw) ? raw : (Array.isArray(raw?.users) ? raw.users : []);
        // Filter out admin accounts — only show moderators
        const nonAdminStaff = staff.filter((u: Record<string, unknown>) => String(u.role) !== 'admin');
        staffCount = nonAdminStaff.length;
        nonAdminStaff.forEach((u: Record<string, unknown>) => {
          allUsers.push({
            id: Number(u.id),
            name: String(u.name || ''),
            email: String(u.email || ''),
            role: 'مشرف',
            status: 'نشط',
            joined: u.created_at ? new Date(String(u.created_at)).toLocaleDateString('ar-EG') : '--',
            _raw_created_at: u.created_at ? String(u.created_at) : '',
            orders: 0,
            spent: '$0.00',
            _type: 'staff',
          });
        });
      }

      setUsers(allUsers);
      setTotal(customersCount + staffCount);
      setFetchError(false);
    } catch {
      setUsers([]);
      setTotal(0);
      setFetchError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (isActive) loadData(); }, [isActive, loadData]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!isActive) {
      if (refreshRef.current) { clearInterval(refreshRef.current); refreshRef.current = null; }
      return;
    }
    refreshRef.current = setInterval(() => { loadData(true); }, 60000);
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [isActive, loadData]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(''), 1500);
  }

  function exportUsersCSV() {
    const headers = [t('الاسم'), t('الإيميل'), t('الدور'), t('الرصيد'), t('الطلبات'), t('الإنفاق'), t('الحالة'), t('تاريخ التسجيل')];
    const rows = filtered.map(u => [
      u.name, u.email, u.role,
      u._type === 'customer' ? (u.wallet_balance ?? 0).toFixed(2) : '',
      u.orders, u.spent, u.status, u.joined,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`));
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  }

  // ─── Computed stats ───
  const statCounts = useMemo(() => {
    const customers = users.filter(u => u._type === 'customer' && u.status !== 'محظور').length;
    const staff = users.filter(u => u._type === 'staff').length;
    const blocked = users.filter(u => u.status === 'محظور').length;
    return { total: users.length, customers, staff, blocked };
  }, [users]);

  // ─── Filtered + searched + paginated ───
  const filtered = useMemo(() => {
    let list = users;
    // Role filter
    if (roleFilter === 'customer') list = list.filter(u => u._type === 'customer' && u.status !== 'محظور');
    else if (roleFilter === 'staff') list = list.filter(u => u._type === 'staff');
    else if (roleFilter === 'blocked') list = list.filter(u => u.status === 'محظور');
    // Search
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    // Sort — default: highest balance first
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'name') return dir * a.name.localeCompare(b.name);
        if (sortKey === 'balance') return dir * ((a.wallet_balance ?? 0) - (b.wallet_balance ?? 0));
        if (sortKey === 'orders') return dir * ((a.orders ?? 0) - (b.orders ?? 0));
        if (sortKey === 'spent') return dir * (parseFloat((a.spent || '0').replace(/[^0-9.-]/g, '') || '0') - parseFloat((b.spent || '0').replace(/[^0-9.-]/g, '') || '0'));
        if (sortKey === 'joined') {
          const da = new Date(a._raw_created_at || '1970-01-01').getTime();
          const db = new Date(b._raw_created_at || '1970-01-01').getTime();
          return dir * (da - db);
        }
        return 0;
      });
    } else {
      // Default sort: highest wallet balance first
      list = [...list].sort((a, b) => (b.wallet_balance ?? 0) - (a.wallet_balance ?? 0));
    }
    return list;
  }, [users, search, roleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  // Reset page when filter/search changes
  useEffect(() => { setPage(1); }, [roleFilter, search, sortKey, sortDir]);

  // ─── Handle block/unblock ───
  const handleBlockToggle = async () => {
    if (!blockUser) return;
    const isBlocked = blockUser.status === 'محظور';
    setBlocking(true);
    try {
      await adminApi.toggleBlockCustomer(blockUser.id, !isBlocked);
      setUsers(prev => prev.map(u => {
        if (u.id === blockUser.id && u._type === blockUser._type) {
          return { ...u, status: isBlocked ? 'نشط' : 'محظور', role: isBlocked ? 'زبون' : 'محظور' };
        }
        return u;
      }));
      setBlockUser(null);
    } catch (err) {
      console.error('Block toggle error:', err);
    } finally {
      setBlocking(false);
    }
  };

  // Stat cards data
  const statCards = [
    { label: 'إجمالي المستخدمين', value: statCounts.total, icon: Users, color: theme.primary, bg: `${theme.primary}12` },
    { label: 'الزبائن النشطين', value: statCounts.customers, icon: UserCheck, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'المشرفين', value: statCounts.staff, icon: ShieldCheck, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'المحظورين', value: statCounts.blocked, icon: UserX, color: '#ef4444', bg: '#fef2f2' },
  ];

  // ─── If a user is selected, show UserDetailsPage ───
  if (selectedUser) {
    return (
      <UserDetailsPage
        theme={theme}
        userId={selectedUser.id}
        userType={selectedUser.type}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <>
      {fetchError && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', background: '#fff', borderRadius: 16, fontFamily: 'Tajawal, sans-serif' }}>
          <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>{t('يجري تحديث النظام، يرجى الانتظار قليلاً ثم حاول مرة أخرى')}</p>
        </div>
      )}
      {!fetchError && <>
      {/* Live Visitors Card */}
      <LiveVisitorsCard theme={theme} isRTL={isRTL} t={t} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={22} color={theme.primary} />
          {t('المستخدمين')}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>({filtered.length})</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={exportUsersCSV} title="CSV" style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#fff', border: '1px solid #e2e8f0',
            cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b',
          }}><Download size={15} /></button>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            title={t('تحديث البيانات')}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#fff', border: '1px solid #e2e8f0',
              cursor: refreshing ? 'wait' : 'pointer',
              display: 'grid', placeItems: 'center',
              color: '#64748b',
            }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.5rem 0.85rem', borderRadius: 10,
            background: '#fff', border: '1px solid #e2e8f0',
          }}>
            <Search size={14} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('بحث عن مستخدم...')}
              style={{ border: 'none', outline: 'none', width: 180, fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif', background: 'transparent' }}
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16,
      }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '1rem',
              border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12,
              transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon size={18} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b1020', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{t(s.label)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {ROLE_FILTERS.map(f => {
          const Icon = f.icon;
          const active = roleFilter === f.key;
          const count = f.key === 'all' ? statCounts.total
            : f.key === 'customer' ? statCounts.customers
            : f.key === 'staff' ? statCounts.staff
            : statCounts.blocked;
          return (
            <button key={f.key} onClick={() => setRoleFilter(f.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 0.85rem', borderRadius: 10,
              background: active ? `${theme.primary}12` : '#fff',
              border: active ? `1.5px solid ${theme.primary}40` : '1px solid #e2e8f0',
              color: active ? theme.primary : '#64748b',
              fontSize: '0.78rem', fontWeight: active ? 700 : 500,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              transition: 'all 0.15s',
            }}>
              <Icon size={14} />
              {t(f.label)}
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9,
                background: active ? theme.primary : '#e2e8f0',
                color: active ? '#fff' : '#64748b',
                fontSize: '0.6rem', fontWeight: 800,
                display: 'grid', placeItems: 'center',
                padding: '0 4px', fontFamily: 'system-ui',
              }}>{count}</span>
            </button>
          );
        })}
      </div>
      {/* Results counter */}
      {!loading && (
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 8 }}>
          {isRTL ? `عرض ${paginated.length} من ${filtered.length} مستخدم` : `Showing ${paginated.length} of ${filtered.length} users`}
        </div>
      )}
      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid #f1f5f9', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {[
                  { label: t('المستخدم'), key: 'name' },
                  { label: t('الرصيد'), key: 'balance' },
                  { label: t('الطلبات'), key: 'orders' },
                  { label: t('الإنفاق'), key: 'spent' },
                  { label: t('الحالة'), key: '' },
                  { label: t('تاريخ التسجيل'), key: 'joined' },
                  { label: t('إجراءات'), key: '' },
                ].map((h, i) => (
                  <th key={i} onClick={() => h.key && toggleSort(h.key)} style={{
                    padding: '0.85rem 1rem', textAlign: isRTL ? 'right' : 'left',
                    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                    borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                    cursor: h.key ? 'pointer' : 'default', userSelect: 'none',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {h.label}
                      {h.key && <ArrowUpDown size={11} color={sortKey === h.key ? theme.primary : '#cbd5e1'} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton /> : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                      <Inbox size={36} color="#cbd5e1" />
                      <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                        {search.trim() ? t('لا توجد نتائج مطابقة للبحث') : t('لا يوجد مستخدمين')}
                      </p>
                      {search.trim() && (
                        <button onClick={() => setSearch('')} style={{
                          padding: '0.4rem 1rem', borderRadius: 8,
                          background: `${theme.primary}12`, border: 'none',
                          color: theme.primary, fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                        }}>{t('مسح البحث')}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(user => {
                return (
                  <tr key={`${user._type}-${user.id}`} style={{
                    borderBottom: '1px solid #f8fafc',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fafbfc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          background: theme.gradient,
                          display: 'grid', placeItems: 'center',
                          color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                          flexShrink: 0,
                        }}>
                          {user.name.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                          <p onClick={(e) => { e.stopPropagation(); copyEmail(user.email); }} style={{ fontSize: '0.68rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }} title={isRTL ? 'انقر للنسخ' : 'Click to copy'}>
                            {user.email}
                            {copiedEmail === user.email ? <CheckCircle size={10} color="#22c55e" /> : <Copy size={10} color="#cbd5e1" />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: user._type === 'customer' ? '#0b1020' : '#94a3b8' }}>
                      {user._type === 'customer' ? `$${(user.wallet_balance ?? 0).toFixed(2)}` : '--'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>{user.orders}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155', fontWeight: 700 }}>{user.spent}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: 6,
                        fontSize: '0.72rem', fontWeight: 700,
                        background: user.status === 'نشط' ? '#dcfce7' : '#fee2e2',
                        color: user.status === 'نشط' ? '#16a34a' : '#dc2626',
                      }}>{t(user.status)}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#94a3b8' }}>{user.joined}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setSelectedUser({ id: user.id, type: user._type || 'customer' })} title={t('عرض التفاصيل')} style={{
                            width: 30, height: 30, borderRadius: 6, border: 'none',
                            background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          ><Eye size={13} color="#3b82f6" /></button>
                        {user._type === 'customer' && (
                          <button onClick={() => setWalletUser(user)} title={t('تعديل الرصيد')} style={{
                            width: 30, height: 30, borderRadius: 6, border: 'none',
                            background: '#f0fdf4', cursor: 'pointer', display: 'grid', placeItems: 'center',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          ><Wallet size={13} color="#16a34a" /></button>
                        )}
                        {user._type === 'customer' && (
                          <button
                            onClick={() => setBlockUser(user)}
                            title={user.status === 'محظور' ? t('إلغاء الحظر') : t('حظر المستخدم')}
                            style={{
                              width: 30, height: 30, borderRadius: 6, border: 'none',
                              background: user.status === 'محظور' ? '#f0fdf4' : '#fee2e2',
                              cursor: 'pointer', display: 'grid', placeItems: 'center',
                              transition: 'transform 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            {user.status === 'محظور'
                              ? <UserCheck size={13} color="#16a34a" />
                              : <Shield size={13} color="#dc2626" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            padding: '0.85rem 1rem', borderTop: '1px solid #f1f5f9',
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: page === 1 ? '#f8fafc' : '#fff',
                border: '1px solid #e2e8f0', cursor: page === 1 ? 'default' : 'pointer',
                display: 'grid', placeItems: 'center',
                opacity: page === 1 ? 0.4 : 1,
              }}
            ><ChevronRight size={14} color="#64748b" /></button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('dots');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === 'dots' ? (
                  <span key={`dots-${idx}`} style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '0 4px' }}>...</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)} style={{
                    minWidth: 32, height: 32, borderRadius: 8,
                    background: page === p ? theme.primary : '#fff',
                    border: page === p ? 'none' : '1px solid #e2e8f0',
                    color: page === p ? '#fff' : '#64748b',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'system-ui',
                  }}>{p}</button>
                )
              )
            }

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: page === totalPages ? '#f8fafc' : '#fff',
                border: '1px solid #e2e8f0', cursor: page === totalPages ? 'default' : 'pointer',
                display: 'grid', placeItems: 'center',
                opacity: page === totalPages ? 0.4 : 1,
              }}
            ><ChevronLeft size={14} color="#64748b" /></button>

            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, ...(isRTL ? { marginRight: 8 } : { marginLeft: 8 }) }}>
              {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} {t('من')} {filtered.length}
            </span>
          </div>
        )}
      </div>

      {/* مودال تعديل الرصيد */}
      {walletUser && (
        <WalletModal
          user={walletUser}
          theme={theme}
          onClose={() => setWalletUser(null)}
          onDone={(newBalance) => {
            setUsers(prev => prev.map(u => u.id === walletUser.id && u._type === 'customer' ? { ...u, wallet_balance: newBalance } : u));
          }}
        />
      )}

      {/* مودال تأكيد الحظر */}
      {blockUser && (
        <BlockConfirmModal
          user={blockUser}
          theme={theme}
          onClose={() => setBlockUser(null)}
          onConfirm={handleBlockToggle}
          blocking={blocking}
        />
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </>}
    </>
  );
}
