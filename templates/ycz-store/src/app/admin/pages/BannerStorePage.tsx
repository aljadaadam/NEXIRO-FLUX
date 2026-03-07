'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Store, Download, Trash2, Loader2, Check, Image, Eye, EyeOff, RefreshCw, Sparkles, X, CreditCard, Copy, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAdminLang } from '@/providers/AdminLanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface BannerTemplate {
  id: number;
  name: string;
  preview_image: string | null;
  category: string;
  design_data: { title?: string; subtitle?: string; icon?: string; gradient?: string; desc?: string; description?: string; image_url?: string; link?: string; badges?: string[]; meshColor1?: string; meshColor2?: string };
  price: number;
  is_active: number;
}

interface InstalledBanner {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  image_url: string;
  is_active: number;
  template_id: number | null;
  description: string;
  extra_data: string | { badges?: string[]; gradient?: string };
}

interface Gateway {
  id: number;
  type: string;
  name: string;
  name_en: string;
  wallet_address?: string;
  network?: string;
  account_number?: string;
  full_name?: string;
  exchange_rate?: string;
  receipt_note?: string;
}

interface PurchaseState {
  templateId: number;
  step: 'select_method' | 'payment_details' | 'waiting' | 'done';
  gateways: Gateway[];
  selectedGateway: Gateway | null;
  paymentId: number | null;
  paymentData: Record<string, unknown>;
  receiptRef: string;
  txHash: string;
  loadingGateways: boolean;
  processing: boolean;
}

