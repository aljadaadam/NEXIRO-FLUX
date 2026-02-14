import React, { useMemo } from 'react';
import OverviewTab from './tabs/OverviewTab';
import EditTab from './tabs/EditTab';
import ApiTab from './tabs/ApiTab';
import FieldsTab from './tabs/FieldsTab';
import StatusTab from './tabs/StatusTab';

/**
 * Main Product Editor Content Component
 * This component renders different tabs based on the selected option
 */
const ProductEditorContent = ({
  theme,
  dir,
  product,
  selectedOption,
  editValues,
  onEditChange,
  onSave,
  onToggleStatus,
  selectedGroup,
  sources,
  allProducts
}) => {
  // Extract source_id from multiple possible locations in product data
  const productSourceId = product?.source_id 
    ?? product?.sourceId 
    ?? product?.source?.id 
    ?? null;
  
  const currentSourceId = editValues?.hasOwnProperty('source_id') 
    ? editValues.source_id 
    : productSourceId;
    
  const currentLinkedServiceId = editValues?.hasOwnProperty('external_service_id')
    ? editValues.external_service_id
    : (product?.external_service_id ?? product?.externalServiceId ?? null);

  // Debug logging
  console.log('🔍 ProductEditorContent:', {
    productSourceId,
    currentSourceId,
    currentLinkedServiceId,
    product,
    editValues,
    sources
  });

  const availableSources = Array.isArray(sources) ? sources : [];
  const currentSource = useMemo(
    () => availableSources.find((s) => s?.id === currentSourceId) || null,
    [availableSources, currentSourceId]
  );

  const renderContent = () => {
    if (!product) {
      return (
        <div className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          {dir === 'rtl' ? 'اختر منتجا' : 'Select a product'}
        </div>
      );
    }

    switch (selectedOption) {
      case 'overview':
        return (
          <OverviewTab
            dir={dir}
            product={product}
            selectedGroup={selectedGroup}
            currentSource={currentSource}
            currentSourceId={currentSourceId}
            currentLinkedServiceId={currentLinkedServiceId}
          />
        );

      case 'edit':
        return (
          <EditTab
            dir={dir}
            product={product}
            editValues={editValues}
            onEditChange={onEditChange}
            onSave={onSave}
          />
        );

      case 'api':
        return (
          <ApiTab
            dir={dir}
            product={product}
            editValues={editValues}
            onEditChange={onEditChange}
            onSave={onSave}
            currentSource={currentSource}
            currentSourceId={currentSourceId}
            currentLinkedServiceId={currentLinkedServiceId}
            sources={sources}
            allProducts={allProducts}
          />
        );

      case 'fields':
        return (
          <FieldsTab
            dir={dir}
            product={product}
          />
        );

      case 'status':
        return (
          <StatusTab
            dir={dir}
            theme={theme}
            product={product}
            editValues={editValues}
            onToggleStatus={onToggleStatus}
          />
        );

      case 'image':
        return (
          <div className="space-y-4 animate-fadeIn">
            <button 
              type="button" 
              onClick={onSave} 
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition"
            >
              {dir === 'rtl' ? 'حفظ' : 'Save'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const HeaderTitle = () => {
    switch (selectedOption) {
      case 'overview':
        return dir === 'rtl' ? 'نظرة عامة' : 'Overview';
      case 'edit':
        return dir === 'rtl' ? 'تعديل المنتج' : 'Edit Product';
      case 'fields':
        return dir === 'rtl' ? 'الحقول' : 'Fields';
      case 'image':
        return dir === 'rtl' ? 'الصورة' : 'Image';
      case 'api':
        return dir === 'rtl' ? 'اتصال API' : 'API Connection';
      case 'status':
        return dir === 'rtl' ? 'الحالة' : 'Status';
      default:
        return '';
    }
  };

  const panelBg = 'var(--card-bg)';
  const panelBorder = 'var(--border-color)';
  const panelText = 'var(--text-primary)';
  const panelSubText = 'var(--text-secondary)';
  const panelShadow = undefined;

  return (
    <div className="rounded-xl border-2 transition-all duration-500" style={{ backgroundColor: panelBg, borderColor: panelBorder, boxShadow: panelShadow }}>
      <div className="p-3 sm:p-4 border-b-2 transition-all duration-300" style={{ borderColor: panelBorder }}>
        <h3 className="text-base sm:text-lg font-bold transition-all duration-300" style={{ color: panelText }}>
          <span><HeaderTitle /></span>
        </h3>
        <p className="text-xs mt-1" style={{ color: panelSubText }}>
          {product?.SERVICENAME}
        </p>
      </div>

      <div className="p-4 transition-all duration-500">{renderContent()}</div>
    </div>
  );
};

export default ProductEditorContent;
