'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import type { Customization, PaymentGateway } from '@/lib/types';
import { Settings, Save, Loader2, Palette, Globe, MessageSquare, CreditCard, Plus, Trash2, ToggleLeft, ToggleRight, Mail, Eye, EyeOff } from 'lucide-react';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Customization>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [showAddGateway, setShowAddGateway] = useState(false);
  const [newGateway, setNewGateway] = useState({ name: '', account_number: '', full_name: '', receipt_note: '' });
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadGateways = async () => {
    try {
      const data = await adminApi.getPaymentGateways();
      setGateways(Array.isArray(data) ? data : data?.gateways || []);
    } catch { /* empty */ }
  };

  useEffect(() => {
    Promise.all([
      adminApi.getCustomization()
        .then(data => setSettings(data?.customization || {}))
        .catch(() => {}),
      loadGateways(),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminApi.updateCustomization(settings as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Customization, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAddGateway = async () => {
    if (!newGateway.name || !newGateway.account_number || !newGateway.full_name) return;
    setGatewayLoading(true);
    try {
      await adminApi.createPaymentGateway({
        name: newGateway.name,
        type: 'bankak',
        logo: 'https://6990ab01681c79fa0bccfe99.imgix.net/bank.png',
        config: {
          account_number: newGateway.account_number,
          full_name: newGateway.full_name,
          receipt_note: newGateway.receipt_note,
        },
      });
      setNewGateway({ name: '', account_number: '', full_name: '', receipt_note: '' });
      setShowAddGateway(false);
      await loadGateways();
    } catch {
      alert('حدث خطأ أثناء إضافة البوابة');
    } finally {
      setGatewayLoading(false);
    }
  };

  const handleToggleGateway = async (id: number) => {
    try {
      await adminApi.togglePaymentGateway(id);
      await loadGateways();
    } catch {
      alert('حدث خطأ');
    }
  };

  const handleDeleteGateway = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه البوابة؟')) return;
    try {
      await adminApi.deletePaymentGateway(id);
      await loadGateways();
    } catch {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleUpdateGatewayConfig = async (gw: PaymentGateway, field: string, value: string) => {
    try {
      await adminApi.updatePaymentGateway(gw.id, {
        config: { ...gw.config, [field]: value },
      });
      await loadGateways();
    } catch {
      alert('حدث خطأ أثناء التحديث');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-gold-500" />
            الإعدادات
          </h1>
          <p className="text-navy-400 text-sm mt-1">تخصيص إعدادات المتجر</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3 font-bold">
          ✓ تم حفظ الإعدادات بنجاح
        </div>
      )}

      {/* Store Info */}
      <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-gold-500" />
          معلومات المتجر
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">اسم المتجر</label>
            <input
              value={settings.store_name || ''}
              onChange={e => update('store_name', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
              placeholder="متجر ستيلار"
            />
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">لغة المتجر</label>
            <select
              value={settings.store_language || 'ar'}
              onChange={e => update('store_language', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">وصف المتجر</label>
            <textarea
              value={settings.store_description || ''}
              onChange={e => update('store_description', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 resize-none"
              rows={3}
              placeholder="وصف قصير للمتجر..."
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-gold-500" />
          المظهر
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">اللون الأساسي</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={settings.primary_color || '#f5a623'}
                onChange={e => update('primary_color', e.target.value)}
                className="w-12 h-12 rounded-xl border border-navy-700/50 cursor-pointer bg-transparent"
              />
              <input
                value={settings.primary_color || '#f5a623'}
                onChange={e => update('primary_color', e.target.value)}
                className="flex-1 px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-gold-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">اللون الثانوي</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={settings.secondary_color || '#d4911e'}
                onChange={e => update('secondary_color', e.target.value)}
                className="w-12 h-12 rounded-xl border border-navy-700/50 cursor-pointer bg-transparent"
              />
              <input
                value={settings.secondary_color || '#d4911e'}
                onChange={e => update('secondary_color', e.target.value)}
                className="flex-1 px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-gold-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">الخط</label>
            <select
              value={settings.font_family || 'Tajawal'}
              onChange={e => update('font_family', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
            >
              <option value="Tajawal">Tajawal</option>
              <option value="Cairo">Cairo</option>
              <option value="Noto Sans Arabic">Noto Sans Arabic</option>
              <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">استدارة الأزرار</label>
            <select
              value={settings.button_radius || '14'}
              onChange={e => update('button_radius', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
            >
              <option value="0">مربع</option>
              <option value="8">قليل</option>
              <option value="14">متوسط</option>
              <option value="20">كبير</option>
              <option value="999">دائري</option>
            </select>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gold-500" />
          روابط التواصل
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">واتساب</label>
            <input
              value={settings.whatsapp || ''}
              onChange={e => update('whatsapp', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
              placeholder="+249..."
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">تلقرام</label>
            <input
              value={settings.telegram || ''}
              onChange={e => update('telegram', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
              placeholder="@username"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">انستقرام</label>
            <input
              value={settings.instagram || ''}
              onChange={e => update('instagram', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
              placeholder="https://instagram.com/..."
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">تويتر / X</label>
            <input
              value={settings.twitter || ''}
              onChange={e => update('twitter', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
              placeholder="https://x.com/..."
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Email / SMTP */}
      <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Mail className="w-5 h-5 text-gold-500" />
          إعدادات البريد الإلكتروني
        </h2>
        <p className="text-navy-400 text-xs">يُستخدم لإرسال إشعارات الطلبات، تأكيد الحسابات، وتنبيهات المحفظة</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">سيرفر SMTP</label>
            <input
              value={settings.smtp_host || ''}
              onChange={e => update('smtp_host', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 font-mono text-sm"
              placeholder="smtp.example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">المنفذ (Port)</label>
            <select
              value={settings.smtp_port || '465'}
              onChange={e => update('smtp_port', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
            >
              <option value="465">465 (SSL)</option>
              <option value="587">587 (TLS)</option>
              <option value="25">25 (غير مشفّر)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">اسم المستخدم / البريد</label>
            <input
              value={settings.smtp_user || ''}
              onChange={e => update('smtp_user', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 font-mono text-sm"
              placeholder="info@yourstore.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">كلمة مرور SMTP</label>
            <div className="relative">
              <input
                type={showSmtpPass ? 'text' : 'password'}
                value={settings.smtp_pass || ''}
                onChange={e => update('smtp_pass', e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 font-mono text-sm"
                placeholder="••••••••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPass(!showSmtpPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors"
              >
                {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">بريد الدعم (يظهر للعملاء)</label>
            <input
              value={settings.support_email || ''}
              onChange={e => update('support_email', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 font-mono text-sm"
              placeholder="support@yourstore.com"
              dir="ltr"
            />
          </div>
        </div>
        {testEmailResult && (
          <div className={`text-sm rounded-xl px-4 py-3 font-bold ${
            testEmailResult.ok
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {testEmailResult.ok ? '✓' : '✗'} {testEmailResult.msg}
          </div>
        )}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={async () => {
              if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
                setTestEmailResult({ ok: false, msg: 'أكمل بيانات SMTP أولاً' });
                return;
              }
              setTestingEmail(true);
              setTestEmailResult(null);
              try {
                await handleSave();
                setTestEmailResult({ ok: true, msg: 'تم حفظ الإعدادات. أرسل بريد تجريبي من صفحة الإشعارات للتأكد.' });
              } catch {
                setTestEmailResult({ ok: false, msg: 'فشل في حفظ إعدادات SMTP' });
              } finally {
                setTestingEmail(false);
              }
            }}
            disabled={testingEmail}
            className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700/50 text-navy-200 hover:text-gold-500 hover:border-gold-500/30 font-bold rounded-xl transition-all text-sm disabled:opacity-50"
          >
            {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            حفظ واختبار
          </button>
          <p className="text-navy-500 text-xs">احفظ الإعدادات أولاً ثم أرسل بريد تجريبي من صفحة الإشعارات</p>
        </div>
      </div>

      {/* Payment Gateways */}
      <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-500" />
            بوابات الدفع
          </h2>
          <button
            onClick={() => setShowAddGateway(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-500/10 text-gold-500 font-bold rounded-xl hover:bg-gold-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة بوابة
          </button>
        </div>

        {/* Add Gateway Form */}
        {showAddGateway && (
          <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-bold text-sm">إضافة بوابة بنكك</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-navy-300 font-bold mb-1.5 block">اسم البوابة</label>
                <input
                  value={newGateway.name}
                  onChange={e => setNewGateway(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="مثال: بنكك - بنك الخرطوم"
                />
              </div>
              <div>
                <label className="text-sm text-navy-300 font-bold mb-1.5 block">رقم الحساب</label>
                <input
                  value={newGateway.account_number}
                  onChange={e => setNewGateway(p => ({ ...p, account_number: e.target.value }))}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="رقم حساب بنكك"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm text-navy-300 font-bold mb-1.5 block">اسم صاحب الحساب</label>
                <input
                  value={newGateway.full_name}
                  onChange={e => setNewGateway(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="الاسم الكامل لصاحب الحساب"
                />
              </div>
              <div>
                <label className="text-sm text-navy-300 font-bold mb-1.5 block">تعليق في الايصال</label>
                <input
                  value={newGateway.receipt_note}
                  onChange={e => setNewGateway(p => ({ ...p, receipt_note: e.target.value }))}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="ملاحظة تظهر للعميل عند الدفع"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAddGateway}
                disabled={gatewayLoading || !newGateway.name || !newGateway.account_number || !newGateway.full_name}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 text-sm"
              >
                {gatewayLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                إضافة
              </button>
              <button
                onClick={() => setShowAddGateway(false)}
                className="px-5 py-2.5 text-navy-400 hover:text-white font-bold rounded-xl transition-all text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Gateways List */}
        {gateways.length === 0 && !showAddGateway ? (
          <p className="text-navy-500 text-sm text-center py-8">لا توجد بوابات دفع. أضف بوابة جديدة للبدء.</p>
        ) : (
          <div className="space-y-3">
            {gateways.map(gw => (
              <div key={gw.id} className="bg-navy-800/40 border border-navy-700/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {gw.logo && (
                      <img src={gw.logo} alt={gw.name} className="w-8 h-8 rounded-lg object-contain" />
                    )}
                    <div>
                      <h4 className="text-white font-bold text-sm">{gw.name}</h4>
                      <span className={`text-xs font-bold ${gw.is_enabled ? 'text-emerald-400' : 'text-navy-500'}`}>
                        {gw.is_enabled ? 'مفعّلة' : 'معطّلة'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleGateway(gw.id)}
                      className={`p-2 rounded-lg transition-all ${gw.is_enabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-navy-500 hover:bg-navy-700/50'}`}
                      title={gw.is_enabled ? 'تعطيل' : 'تفعيل'}
                    >
                      {gw.is_enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteGateway(gw.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-navy-400 font-bold mb-1 block">رقم الحساب</label>
                    <input
                      defaultValue={gw.config?.account_number || ''}
                      onBlur={e => {
                        if (e.target.value !== (gw.config?.account_number || ''))
                          handleUpdateGatewayConfig(gw, 'account_number', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500/50"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-navy-400 font-bold mb-1 block">اسم صاحب الحساب</label>
                    <input
                      defaultValue={gw.config?.full_name || ''}
                      onBlur={e => {
                        if (e.target.value !== (gw.config?.full_name || ''))
                          handleUpdateGatewayConfig(gw, 'full_name', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-navy-400 font-bold mb-1 block">تعليق في الايصال</label>
                    <input
                      defaultValue={gw.config?.receipt_note || ''}
                      onBlur={e => {
                        if (e.target.value !== (gw.config?.receipt_note || ''))
                          handleUpdateGatewayConfig(gw, 'receipt_note', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