export default function BannerStorePage({ isActive }: { isActive?: boolean } = {}) {
  const { t } = useAdminLang();
  const { currentTheme } = useTheme();
  const [tab, setTab] = useState<'store' | 'installed'>('store');
  const [templates, setTemplates] = useState<BannerTemplate[]>([]);
  const [installedIds, setInstalledIds] = useState<number[]>([]);
  const [templateBannerMap, setTemplateBannerMap] = useState<Record<number, number>>({});
  const [myBanners, setMyBanners] = useState<InstalledBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<number | null>(null);
  const [uninstalling, setUninstalling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [purchase, setPurchase] = useState<PurchaseState | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStore = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBannerStore() as { templates: BannerTemplate[]; installedTemplateIds: number[]; templateBannerMap: Record<number, number> };
      setTemplates(data.templates || []);
      setInstalledIds(data.installedTemplateIds || []);
      setTemplateBannerMap(data.templateBannerMap || {});
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  const fetchMyBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMyBanners() as { banners: InstalledBanner[] };
      setMyBanners(data.banners || []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isActive) { tab === 'store' ? fetchStore() : fetchMyBanners(); }
  }, [isActive, tab, fetchStore, fetchMyBanners]);

  // Cleanup polling on unmount
  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  // ─── شراء بنر ───
  const openPurchase = async (templateId: number) => {
    setPurchase({ templateId, step: 'select_method', gateways: [], selectedGateway: null, paymentId: null, paymentData: {}, receiptRef: '', txHash: '', loadingGateways: true, processing: false });
    try {
      const data = await adminApi.getBannerGateways() as { gateways: Gateway[] };
      setPurchase(prev => prev ? { ...prev, gateways: data.gateways || [], loadingGateways: false } : null);
    } catch {
      setPurchase(prev => prev ? { ...prev, loadingGateways: false } : null);
    }
  };

  const selectGateway = async (gw: Gateway) => {
    if (!purchase) return;
    setPurchase(prev => prev ? { ...prev, selectedGateway: gw, processing: true } : null);
    try {
      const result = await adminApi.purchaseBanner(purchase.templateId, gw.id) as Record<string, unknown>;
      setPurchase(prev => prev ? {
        ...prev,
        step: result.method === 'manual_crypto' || result.method === 'manual_bankak' || result.method === 'qr_or_redirect' ? 'payment_details' : 'waiting',
        paymentId: result.paymentId as number,
        paymentData: result,
        processing: false,
      } : null);

      // Start auto-polling only for TRC20 (auto-detection)
      if (result.method === 'manual_crypto' && result.network === 'TRC20') {
        startPolling(result.paymentId as number, result.method as string);
      }
      // For BEP20/ERC20, user must enter TX Hash manually
      if (result.method === 'qr_or_redirect') {
        startPolling(result.paymentId as number, result.method as string);
      }
    } catch (err: unknown) {
      console.error('Purchase failed:', err);
      const errMsg = err instanceof Error ? err.message : t('فشل في بدء عملية الشراء');
      setMsg(errMsg);
      setTimeout(() => setMsg(''), 5000);
      setPurchase(prev => prev ? { ...prev, processing: false } : null);
    }
  };

  const startPolling = (paymentId: number, method: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        let res;
        if (method === 'manual_crypto') {
          res = await adminApi.checkBannerUsdt(paymentId) as { verified?: boolean; status?: string };
          if (res.verified) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPurchase(prev => prev ? { ...prev, step: 'done' } : null);
            setMsg(t('تم الدفع وتثبيت البنر بنجاح! 🎉'));
            await fetchStore();
          }
        } else {
          res = await adminApi.checkBannerPurchase(paymentId) as { status?: string };
          if (res.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setPurchase(prev => prev ? { ...prev, step: 'done' } : null);
            setMsg(t('تم الدفع وتثبيت البنر بنجاح! 🎉'));
            await fetchStore();
          }
        }
      } catch { /* */ }
    }, 8000);
  };

  const submitTxHash = async () => {
    if (!purchase?.paymentId || !purchase.txHash.trim()) return;
    setPurchase(prev => prev ? { ...prev, processing: true } : null);
    try {
      const res = await adminApi.checkBannerUsdt(purchase.paymentId, purchase.txHash.trim()) as { verified?: boolean; error?: string; message?: string };
      if (res.verified) {
        setPurchase(prev => prev ? { ...prev, step: 'done', processing: false } : null);
        setMsg(t('تم الدفع وتثبيت البنر بنجاح! 🎉'));
        await fetchStore();
      } else {
        setPurchase(prev => prev ? { ...prev, processing: false } : null);
        setMsg(res.message || t('لم يتم التحقق، تأكد من هاش المعاملة'));
        setTimeout(() => setMsg(''), 5000);
      }
    } catch {
      setPurchase(prev => prev ? { ...prev, processing: false } : null);
    }
  };

  const submitReceipt = async () => {
    if (!purchase?.paymentId || !purchase.receiptRef.trim()) return;
    setPurchase(prev => prev ? { ...prev, processing: true } : null);
    try {
      await adminApi.uploadBannerReceipt(purchase.paymentId, purchase.receiptRef.trim());
      setPurchase(prev => prev ? { ...prev, step: 'waiting', processing: false } : null);
      setMsg(t('تم إرسال الإيصال، بانتظار تأكيد الإدارة'));
      // Start polling for admin approval
      startPolling(purchase.paymentId, 'bankak');
    } catch {
      setPurchase(prev => prev ? { ...prev, processing: false } : null);
    }
  };

  const closePurchase = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPurchase(null);
  };

  const handleInstall = async (templateId: number) => {
    setInstalling(templateId);
    setMsg('');
    try {
      await adminApi.installBanner(templateId);
      setMsg(t('تم تثبيت البنر بنجاح'));
      await fetchStore();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: unknown) {
      // 402 = يجب الدفع → فتح نافذة الشراء
      if (err instanceof Error && err.message.includes('يجب الدفع')) {
        openPurchase(templateId);
      }
    } finally { setInstalling(null); }
  };

  const handleUninstall = async (templateId: number) => {
    const bannerId = templateBannerMap[templateId];
    if (!bannerId || !confirm(t('هل تريد إلغاء تثبيت هذا البنر؟'))) return;
    setUninstalling(templateId);
    try {
      await adminApi.deleteBanner(bannerId);
      await fetchStore();
      setMsg(t('تم إلغاء التثبيت'));
      setTimeout(() => setMsg(''), 3000);
    } catch { /* */ } finally { setUninstalling(null); }
  };

  const handleDelete = async (bannerId: number) => {
    if (!confirm(t('هل تريد حذف هذا البنر؟'))) return;
    setDeleting(bannerId);
    try {
      await adminApi.deleteBanner(bannerId);
      setMyBanners(prev => prev.filter(b => b.id !== bannerId));
    } catch { /* */ } finally { setDeleting(null); }
  };

  const handleToggle = async (banner: InstalledBanner) => {
    setToggling(banner.id);
    try {
      await adminApi.toggleBanner(banner.id, !banner.is_active);
      setMyBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: b.is_active ? 0 : 1 } : b));
    } catch { /* */ } finally { setToggling(null); }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [...new Set(templates.map(t => t.category))];
  const filtered = categoryFilter ? templates.filter(t => t.category === categoryFilter) : templates;

  const GwLogo = ({ type }: { type: string }) => {
    if (type === 'usdt') return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#26A17B"/>
        <path d="M17.9 17.05v-.005c-.1.007-.62.04-1.78.04-0.93 0-1.58-.028-1.82-.042v.008C11.54 16.88 9.5 16.42 9.5 15.87s2.04-1.01 4.8-1.18v1.88c.25.018.91.06 1.84.06.93 0 1.67-.05 1.78-.06v-1.88c2.75.17 4.78.67 4.78 1.18s-2.04 1.01-4.78 1.18zm0-2.56v-1.68h4.98V10h-13.8v2.81h4.98v1.68c-3.12.2-5.47.84-5.47 1.6s2.35 1.4 5.47 1.6v5.73h3.6v-5.73c3.1-.2 5.44-.84 5.44-1.6s-2.34-1.4-5.44-1.6h.26z" fill="white"/>
      </svg>
    );
    if (type === 'binance') return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#F0B90B"/>
        <path d="M16 8l2.47 2.47-5.15 5.15L10.85 13.15 16 8zm5.53 5.53L24 16l-2.47 2.47-5.15-5.15 2.47-2.47-.32-.32zm-11.06 0l2.47 2.47-5.15 5.15L5.32 18.68l.32-.32 4.83-4.83zM16 18.68l2.47 2.47L16 23.62l-2.47-2.47L16 18.68z" fill="white"/>
      </svg>
    );
    if (type === 'bankak') return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#1E40AF"/>
        <path d="M16 8l8 4v2H8v-2l8-4zm-6 8h3v6h-3v-6zm4.5 0h3v6h-3v-6zm4.5 0h3v6h-3v-6zM8 24h16v2H8v-2z" fill="white"/>
      </svg>
    );
    return <CreditCard size={32} style={{ color: '#94a3b8' }} />;
  };
  const gwLabel = (gw: Gateway) => {
    if (gw.type === 'usdt') return `USDT (${gw.network || 'TRC20'})`;
    if (gw.type === 'bankak') return t('بنكك');
    if (gw.type === 'binance') return 'Binance Pay';
    return gw.name;
  };

  /* ── Preview components ── */
  const BannerPreview = ({ design, name }: { design: BannerTemplate['design_data']; name: string }) => (
    <div style={{
      height: 180, position: 'relative', overflow: 'hidden',
      background: design.gradient || `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
      borderRadius: '16px 16px 0 0',
      display: 'flex', alignItems: 'center', padding: '1.2rem 1.5rem', gap: '1.2rem', direction: 'rtl',
    }}>
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${design.meshColor1 || 'rgba(255,255,255,0.15)'} 0%, transparent 70%)`, top: '-30%', right: '-5%', filter: 'blur(30px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${design.meshColor2 || 'rgba(255,255,255,0.1)'} 0%, transparent 70%)`, bottom: '-20%', left: '-5%', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '16px 16px', pointerEvents: 'none' }} />
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
        {design.title && <div style={{ display: 'inline-block', borderRadius: 14, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', padding: '2px 10px', fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>{design.title}</div>}
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1.3 }}>{design.subtitle || name}</h3>
        {(design.desc || design.description) && <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px', lineHeight: 1.4, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{design.desc || design.description}</p>}
        {design.badges && design.badges.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{design.badges.map((badge, i) => <span key={i} style={{ borderRadius: 12, padding: '2px 8px', fontSize: '0.55rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>{badge}</span>)}</div>}
      </div>
      {design.image_url && <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}><div style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', filter: 'blur(8px)' }} /><img src={design.image_url} alt={name} style={{ width: 90, height: 90, objectFit: 'contain', borderRadius: 16, position: 'relative', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} /></div>}
      {!design.image_url && design.icon && <div style={{ width: 60, height: 60, borderRadius: 16, flexShrink: 0, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', fontSize: '1.8rem', position: 'relative', zIndex: 2 }}>{design.icon}</div>}
    </div>
  );

  const InstalledPreview = ({ banner }: { banner: InstalledBanner }) => {
    const extraData = typeof banner.extra_data === 'string' ? (() => { try { return JSON.parse(banner.extra_data); } catch { return {}; } })() : (banner.extra_data || {});
    const gradient = extraData.gradient || `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`;
    const badges: string[] = extraData.badges || [];
    return (
      <div style={{ height: 120, position: 'relative', overflow: 'hidden', background: gradient, borderRadius: 14, display: 'flex', alignItems: 'center', padding: '1rem 1.2rem', gap: '1rem', direction: 'rtl', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '14px 14px', pointerEvents: 'none' }} />
        <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-block', borderRadius: 12, background: 'rgba(255,255,255,0.18)', padding: '2px 8px', fontSize: '0.55rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>{banner.title}</div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', margin: '0 0 3px', lineHeight: 1.3 }}>{banner.subtitle || '—'}</h4>
          {badges.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{badges.slice(0, 3).map((b, i) => <span key={i} style={{ borderRadius: 10, padding: '1px 6px', fontSize: '0.5rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>{b}</span>)}</div>}
        </div>
        {banner.image_url && <img src={banner.image_url} alt="" style={{ width: 65, height: 65, objectFit: 'contain', borderRadius: 12, position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />}
      </div>
    );
  };

  /* ── Payment Modal ── */
  const PaymentModal = () => {
    if (!purchase) return null;
    const tmpl = templates.find(t => t.id === purchase.templateId);
    if (!tmpl) return null;

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={closePurchase}>
        <div style={{ background: '#fff', borderRadius: 20, width: '95%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${currentTheme.primary}15`, display: 'grid', placeItems: 'center' }}>
                <CreditCard size={20} style={{ color: currentTheme.primary }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t('شراء بنر')}</h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{tmpl.name}</p>
              </div>
            </div>
            <button onClick={closePurchase} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#94a3b8' }}><X size={16} /></button>
          </div>

          {/* Price badge */}
          <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '8px 24px', borderRadius: 12, background: `linear-gradient(135deg, ${currentTheme.primary}12, ${currentTheme.accent || currentTheme.primary}12)`, border: `1px solid ${currentTheme.primary}25`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: currentTheme.primary }}>${tmpl.price}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>USD</span>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px' }}>
            {/* Step 1: Select payment method */}
            {purchase.step === 'select_method' && (
              purchase.loadingGateways ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: currentTheme.primary }} />
                </div>
              ) : purchase.gateways.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                  <CreditCard size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p style={{ fontSize: '0.85rem' }}>{t('لا توجد بوابات دفع متاحة حالياً')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', margin: '0 0 4px' }}>{t('اختر طريقة الدفع')}</p>
                  {purchase.gateways.map(gw => (
                    <button key={gw.id} onClick={() => selectGateway(gw)} disabled={purchase.processing} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff',
                      cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                      opacity: purchase.processing ? 0.6 : 1,
                    }}>
                      <GwLogo type={gw.type} />
                      <div style={{ flex: 1, textAlign: 'start' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{gwLabel(gw)}</p>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{gw.name}</p>
                      </div>
                      {purchase.processing && purchase.selectedGateway?.id === gw.id ? (
                        <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite', color: currentTheme.primary }} />
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>←</span>
                      )}
                    </button>
                  ))}
                </div>
              )
            )}

            {/* Step 2: Payment details */}
            {purchase.step === 'payment_details' && purchase.paymentData && (
              <div>
                {/* USDT */}
                {purchase.paymentData.method === 'manual_crypto' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400e', margin: 0 }}>
                        💲 {t('أرسل المبلغ التالي إلى عنوان المحفظة')}
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px' }}>{t('المبلغ المطلوب')}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{String(purchase.paymentData.amount)} USDT</span>
                        <button onClick={() => copyText(String(purchase.paymentData.amount))} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#64748b', fontFamily: 'inherit' }}>
                          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? t('تم') : t('نسخ')}
                        </button>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px' }}>{t('الشبكة')}: {String(purchase.paymentData.network)}</p>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 6px' }}>{t('عنوان المحفظة')}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{ flex: 1, fontSize: '0.72rem', color: '#0f172a', background: '#fff', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', wordBreak: 'break-all' }}>{String(purchase.paymentData.walletAddress)}</code>
                        <button onClick={() => copyText(String(purchase.paymentData.walletAddress))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#64748b', fontFamily: 'inherit', flexShrink: 0 }}>
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* TRC20: auto-detection */}
                    {purchase.paymentData.network === 'TRC20' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                        <Loader2 size={14} style={{ animation: 'spin 1.5s linear infinite', color: '#16a34a' }} />
                        <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>{t('بانتظار تأكيد الدفع تلقائياً...')}</span>
                      </div>
                    )}

                    {/* BEP20/ERC20: TX Hash required */}
                    {purchase.paymentData.network !== 'TRC20' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', margin: 0 }}>{t('هاش المعاملة (Transaction Hash)')}</p>
                        <input
                          type="text"
                          value={purchase.txHash}
                          onChange={e => setPurchase(prev => prev ? { ...prev, txHash: e.target.value } : null)}
                          placeholder="0x..."
                          dir="ltr"
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.82rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <button onClick={submitTxHash} disabled={!purchase.txHash.trim() || purchase.processing} style={{
                          width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                          background: purchase.txHash.trim() ? '#16a34a' : '#e2e8f0',
                          color: purchase.txHash.trim() ? '#fff' : '#94a3b8',
                          fontSize: '0.88rem', fontWeight: 700, cursor: purchase.txHash.trim() ? 'pointer' : 'default',
                          fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                          {purchase.processing ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                          {t('تحقق من الدفع')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Bankak */}
                {purchase.paymentData.method === 'manual_bankak' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e40af', margin: 0 }}>
                        🏦 {t('حوّل المبلغ ثم أدخل رقم المرجع')}
                      </p>
                    </div>

                    {(() => {
                      const details = purchase.paymentData.bankakDetails as Record<string, string> | undefined;
                      return details ? (
                        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'grid', gap: 10 }}>
                            <div>
                              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>{t('الاسم')}</p>
                              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{details.full_name}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>{t('رقم الحساب')}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{details.account_number}</p>
                                <button onClick={() => copyText(details.account_number)} style={{ padding: '2px 6px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.65rem', color: '#64748b', fontFamily: 'inherit' }}>
                                  {copied ? <Check size={10} /> : <Copy size={10} />}
                                </button>
                              </div>
                            </div>
                            {purchase.paymentData.localAmount ? (
                              <div>
                                <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>{t('المبلغ بالعملة المحلية')}</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: currentTheme.primary, margin: 0 }}>{String(purchase.paymentData.localAmount)} SDG</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>{t('رقم المرجع / الإيصال')}</p>
                      <input
                        type="text"
                        value={purchase.receiptRef}
                        onChange={e => setPurchase(prev => prev ? { ...prev, receiptRef: e.target.value } : null)}
                        placeholder={t('أدخل رقم العملية')}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <button onClick={submitReceipt} disabled={!purchase.receiptRef.trim() || purchase.processing} style={{
                      width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                      background: purchase.receiptRef.trim() ? currentTheme.primary : '#e2e8f0',
                      color: purchase.receiptRef.trim() ? '#fff' : '#94a3b8',
                      fontSize: '0.88rem', fontWeight: 700, cursor: purchase.receiptRef.trim() ? 'pointer' : 'default',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      {purchase.processing ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                      {t('إرسال الإيصال')}
                    </button>
                  </div>
                )}

                {/* Binance */}
                {purchase.paymentData.method === 'qr_or_redirect' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a', width: '100%' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400e', margin: 0 }}>
                        🟡 {t('ادفع عبر Binance Pay')}
                      </p>
                    </div>
                    <a href={String(purchase.paymentData.checkoutUrl)} target="_blank" rel="noopener noreferrer" style={{
                      width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                      background: '#f0b90b', color: '#000', textAlign: 'center',
                      fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      {t('فتح Binance Pay')} →
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', width: '100%' }}>
                      <Loader2 size={14} style={{ animation: 'spin 1.5s linear infinite', color: '#16a34a' }} />
                      <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>{t('بانتظار تأكيد الدفع...')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Waiting for admin (bankak) */}
            {purchase.step === 'waiting' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Clock size={40} style={{ color: '#f59e0b', marginBottom: 12 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{t('بانتظار التأكيد')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>{t('سيتم تثبيت البنر تلقائياً بعد تأكيد الدفع')}</p>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Loader2 size={16} style={{ animation: 'spin 1.5s linear infinite', color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600 }}>{t('جارٍ المراجعة...')}</span>
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {purchase.step === 'done' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                  <Check size={28} style={{ color: '#16a34a' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{t('تم بنجاح!')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px' }}>{t('تم الدفع وتثبيت البنر في متجرك')}</p>
                <button onClick={closePurchase} style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: currentTheme.primary, color: '#fff',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {t('إغلاق')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Tajawal, sans-serif' }}>
      {/* Payment Modal */}
      <PaymentModal />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.accent}15)`, border: `1px solid ${currentTheme.primary}25`, display: 'grid', placeItems: 'center' }}>
            <Store size={22} style={{ color: currentTheme.primary }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t('متجر البنرات')}</h1>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{t('تصفح وثبت بنرات جاهزة لمتجرك')}</p>
          </div>
        </div>
        <button onClick={() => tab === 'store' ? fetchStore() : fetchMyBanners()} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', fontFamily: 'inherit' }}>
          <RefreshCw size={14} /> {t('تحديث')}
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 12, marginBottom: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> {msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
        {([
          { id: 'store' as const, label: t('المتجر'), icon: Store },
          { id: 'installed' as const, label: t('بنراتي المثبتة'), icon: Sparkles },
        ]).map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
            background: tab === item.id ? '#fff' : 'transparent',
            boxShadow: tab === item.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            color: tab === item.id ? '#0f172a' : '#94a3b8',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
          }}>
            <item.icon size={15} /> {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: currentTheme.primary }} />
        </div>
      ) : tab === 'store' ? (
        <>
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              <button onClick={() => setCategoryFilter('')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', borderColor: !categoryFilter ? currentTheme.primary : '#e2e8f0', background: !categoryFilter ? `${currentTheme.primary}10` : '#fff', color: !categoryFilter ? currentTheme.primary : '#64748b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t('الكل')}</button>
              {categories.map(c => (
                <button key={c} onClick={() => setCategoryFilter(c)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', borderColor: categoryFilter === c ? currentTheme.primary : '#e2e8f0', background: categoryFilter === c ? `${currentTheme.primary}10` : '#fff', color: categoryFilter === c ? currentTheme.primary : '#64748b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <Image size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>{t('لا توجد بنرات متاحة حالياً')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {filtered.map(tmpl => {
                const isInstalled = installedIds.includes(tmpl.id);
                const design = typeof tmpl.design_data === 'string' ? JSON.parse(tmpl.design_data) : tmpl.design_data;
                const isPaid = tmpl.price > 0;
                return (
                  <div key={tmpl.id} style={{ background: '#fff', borderRadius: 16, border: isInstalled ? `2px solid ${currentTheme.primary}40` : '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <BannerPreview design={design} name={tmpl.name} />
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{tmpl.name}</h3>
                        <span style={{
                          fontSize: '0.82rem', fontWeight: 800, padding: '4px 12px', borderRadius: 8,
                          background: isPaid ? '#fffbeb' : '#f0fdf4',
                          color: isPaid ? '#b45309' : '#16a34a',
                          border: `1px solid ${isPaid ? '#fde68a' : '#bbf7d0'}`,
                        }}>
                          {isPaid ? `$${tmpl.price}` : t('مجاني')}
                        </span>
                      </div>

                      {isInstalled ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <Check size={15} /> {t('مثبت')}
                          </div>
                          <button onClick={() => handleUninstall(tmpl.id)} disabled={uninstalling === tmpl.id} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', opacity: uninstalling === tmpl.id ? 0.7 : 1 }}>
                            {uninstalling === tmpl.id ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <X size={15} />}
                            {t('إلغاء')}
                          </button>
                        </div>
                      ) : isPaid ? (
                        <button onClick={() => openPurchase(tmpl.id)} style={{
                          width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                          background: `linear-gradient(135deg, #f59e0b, #d97706)`,
                          color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                        }}>
                          <CreditCard size={15} />
                          {t('شراء وتثبيت')} — ${tmpl.price}
                        </button>
                      ) : (
                        <button onClick={() => handleInstall(tmpl.id)} disabled={installing === tmpl.id} style={{
                          width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent || currentTheme.primary})`,
                          color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          fontFamily: 'inherit', boxShadow: `0 4px 12px ${currentTheme.primary}30`,
                          opacity: installing === tmpl.id ? 0.7 : 1,
                        }}>
                          {installing === tmpl.id ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Download size={15} />}
                          {installing === tmpl.id ? t('جاري التثبيت...') : t('تثبيت مجاني')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {myBanners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <Sparkles size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>{t('لا توجد بنرات مثبتة')}</p>
              <p style={{ fontSize: '0.78rem' }}>{t('اذهب للمتجر وثبت بنراتك الأولى')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myBanners.map(banner => (
                <div key={banner.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', opacity: banner.is_active ? 1 : 0.65 }}>
                  <InstalledPreview banner={banner} />
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{banner.title || t('بنر بدون عنوان')}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, background: banner.is_active ? '#f0fdf4' : '#fef2f2', color: banner.is_active ? '#16a34a' : '#dc2626', border: `1px solid ${banner.is_active ? '#bbf7d0' : '#fecaca'}` }}>
                      {banner.is_active ? t('مفعّل') : t('معطّل')}
                    </span>
                    <button onClick={() => handleToggle(banner)} disabled={toggling === banner.id} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b' }} title={banner.is_active ? t('إيقاف') : t('تفعيل')}>
                      {toggling === banner.id ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : banner.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => handleDelete(banner.id)} disabled={deleting === banner.id} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#dc2626' }} title={t('حذف')}>
                      {deleting === banner.id ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
