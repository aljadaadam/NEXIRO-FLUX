import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { List } from 'react-window';

/**
 * API Tab Component - handles API connection and service selection
 */
const ApiTab = ({ 
  dir, 
  product,
  editValues,
  onEditChange,
  onSave,
  currentSource,
  currentSourceId,
  currentLinkedServiceId,
  sources,
  allProducts
}) => {
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef(null);
  const [servicesSearch, setServicesSearch] = useState('');

  const availableSources = Array.isArray(sources) ? sources : [];
  const productGroups = Array.isArray(allProducts) ? allProducts : [];

  // تحويل المنتجات إلى groups format للعرض
  const groups = useMemo(() => {
    return productGroups.map(group => ({
      label: group.GROUPNAME || 'Unnamed Group',
      options: Object.values(group.SERVICES || {}).map(service => ({
        id: service.id || service.SERVICEID,
        label: service.SERVICENAME || service.name || 'Unnamed Service',
        SERVICENAME: service.SERVICENAME,
        SERVICEID: service.SERVICEID,
        external_service_name: service.external_service_name
      }))
    }));
  }, [productGroups]);

  // فلترة Groups حسب البحث
  const filteredGroups = useMemo(() => {
    const term = String(servicesSearch || '').trim().toLowerCase();
    if (!term) return groups;

    return groups
      .map(group => ({
        ...group,
        options: group.options.filter(opt => 
          String(opt.label || '').toLowerCase().includes(term)
        )
      }))
      .filter(group => group.options.length > 0);
  }, [groups, servicesSearch]);

  const totalCount = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.options?.length || 0), 0);
  }, [groups]);

  const filteredCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + (g.options?.length || 0), 0);
  }, [filteredGroups]);

  // Find selected service from ALL groups (not just filtered ones)
  const selectedApiService = useMemo(() => {
    const allGroups = groups || [];
    
    // Priority 1: If external_service_id is set, find that service
    if (currentLinkedServiceId) {
      for (const group of allGroups) {
        const options = Array.isArray(group?.options) ? group.options : [];
        const found = options.find((opt) => String(opt?.id ?? '') === String(currentLinkedServiceId));
        if (found) {
          console.log('✅ Found linked service:', found);
          return found;
        }
      }
    }
    
    // Priority 2: Show current product itself
    if (product?.id || product?.SERVICEID) {
      const productId = product.id || product.SERVICEID;
      // Try to find in groups first
      for (const group of allGroups) {
        const options = Array.isArray(group?.options) ? group.options : [];
        const found = options.find((opt) => String(opt?.id ?? '') === String(productId));
        if (found) {
          console.log('✅ Found current product in groups:', found);
          return found;
        }
      }
      
      // If not found in groups, return product info directly
      const productInfo = {
        id: productId,
        label: product.SERVICENAME || product.name || `Product #${productId}`,
        SERVICENAME: product.SERVICENAME || product.name,
        SERVICEID: productId
      };
      console.log('✅ Using current product directly:', productInfo);
      return productInfo;
    }
    
    console.log('⚠️ No service selected');
    return null;
  }, [currentLinkedServiceId, groups, product]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ApiTab Debug:', {
      'المنتج الحالي': product?.SERVICENAME || product?.name,
      'معرف المنتج': product?.id,
      'المصدر الحالي (source_id)': currentSourceId,
      'الخدمة المرتبطة (external_service_id)': currentLinkedServiceId,
      'المصادر المتاحة': availableSources.length,
      'المجموعات المتاحة': groups.length,
      'إجمالي المنتجات': totalCount,
      'المنتج المختار في Dropdown': selectedApiService,
      product,
      allProducts
    });
  }, [currentSourceId, currentLinkedServiceId, availableSources, groups, filteredGroups, totalCount, filteredCount, product, allProducts, selectedApiService]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setServiceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectConnectionId = (nextSourceId) => {
    onEditChange?.('source_id', nextSourceId);
    // Don't reset external_service_id when changing source
    setServicesSearch('');
    setServiceDropdownOpen(false);
  };

  const handleSelectService = (serviceOrNull) => {
    const nextServiceId = serviceOrNull ? (serviceOrNull.SERVICEID ?? serviceOrNull.id ?? serviceOrNull?.id ?? null) : null;
    const nextServiceName = serviceOrNull ? (serviceOrNull.SERVICENAME ?? serviceOrNull.label ?? null) : null;
    onEditChange?.('external_service_id', nextServiceId);
    if (nextServiceName) {
      onEditChange?.('external_service_name', nextServiceName);
    }
    setServiceDropdownOpen(false);
  };

  const selectedServiceLabel =
    selectedApiService?.label ?? selectedApiService?.SERVICENAME ?? selectedApiService?.name ?? (currentLinkedServiceId ? String(currentLinkedServiceId) : null);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Source Dropdown */}
      <div className="relative">
        <label className="text-sm font-bold block mb-2" style={{ color: 'var(--text-secondary)' }}>
          {dir === 'rtl' ? 'المصدر (Source)' : 'Source'}
        </label>
        <select
          value={currentSourceId ?? ''}
          onChange={(e) => {
            const next = e.target.value === '' ? null : Number(e.target.value);
            handleSelectConnectionId(Number.isFinite(next) ? next : null);
          }}
          className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200"
          style={{
            backgroundColor: 'var(--page-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="">{dir === 'rtl' ? '--- لا يوجد ---' : '--- None ---'}</option>
          {availableSources.map((conn) => (
            <option key={conn?.id ?? conn?.name} value={conn?.id}>
              {conn?.name ?? `Source #${conn?.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* API Service Dropdown - Always visible */}
      <div className="relative" ref={serviceDropdownRef}>
        <label className="text-sm font-bold flex items-center justify-between mb-2" style={{ color: 'var(--text-secondary)' }}>
          <span>{dir === 'rtl' ? 'خدمة API (المنتج)' : 'API Service (Product)'}</span>
          <span className="text-xs font-normal px-2 py-1 rounded" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
            {`${totalCount} ${dir === 'rtl' ? 'خدمة' : 'services'}`}
          </span>
        </label>

        <button
          type="button"
          onClick={() => setServiceDropdownOpen((p) => !p)}
          onMouseEnter={(e) => {
            if (!serviceDropdownOpen) e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            if (!serviceDropdownOpen) e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: serviceDropdownOpen ? 'var(--accent-primary)' : 'var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: serviceDropdownOpen ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
            cursor: 'pointer'
          }}
        >
          <span className="flex-1 text-left" style={{ color: selectedServiceLabel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {selectedServiceLabel || (dir === 'rtl' ? '--- اختر خدمة ---' : '--- Select service ---')}
          </span>
          <svg className={`w-5 h-5 transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="var(--text-secondary)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {serviceDropdownOpen && (
          <GroupedServiceDropdown
            dir={dir}
            groups={filteredGroups}
            totalCount={totalCount}
            filteredCount={filteredCount}
            currentLinkedServiceId={currentLinkedServiceId}
            searchValue={servicesSearch}
            onSearchChange={setServicesSearch}
            onSelectNone={() => handleSelectService(null)}
            onSelectService={(svc) => handleSelectService(svc)}
          />
        )}

        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {dir === 'rtl'
            ? `عرض ${filteredCount} من ${totalCount} خدمة`
            : `Showing ${filteredCount} of ${totalCount} services`}
        </p>
      </div>

      {/* Save Button - Always visible */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onSave}
          className="w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-white hover:opacity-90 active:scale-95 active:shadow-inner"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          {dir === 'rtl' ? 'حفظ' : 'Save'}
        </button>
      </div>
    </div>
  );
};


const GroupedServiceDropdown = ({
  dir,
  groups,
  totalCount,
  filteredCount,
  currentLinkedServiceId,
  searchValue,
  onSearchChange,
  onSelectNone,
  onSelectService,
}) => {
  const noneIsActive = !currentLinkedServiceId;

  const items = useMemo(() => {
    const out = [];
    (groups || []).forEach((group) => {
      const options = Array.isArray(group?.options) ? group.options : [];
      if (options.length === 0) return;
      out.push({ type: 'group', label: String(group?.label || '') });
      options.forEach((opt) => {
        out.push({ type: 'option', option: opt });
      });
    });
    return out;
  }, [groups]);

  const getRowHeight = useCallback((index, rowProps) => {
    const item = rowProps?.items?.[index];
    if (item?.type === 'group') return 32;
    return 52;
  }, []);

  const Row = ({ index, style, ariaAttributes, items: rowItems, currentLinkedServiceId: selectedId, onSelectService: onPick }) => {
    const item = rowItems[index];

    if (item?.type === 'group') {
      return (
        <div
          {...ariaAttributes}
          style={{
            ...style,
            padding: '6px 12px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            opacity: 0.95,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {item.label}
        </div>
      );
    }

    const opt = item?.option;
    const id = opt?.id;
    const label = opt?.label ?? String(id ?? '');
    const isActive = String(id ?? '') === String(selectedId ?? '');

    return (
      <div {...ariaAttributes} style={style}>
        <button
          type="button"
          onClick={() => onPick(opt)}
          className="w-full text-left rounded-lg transition-all duration-150"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px 8px 28px',
            backgroundColor: isActive ? 'var(--active-bg)' : 'transparent',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = isActive ? 'var(--active-bg)' : 'transparent';
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{label}</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              ID: {String(id ?? '-')}
            </div>
          </div>
          {isActive && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>
    );
  };

  return (
    <div
      className="absolute z-50 w-full mt-2 rounded-lg border-2 shadow-2xl animate-fadeIn"
      style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <input
          type="text"
          placeholder={dir === 'rtl' ? 'ابحث...' : 'Search...'}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="px-3 pt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {dir === 'rtl' ? 'اختر خدمة' : 'Select Service'}
      </div>

      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={onSelectNone}
          className="w-full text-left px-3 py-3 rounded-lg transition-all duration-150 mb-2"
          style={{
            backgroundColor: noneIsActive ? 'var(--active-bg)' : 'transparent',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            if (!noneIsActive) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            if (!noneIsActive) e.currentTarget.style.backgroundColor = noneIsActive ? 'var(--active-bg)' : 'transparent';
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">--- None ---</span>
            {noneIsActive && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </button>

        {totalCount > 0 && (
          <div className="px-1 pb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            {dir === 'rtl' ? `عرض ${filteredCount} من ${totalCount}` : `Showing ${filteredCount} of ${totalCount}`}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {searchValue
              ? (dir === 'rtl' ? 'لا توجد نتائج' : 'No results')
              : (dir === 'rtl' ? 'لا توجد خدمات' : 'No services')}
          </div>
        ) : (
          <List
            rowCount={items.length}
            rowHeight={getRowHeight}
            rowComponent={Row}
            rowProps={{
              items,
              currentLinkedServiceId,
              onSelectService,
            }}
            overscanCount={8}
            style={{
              height: 288,
              borderTop: '1px solid var(--border-color)',
              marginTop: 6,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ApiTab;
