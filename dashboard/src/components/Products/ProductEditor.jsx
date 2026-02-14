import React from 'react';
import ProductEditorContent from './ProductEditorContent';


const ProductEditor = ({
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
  return (
    <ProductEditorContent
      theme={theme}
      dir={dir}
      product={product}
      selectedOption={selectedOption}
      editValues={editValues}
      onEditChange={onEditChange}
      onSave={onSave}
      onToggleStatus={onToggleStatus}
      selectedGroup={selectedGroup}
      sources={sources}
      allProducts={allProducts}
    />
  );
};

export default ProductEditor;
