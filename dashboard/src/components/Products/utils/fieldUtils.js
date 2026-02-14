/**
 * Utility functions for handling custom fields
 */

/**
 * Normalize required field value from various formats
 * @param {any} value - The value to normalize
 * @returns {boolean} - True if field is required
 */
export const normalizeRequired = (value) => {
  if (value === true) return true;
  if (value === false) return false;
  const v = String(value ?? '').trim().toLowerCase();
  return v === '1' || v === 'on' || v === 'true' || v === 'yes' || v === 'required';
};

/**
 * Get the label for a custom field from various possible properties
 * @param {Object} field - The field object
 * @param {string} dir - The direction ('rtl' or 'ltr')
 * @returns {string} - The field label
 */
export const getFieldLabel = (field, dir = 'ltr') => {
  return (
    field?.fieldname ||
    field?.name ||
    field?.label ||
    field?.title ||
    (dir === 'rtl' ? 'حقل بدون اسم' : 'Unnamed field')
  );
};

/**
 * Extract custom fields from product data
 * @param {Object} product - The product object
 * @returns {Array} - Array of custom fields
 */
export const getCustomFields = (product) => {
  const raw = product?.customFields || product?.['Requires.Custom'] || product?.requires_custom_json || [];
  if (!Array.isArray(raw)) return [];
  return raw;
};
