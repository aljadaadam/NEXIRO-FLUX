import React, { useMemo } from 'react';
import { getCustomFields } from '../utils/fieldUtils';

/**
 * Overview Tab Component - displays product overview information
 */
const OverviewTab = ({ 
  dir, 
  product, 
  selectedGroup,
  currentSource,
  currentSourceId,
  currentLinkedServiceId 
}) => {
  const customFields = useMemo(() => getCustomFields(product), [product]);

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Group Card */}
      <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--page-bg)' }}>
        <div className="flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              {dir === 'rtl' ? 'المجموعة' : 'Group'}
            </p>
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {selectedGroup?.GROUPNAME ?? product.GROUPNAME ?? '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Source Card */}
      <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--page-bg)' }}>
        <div className="flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              {dir === 'rtl' ? 'المصدر' : 'Source'}
            </p>
            <p className="text-sm font-medium truncate" style={{ color: currentSource ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {currentSource ? currentSource.name : (dir === 'rtl' ? 'None' : 'None')}
            </p>
          </div>
        </div>
      </div>

      {/* Linked Service Card */}
      <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--page-bg)' }}>
        <div className="flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              {dir === 'rtl' ? 'الخدمة المرتبطة' : 'Linked Service'}
            </p>
            <p className="text-sm font-medium truncate" style={{ color: currentLinkedServiceId ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {currentLinkedServiceId ? String(currentLinkedServiceId) : (dir === 'rtl' ? 'None' : 'None')}
            </p>
          </div>
        </div>
      </div>

      {/* Fields Count Card */}
      <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--page-bg)' }}>
        <div className="flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              {dir === 'rtl' ? 'عدد الحقول المخصصة' : 'Custom Fields'}
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {customFields.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
