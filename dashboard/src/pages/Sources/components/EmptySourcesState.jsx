import React from 'react';
import { Inbox, Plus } from 'lucide-react';

const EmptySourcesState = ({ dir, t, onAdd }) => {
  return (
    <div
      className="text-center py-14 rounded-2xl border-2 shadow-lg"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <div
        className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}
      >
        <Inbox size={26} style={{ color: 'var(--text-secondary)' }} />
      </div>
      <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {t.noSources}
      </div>
      <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        {t.subtitle}
      </div>
      <button
        onClick={onAdd}
        className="px-5 py-2 rounded-xl font-medium transition-all duration-200 transform active:scale-[0.98]"
        style={{
          backgroundColor: 'var(--page-bg)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          ...(dir === 'ltr'
            ? { borderLeft: '3px solid var(--accent-primary)' }
            : { borderRight: '3px solid var(--accent-primary)' }),
        }}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <Plus size={18} style={{ color: 'var(--text-primary)' }} />
          {t.addSource}
        </span>
      </button>
    </div>
  );
};

export default EmptySourcesState;
