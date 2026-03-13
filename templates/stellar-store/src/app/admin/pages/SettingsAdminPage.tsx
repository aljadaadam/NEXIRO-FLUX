'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import type { Customization } from '@/lib/types';
import { Settings, Save, Loader2, Palette, Globe, MessageSquare } from 'lucide-react';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Customization>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getCustomization()
      .then(data => setSettings(data?.customization || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
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
    </div>
  );
}
