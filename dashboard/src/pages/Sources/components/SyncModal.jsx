import React from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';

const SyncModal = ({
  dir,
  isRTL,
  t,
  selectedSource,
  syncingSource,
  syncOptions,
  setSyncOptions,
  syncLogs,
  onClose,
  onSync,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border-2 shadow-lg"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        dir={dir}
      >
        <div className="p-6 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <span className="inline-flex items-center gap-2">
              <RefreshCcw size={18} />
              {isRTL ? 'خيارات المزامنة' : 'Synchronization Options'}
            </span>
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedSource?.name}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isRTL
                ? 'إذا لم تختَر أي خيار: سيتم عمل مزامنة فقط (تحديث الأسعار/التوقيت/الإضافات الجديدة) داخل الباك-إند والداشبورد بدون إظهار منتجات في واجهة المستخدم.'
                : 'If you select nothing: a normal sync runs (prices/timing/new items) in backend/dashboard only, without showing products in the end-user frontend.'}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {isRTL ? 'خيارات Setup (إظهار في الواجهة الأمامية)' : 'Setup Options (Show in Frontend)'}
              </div>

              <label
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}
              >
              <input
                type="checkbox"
                checked={syncOptions.setupIMEI}
                onChange={(e) => setSyncOptions({ ...syncOptions, setupIMEI: e.target.checked })}
                  className="w-5 h-5 rounded"
              />
                <span style={{ color: 'var(--text-primary)' }}>
                {isRTL ? 'كتالوج IMEI (تثبيت/نشر في الواجهة الأمامية)' : 'IMEI catalog (publish to frontend)'}
              </span>
            </label>

              <label
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}
              >
              <input
                type="checkbox"
                checked={syncOptions.setupServer}
                onChange={(e) => setSyncOptions({ ...syncOptions, setupServer: e.target.checked })}
                  className="w-5 h-5 rounded"
              />
                <span style={{ color: 'var(--text-primary)' }}>
                {isRTL ? 'كتالوج Server (تثبيت/نشر في الواجهة الأمامية)' : 'Server catalog (publish to frontend)'}
              </span>
            </label>

              <label
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}
              >
              <input
                type="checkbox"
                checked={syncOptions.setupRemote}
                onChange={(e) => setSyncOptions({ ...syncOptions, setupRemote: e.target.checked })}
                  className="w-5 h-5 rounded"
              />
                <span style={{ color: 'var(--text-primary)' }}>
                {isRTL ? 'كتالوج Remote (تثبيت/نشر في الواجهة الأمامية)' : 'Remote catalog (publish to frontend)'}
              </span>
            </label>

              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {isRTL
                  ? 'ملاحظة: نشر/إظهار المنتجات في الواجهة الأمامية يتطلب دعم من الباك-إند (حالة المنتج Active/Inactive).'
                  : 'Note: Publishing/showing products in the end-user frontend requires backend support (product Active/Inactive status).'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {isRTL ? 'تنظيف قبل المزامنة' : 'Cleanup Before Sync'}
              </div>

              <label
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}
              >
              <input
                type="checkbox"
                checked={syncOptions.deleteAllBrandModel}
                onChange={(e) => setSyncOptions({ ...syncOptions, deleteAllBrandModel: e.target.checked })}
                  className="w-5 h-5 rounded"
              />
                <span style={{ color: 'var(--text-primary)' }}>
                {isRTL ? 'حذف جميع منتجات هذا المصدر قبل المزامنة ثم استيراد الجديد' : 'Delete all products for this source, then sync fresh'}
              </span>
            </label>
            </div>
          </div>

          {syncLogs.length > 0 && (
            <div
              className="rounded-xl p-4 font-mono text-sm max-h-60 overflow-y-auto border"
              style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              {syncLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t-2 flex gap-3 justify-end" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onClose}
            disabled={!!syncingSource}
            className="px-6 py-2 rounded-xl transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            type="button"
          >
            {t.cancel}
          </button>
          <button
            onClick={onSync}
            disabled={!!syncingSource}
            className="px-6 py-2 rounded-xl transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
            type="button"
          >
            {syncingSource ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isRTL ? 'جاري المزامنة...' : 'Syncing...'}
              </>
            ) : (
              <>
                <RefreshCcw size={16} />
                {isRTL ? 'بدء المزامنة' : 'Start Synchronize'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
