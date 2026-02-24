'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Plus, Trash2, Edit3, ToggleLeft, ToggleRight,
  X, Save, AlertTriangle, Check,
} from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

// ─── أنواع البوابات والحقول المطلوبة لكل نوع ───
const GATEWAY_TYPES = [
  { value: 'paypal', label: 'PayPal', icon: '💳', desc: 'الدفع عبر باي بال' },
  { value: 'binance', label: 'Binance Pay', icon: '🪙', desc: 'الدفع عبر بايننس باي' },
  { value: 'usdt', label: 'USDT (Crypto)', icon: '💲', desc: 'الدفع بعملة USDT' },
  { value: 'bank_transfer', label: 'تحويل بنكي', icon: '🏦', desc: 'التحويل البنكي المباشر' },
  { value: 'wallet', label: 'محفظة إلكترونية', icon: '📱', desc: 'محافظ مثل زين كاش، آسيا حوالة' },
];

type ConfigField = { key: string; label: string; placeholder: string; type?: string; required?: boolean };

const GATEWAY_CONFIG_FIELDS: Record<string, ConfigField[]> = {
  paypal: [
    { key: 'client_id', label: 'Client ID', placeholder: 'AX...', required: true },
    { key: 'secret', label: 'Secret Key', placeholder: 'EL...', type: 'password', required: true },
    { key: 'email', label: 'البريد الإلكتروني PayPal', placeholder: 'you@email.com', required: true },
    { key: 'mode', label: 'الوضع', placeholder: 'sandbox أو live', required: true },
  ],
  binance: [
    { key: 'api_key', label: 'API Key', placeholder: 'مفتاح API من بايننس', type: 'password', required: true },
    { key: 'api_secret', label: 'API Secret', placeholder: 'المفتاح السري', type: 'password', required: true },
    { key: 'binance_id', label: 'Binance Merchant ID', placeholder: 'معرف تاجر بايننس', required: true },
    { key: 'binance_email', label: 'بريد بايننس (اختياري)', placeholder: 'you@email.com' },
  ],
  usdt: [
    { key: 'wallet_address', label: 'عنوان المحفظة', placeholder: 'T... أو 0x...', required: true },
    { key: 'network', label: 'الشبكة', placeholder: 'TRC20 أو ERC20 أو BEP20', required: true },
    { key: 'contract_address', label: 'عنوان العقد (اختياري)', placeholder: '0x...' },
  ],
  bank_transfer: [
    { key: 'bank_name', label: 'اسم البنك', placeholder: 'مثال: الرافدين', required: true },
    { key: 'account_holder', label: 'اسم صاحب الحساب', placeholder: 'الاسم الكامل', required: true },
    { key: 'iban', label: 'IBAN / رقم الحساب', placeholder: 'IQ...', required: true },
    { key: 'swift', label: 'SWIFT (اختياري)', placeholder: 'BRAQ...' },
    { key: 'account_number', label: 'رقم الحساب (اختياري)', placeholder: '...' },
    { key: 'currency', label: 'العملة', placeholder: 'USD أو IQD', required: true },
  ],
  wallet: [
    { key: 'instructions', label: 'تعليمات الدفع', placeholder: 'اكتب التعليمات للعميل...', required: true },
    { key: 'contact_numbers', label: 'أرقام التواصل (اختياري)', placeholder: '07xx...' },
    { key: 'image_url', label: 'رابط صورة QR (اختياري)', placeholder: 'https://...' },
  ],
};

type Gateway = {
  id: number;
  type: string;
  name: string;
  name_en?: string;
  is_enabled: boolean;
  is_default?: boolean;
  config: Record<string, string>;
  display_order?: number;
};

