'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { Notification } from '@/lib/types';
import { Bell, Plus, Trash2, X, Loader2, Send, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const typeIcons: Record<string, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
};

const typeColors: Record<string, string> = {
  info: 'bg-blue-500/15 text-blue-400',
  warning: 'bg-amber-500/15 text-amber-400',
  success: 'bg-emerald-500/15 text-emerald-400',
};

export default function AnnouncementsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getNotifications();
      setNotifications(Array.isArray(data) ? data : data?.notifications || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSaving(true);
    try {
      await adminApi.createNotification({ title, message, type });
      setTitle('');
      setMessage('');
      setType('info');
      setShowModal(false);
      load();
    } catch {
      alert('حدث خطأ أثناء إنشاء الإعلان');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    setDeleting(id);
    try {
      await adminApi.deleteNotification(id);
      load();
    } catch {
      alert('فشل حذف الإعلان');
    } finally {
      setDeleting(null);
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
            <Bell className="w-7 h-7 text-gold-500" />
            الإعلانات
          </h1>
          <p className="text-navy-400 text-sm mt-1">{notifications.length} إعلان</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all"
        >
          <Plus className="w-5 h-5" />
          إعلان جديد
        </button>
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 text-navy-700 mx-auto mb-4" />
          <p className="text-navy-400 text-lg font-bold">لا توجد إعلانات</p>
          <p className="text-navy-500 text-sm mt-2">اضغط &quot;إعلان جديد&quot; لإرسال إعلان للعملاء</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, idx) => {
            const TypeIcon = typeIcons[n.type] || Info;
            return (
              <div
                key={n.id}
                className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-5 hover:border-gold-500/20 transition-all animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[n.type] || typeColors.info}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-white font-bold text-sm">{n.title}</h3>
                        <p className="text-navy-300 text-sm mt-1 whitespace-pre-wrap">{n.message}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deleting === n.id}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all shrink-0 disabled:opacity-50"
                      >
                        {deleting === n.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${typeColors[n.type] || typeColors.info}`}>
                        {n.type === 'info' ? 'معلومات' : n.type === 'warning' ? 'تحذير' : n.type === 'success' ? 'نجاح' : n.type}
                      </span>
                      <span className="text-navy-500 text-xs">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString('ar') : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-navy-900 border border-navy-700/50 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-navy-700/50">
              <h3 className="text-lg font-black text-white">إعلان جديد</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="text-sm text-navy-300 font-bold mb-1.5 block">العنوان *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="عنوان الإعلان"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-navy-300 font-bold mb-1.5 block">الرسالة *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 resize-none"
                  rows={4}
                  placeholder="نص الإعلان..."
                  required
                />
              </div>
              <div>
                <label className="text-sm text-navy-300 font-bold mb-1.5 block">النوع</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                >
                  <option value="info">معلومات</option>
                  <option value="warning">تحذير</option>
                  <option value="success">نجاح</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {saving ? 'جاري الإرسال...' : 'إرسال الإعلان'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-navy-800 text-navy-300 font-bold rounded-xl hover:bg-navy-700 transition-all">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
