import React from 'react';
import { Plug, Plus } from 'lucide-react';

const SourcesHeader = ({ dir, t, onAdd }) => {
  return (
    <div className="flex justify-between items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug size={22} style={{ color: 'var(--text-primary)' }} />
          <span style={{ color: 'var(--text-primary)' }}>{t.title}</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t.subtitle}
        </p>
      </div>

      <button
        onClick={onAdd}
        className="px-5 py-2 rounded-xl font-medium transition-all duration-200 transform active:scale-[0.98] shrink-0"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '2px solid var(--border-color)',
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

export default SourcesHeader;