export default function GxvPaymentsPanel() {
  const { currentTheme } = useGxvTheme();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGw, setEditGw] = useState<Gateway | null>(null);
  const [formType, setFormType] = useState('paypal');
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formConfig, setFormConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const loadGateways = useCallback(async () => {
    try {
      const data = await gxvAdminApi.getPaymentGateways();
      setGateways(Array.isArray(data) ? data : data?.gateways || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadGateways(); }, [loadGateways]);

  const openCreate = () => {
    setEditGw(null);
    setFormType('paypal');
    setFormName('');
    setFormNameEn('');
    setFormConfig({});
    setMsg(null);
    setShowForm(true);
  };

  const openEdit = (gw: Gateway) => {
    setEditGw(gw);
    setFormType(gw.type);
    setFormName(gw.name);
    setFormNameEn(gw.name_en || '');
    setFormConfig(gw.config || {});
    setMsg(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { setMsg({ ok: false, text: 'اسم البوابة مطلوب' }); return; }
    setSaving(true); setMsg(null);
    try {
      const payload = {
        type: formType,
        name: formName.trim(),
        name_en: formNameEn.trim() || formName.trim(),
        config: formConfig,
        is_enabled: false,
      };
      if (editGw) {
        const res = await gxvAdminApi.updatePaymentGateway(editGw.id, payload);
        if (res.error) throw new Error(res.error);
        setMsg({ ok: true, text: 'تم تحديث البوابة بنجاح ✅' });
      } else {
        const res = await gxvAdminApi.createPaymentGateway(payload);
        if (res.error) throw new Error(res.error);
        setMsg({ ok: true, text: 'تم إنشاء البوابة بنجاح ✅' });
      }
      await loadGateways();
      setTimeout(() => { setShowForm(false); setMsg(null); }, 1200);
    } catch (err: unknown) {
      setMsg({ ok: false, text: (err as Error).message || 'حدث خطأ' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await gxvAdminApi.deletePaymentGateway(id);
      await loadGateways();
      setConfirmDelete(null);
    } catch { /* ignore */ }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    try {
      const res = await gxvAdminApi.togglePaymentGateway(id);
      if (res.error) {
        const missing = res.missing_fields ? ` (${(res.missing_fields as string[]).join(', ')})` : '';
        setMsg({ ok: false, text: `${res.error}${missing}` });
        setTimeout(() => setMsg(null), 4000);
      }
      await loadGateways();
    } catch { /* ignore */ }
    setToggling(null);
  };

  const configFields = GATEWAY_CONFIG_FIELDS[formType] || [];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#e8e8ff', fontSize: '0.88rem', outline: 'none',
    fontFamily: 'Tajawal, sans-serif', transition: 'border-color 0.2s',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: '#666688', fontSize: '0.85rem', margin: 0 }}>
          أضف بوابات الدفع واملأ بياناتها لتفعيل الدفع الحقيقي في متجرك
        </p>
        <button onClick={openCreate} style={{
          padding: '10px 20px', borderRadius: 12,
          background: currentTheme.gradient, color: '#fff', border: 'none',
          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: currentTheme.glow,
        }}>
          <Plus size={16} /> إضافة بوابة
        </button>
      </div>

      {/* Global message (for toggle errors) */}
      {msg && !showForm && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 16,
          background: msg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: msg.ok ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={16} /> {msg.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* ═══ Gateway Cards ═══ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 14,
          }}>
            {gateways.map((gw, i) => {
              const typeInfo = GATEWAY_TYPES.find(t => t.value === gw.type);
              const fields = GATEWAY_CONFIG_FIELDS[gw.type] || [];
              const reqFields = fields.filter(f => f.required);
              const filledReq = reqFields.filter(f => gw.config?.[f.key]?.trim());
              const allFilled = filledReq.length === reqFields.length;

              return (
                <div key={gw.id} className="gxv-card-hover" style={{
                  padding: 0, borderRadius: 16,
                  background: 'rgba(15,15,35,0.7)',
                  border: `1px solid ${gw.is_enabled ? `${currentTheme.primary}25` : 'rgba(255,255,255,0.06)'}`,
                  overflow: 'hidden',
                  animation: `gxvSlideUp ${0.15 + i * 0.05}s ease-out both`,
                }}>
                  {/* Top accent */}
                  <div style={{
                    height: 3,
                    background: gw.is_enabled
                      ? `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.primary}60, transparent)`
                      : 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)',
                  }} />

                  <div style={{ padding: '20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '2rem' }}>{typeInfo?.icon || '🔌'}</span>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                            {gw.name}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#555577' }}>
                            {typeInfo?.desc || gw.type}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 12px', borderRadius: 8,
                        background: gw.is_enabled ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                        color: gw.is_enabled ? '#4ade80' : '#666688',
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {gw.is_enabled ? '✓ مفعّل' : 'معطّل'}
                      </div>
                    </div>

                    {/* Config status badge */}
                    <div style={{
                      padding: '8px 14px', borderRadius: 10,
                      background: allFilled ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)',
                      border: `1px solid ${allFilled ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'}`,
                      marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      {allFilled ? (
                        <Check size={14} style={{ color: '#4ade80' }} />
                      ) : (
                        <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                      )}
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 600,
                        color: allFilled ? '#4ade80' : '#f59e0b',
                      }}>
                        {allFilled
                          ? 'جميع البيانات مكتملة — جاهزة للتفعيل'
                          : `${filledReq.length}/${reqFields.length} حقول مكتملة — أكمل البيانات أولاً`
                        }
                      </span>
                    </div>

                    {/* Config details preview */}
                    <div style={{
                      padding: '12px 14px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      marginBottom: 14,
                    }}>
                      {fields.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {fields.map(f => {
                            const val = gw.config?.[f.key]?.trim?.() || '';
                            const isFilled = !!val;
                            const displayVal = f.type === 'password' ? (isFilled ? '••••••••' : '') : val;
                            return (
                              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: isFilled ? '#4ade80' : 'rgba(245,158,11,0.5)',
                                  flexShrink: 0,
                                }} />
                                <span style={{ color: '#666688', fontSize: '0.76rem', fontWeight: 600, minWidth: 90, flexShrink: 0 }}>{f.label}:</span>
                                {isFilled ? (
                                  <span style={{ color: '#b8b8cc', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'left', flex: 1 }}>
                                    {displayVal}
                                  </span>
                                ) : (
                                  <span style={{ color: '#f59e0b', fontSize: '0.74rem', fontStyle: 'italic' }}>
                                    {f.required ? '⚠ مطلوب' : 'غير محدد'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: '#555577', fontSize: '0.78rem', margin: 0, textAlign: 'center' }}>لا توجد حقول</p>
                      )}
                    </div>

                    {/* Quick edit hint if not filled */}
                    {!allFilled && (
                      <button onClick={() => openEdit(gw)} style={{
                        width: '100%', padding: '10px', borderRadius: 10, marginBottom: 12,
                        background: `linear-gradient(135deg, ${currentTheme.primary}12, ${currentTheme.primary}04)`,
                        border: `1px dashed ${currentTheme.primary}30`,
                        color: currentTheme.primary, cursor: 'pointer',
                        fontSize: '0.82rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                        <Edit3 size={14} /> أدخل بيانات الدفع
                      </button>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(gw.id)}
                        disabled={toggling === gw.id}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 10,
                          background: gw.is_enabled ? 'rgba(239,68,68,0.08)' : `${currentTheme.primary}15`,
                          border: `1px solid ${gw.is_enabled ? 'rgba(239,68,68,0.15)' : `${currentTheme.primary}25`}`,
                          color: gw.is_enabled ? '#f87171' : currentTheme.primary,
                          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          opacity: toggling === gw.id ? 0.6 : 1,
                        }}
                      >
                        {gw.is_enabled ? <><ToggleRight size={16} /> تعطيل</> : <><ToggleLeft size={16} /> تفعيل</>}
                      </button>
                      {/* Edit */}
                      <button onClick={() => openEdit(gw)} style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#b8b8cc', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: '0.82rem', fontWeight: 600,
                      }}>
                        <Edit3 size={14} /> تعديل
                      </button>
                      {/* Delete */}
                      {confirmDelete === gw.id ? (
                        <button onClick={() => handleDelete(gw.id)} style={{
                          padding: '10px 14px', borderRadius: 10,
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#f87171', cursor: 'pointer',
                          fontSize: '0.78rem', fontWeight: 700,
                        }}>
                          تأكيد الحذف
                        </button>
                      ) : (
                        <button onClick={() => setConfirmDelete(gw.id)} style={{
                          padding: '10px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: '#555577', cursor: 'pointer',
                          display: 'grid', placeItems: 'center',
                        }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {gateways.length === 0 && (
              <div style={{
                gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px',
                background: 'rgba(15,15,35,0.5)', borderRadius: 20,
                border: '1px dashed rgba(255,255,255,0.08)',
              }}>
                <CreditCard size={48} style={{ marginBottom: 16, opacity: 0.2, color: '#666688' }} />
                <p style={{ color: '#888', fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>لا توجد بوابات دفع</p>
                <p style={{ color: '#555577', fontSize: '0.85rem', marginBottom: 20 }}>أضف بوابة دفع حقيقية لتمكين العملاء من الدفع</p>
                <button onClick={openCreate} style={{
                  padding: '12px 28px', borderRadius: 14,
                  background: currentTheme.gradient, color: '#fff', border: 'none',
                  cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
                  boxShadow: currentTheme.glow,
                }}>
                  <Plus size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} /> إضافة أول بوابة
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════ Create / Edit Modal ═══════ */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center', padding: 16,
          animation: 'gxvFadeIn 0.2s ease-out',
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
            borderRadius: 24, background: '#0f0f23',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'gxvSlideUp 0.3s ease-out',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 24px',
              background: `linear-gradient(135deg, ${currentTheme.primary}15, transparent)`,
              borderBottom: `1px solid ${currentTheme.primary}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${currentTheme.primary}20`,
                  display: 'grid', placeItems: 'center',
                  fontSize: '1.4rem',
                }}>
                  {GATEWAY_TYPES.find(t => t.value === formType)?.icon || '🔌'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {editGw ? 'تعديل بوابة الدفع' : 'إضافة بوابة دفع'}
                  </h3>
                  <p style={{ color: '#666688', fontSize: '0.78rem', margin: 0 }}>
                    {editGw ? 'تحديث بيانات البوابة' : 'أدخل بيانات بوابة الدفع الجديدة'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', border: 'none',
                color: '#666688', cursor: 'pointer', display: 'grid', placeItems: 'center',
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Gateway Type Selection */}
              {!editGw && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 10 }}>
                    نوع البوابة <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                    {GATEWAY_TYPES.map(gt => (
                      <button key={gt.value} onClick={() => { setFormType(gt.value); setFormConfig({}); }} style={{
                        padding: '14px 12px', borderRadius: 12,
                        background: formType === gt.value
                          ? `linear-gradient(135deg, ${currentTheme.primary}20, ${currentTheme.primary}08)`
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${formType === gt.value ? `${currentTheme.primary}40` : 'rgba(255,255,255,0.06)'}`,
                        color: formType === gt.value ? currentTheme.primary : '#b8b8cc',
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s',
                      }}>
                        <span style={{ fontSize: '1.4rem' }}>{gt.icon}</span>
                        {gt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gateway Name */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
                  اسم البوابة (عربي) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder={GATEWAY_TYPES.find(t => t.value === formType)?.label || 'اسم البوابة'}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
                  اسم البوابة (إنجليزي)
                </label>
                <input
                  value={formNameEn}
                  onChange={e => setFormNameEn(e.target.value)}
                  placeholder="PayPal"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 22px' }} />

              {/* Config Fields */}
              <p style={{ color: currentTheme.primary, fontSize: '0.85rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CreditCard size={16} /> بيانات الدفع
              </p>

              {configFields.map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  {field.key === 'instructions' ? (
                    <textarea
                      value={formConfig[field.key] || ''}
                      onChange={e => setFormConfig({ ...formConfig, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }}
                      onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formConfig[field.key] || ''}
                      onChange={e => setFormConfig({ ...formConfig, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    />
                  )}
                </div>
              ))}

              {/* Type-specific hints */}
              {formType === 'paypal' && (
                <div style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)', marginBottom: 18,
                }}>
                  <p style={{ color: '#60a5fa', fontSize: '0.78rem', margin: 0, lineHeight: 1.6 }}>
                    💡 استخدم <strong>sandbox</strong> للاختبار و <strong>live</strong> للإنتاج.
                    احصل على Client ID و Secret من{' '}
                    <a href="https://developer.paypal.com" target="_blank" rel="noopener" style={{ color: '#93c5fd' }}>developer.paypal.com</a>
                  </p>
                </div>
              )}
              {formType === 'binance' && (
                <div style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)', marginBottom: 18,
                }}>
                  <p style={{ color: '#fbbf24', fontSize: '0.78rem', margin: 0, lineHeight: 1.6 }}>
                    💡 أنشئ مفاتيح API من حسابك التاجري في{' '}
                    <a href="https://merchant.binance.com" target="_blank" rel="noopener" style={{ color: '#fde68a' }}>Binance Merchant</a>
                  </p>
                </div>
              )}
              {formType === 'usdt' && (
                <div style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)', marginBottom: 18,
                }}>
                  <p style={{ color: '#4ade80', fontSize: '0.78rem', margin: 0, lineHeight: 1.6 }}>
                    💡 الشبكة الأكثر استخداماً هي <strong>TRC20</strong> (رسوم أقل). تأكد من صحة عنوان المحفظة.
                  </p>
                </div>
              )}

              {/* Message */}
              {msg && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12, marginBottom: 16, textAlign: 'center',
                  background: msg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: msg.ok ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600,
                }}>{msg.text}</div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: currentTheme.gradient, color: '#fff', border: 'none',
                  cursor: saving ? 'wait' : 'pointer',
                  fontSize: '0.92rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: currentTheme.glow,
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? (
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'gxvSpin 0.6s linear infinite' }} />
                  ) : (
                    <><Save size={16} /> {editGw ? 'حفظ التغييرات' : 'إنشاء البوابة'}</>
                  )}
                </button>
                <button onClick={() => setShowForm(false)} style={{
                  padding: '14px 24px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8888aa', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: 600,
                }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
