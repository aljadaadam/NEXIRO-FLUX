import { useState, useEffect } from 'react';
import {
  Bell, Eye, Clock, CheckCircle, Loader2, RefreshCw,
  AlertTriangle, Mail, ShoppingCart, Ticket, Users, CreditCard,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const typeIcons = {
  order: ShoppingCart,
  payment: CreditCard,
  ticket: Ticket,
  user: Users,
  system: Bell,
};

const typeColors = {
  order: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  payment: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ticket: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  user: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  system: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminAnnouncements() {
  const { isRTL } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(err?.error || 'فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="text-dark-400 text-sm">{error}</p>
        <button onClick={loadNotifications} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm transition-all">
          <RefreshCw className="w-4 h-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL
              ? `${notifications.length} إشعار — ${unreadCount} غير مقروء`
              : `${notifications.length} notifications — ${unreadCount} unread`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-all"
            >
              <Check className="w-4 h-4" />
              {isRTL ? 'قراءة الكل' : 'Mark All Read'}
            </button>
          )}
          <button onClick={loadNotifications} className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center mb-2">
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-white">{notifications.length}</p>
          <p className="text-dark-500 text-xs">{isRTL ? 'إجمالي الإشعارات' : 'Total'}</p>
        </div>
        <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-white">{unreadCount}</p>
          <p className="text-dark-500 text-xs">{isRTL ? 'غير مقروء' : 'Unread'}</p>
        </div>
        <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-white">{notifications.length - unreadCount}</p>
          <p className="text-dark-500 text-xs">{isRTL ? 'مقروء' : 'Read'}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'unread'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                : 'bg-[#111827] text-dark-400 border border-white/5 hover:text-white'
            }`}
          >
            {f === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? 'غير مقروء' : 'Unread')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.map(notif => {
          const type = notif.type || 'system';
          const Icon = typeIcons[type] || Bell;
          const colorClass = typeColors[type] || typeColors.system;
          return (
            <div key={notif.id} className={`bg-[#111827] rounded-2xl border overflow-hidden transition-all hover:border-white/10 ${!notif.is_read ? 'border-primary-500/20' : 'border-white/5'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary-400" />
                        )}
                        <h3 className="font-bold text-white text-sm">{notif.title || notif.message}</h3>
                      </div>
                      {notif.message && notif.title && (
                        <p className="text-dark-400 text-xs leading-relaxed">{notif.message}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="flex items-center gap-1 text-dark-500 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {notif.created_at ? new Date(notif.created_at).toLocaleString() : '-'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
                          {type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all flex-shrink-0"
                      title={isRTL ? 'تعيين كمقروء' : 'Mark as read'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-sm">{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
        </div>
      )}
    </div>
  );
}
