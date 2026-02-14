import React, { useEffect } from 'react';
import { Plus, Pencil, Save, X } from 'lucide-react';

const SourceFormModal = ({
  dir,
  t,
  isRTL,
  editingSource,
  formData,
  setFormData,
  onClose,
  onSave,
}) => {
  // بعض المتصفحات تعمل Autofill حتى مع inputs controlled
  // هذا يضمن أن نافذة Add Source تبدأ فارغة فعلاً.
  useEffect(() => {
    if (!editingSource) {
      setFormData((prev) => ({
        ...prev,
        name: prev?.name || '',
        apiUrl: prev?.apiUrl || '',
        username: '',
        apiKey: '',
      }));
    }
  }, [editingSource, setFormData]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border-2"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        dir={dir}
      >
        <div className="p-5 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <span className="inline-flex items-center gap-2">
              {editingSource ? <Pencil size={18} /> : <Plus size={18} />}
              {editingSource ? t.editSource : t.addNew}
            </span>
          </h2>
        </div>

        <form className="p-6 space-y-4" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {t.sourceName} *
            </label>
            <input
              type="text"
              name="source-name"
              autoComplete="off"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isRTL ? 'مثال: SD-Unlocker' : 'Example: SD-Unlocker'}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#6366F1] transition-all"
              style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {t.apiUrl} *
            </label>
            <input
              type="url"
              name="source-api-url"
              autoComplete="off"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              placeholder={isRTL ? 'مثال: https://example.com/api' : 'Example: https://example.com/api'}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#6366F1] transition-all font-mono text-sm"
              style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {t.username} *
              </label>
              <input
                type="text"
                name="source-username"
                autoComplete="off"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={isRTL ? 'مثال: user@example.com' : 'Example: user@example.com'}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#6366F1] transition-all"
                style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {t.apiKey} *
              </label>
              <input
                type="password"
                name="source-api-key"
                autoComplete="new-password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={isRTL ? 'مثال: API_KEY_123' : 'Example: API_KEY_123'}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#6366F1] transition-all font-mono text-sm"
                style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </form>

        <div className="p-5 border-t-2 flex gap-3 justify-end" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl transition-all duration-200 transform active:scale-[0.98]"
            style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <X size={16} />
              {t.cancel}
            </span>
          </button>
          <button
            onClick={onSave}
            disabled={!formData.name || !formData.apiUrl || !formData.username || !formData.apiKey}
            className="px-6 py-2 rounded-xl transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              {editingSource ? <Save size={16} /> : <Plus size={16} />}
              {editingSource ? t.saveChanges : t.addNew}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceFormModal;
