import React from 'react';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';

const SearchFilters = ({
  dir,
  isRTL,
  t,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
}) => {
  return (
    <div
      className="rounded-2xl border-2 p-5 shadow-lg"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute top-1/2 -translate-y-1/2"
            size={18}
            style={{
              color: 'var(--text-secondary)',
              ...(isRTL ? { right: 12 } : { left: 12 }),
            }}
          />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            dir={dir}
            className="w-full py-2.5 px-4 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
            style={{
              backgroundColor: 'var(--page-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              ...(isRTL ? { paddingRight: 40 } : { paddingLeft: 40 }),
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Filter
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              size={16}
              style={{
                color: 'var(--text-secondary)',
                ...(isRTL ? { right: 12 } : { left: 12 }),
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              dir={dir}
              className="py-2.5 px-4 rounded-xl border-2 appearance-none focus:outline-none focus:border-[#6366F1] transition-all min-w-[160px]"
              style={{
                backgroundColor: 'var(--page-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                ...(isRTL ? { paddingRight: 36 } : { paddingLeft: 36 }),
              }}
            >
              <option value="all">{t.allStatus}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
              <option value="connected">{t.connected}</option>
              <option value="disconnected">{t.disconnected}</option>
            </select>
          </div>

          <div
            className="flex items-center gap-2 p-1 rounded-xl"
            style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className="p-2 rounded-lg transition-all"
              style={
                viewMode === 'grid'
                  ? { backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: 'var(--text-secondary)' }
              }
              aria-label={isRTL ? 'عرض شبكي' : 'Grid view'}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="p-2 rounded-lg transition-all"
              style={
                viewMode === 'list'
                  ? { backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: 'var(--text-secondary)' }
              }
              aria-label={isRTL ? 'عرض قائمة' : 'List view'}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
