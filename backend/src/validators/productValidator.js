/**
 * ─── Product Validators ───
 * Validation middleware for product endpoints.
 */
const { isRequired, isPositiveNumber, isNonEmptyArray, validationError } = require('./common');

/**
 * Validate create product request
 */
function validateCreateProduct(req, res, next) {
  const { name, price } = req.body;

  if (!isRequired(name)) {
    return validationError(res, 'اسم المنتج مطلوب', 'Product name is required');
  }
  if (!isPositiveNumber(price)) {
    return validationError(res, 'السعر يجب أن يكون رقم موجب', 'Price must be a positive number');
  }
  next();
}

/**
 * Validate import products request
 */
function validateImportProducts(req, res, next) {
  const { products } = req.body;

  if (!isNonEmptyArray(products)) {
    return validationError(res, 'يجب إرسال مصفوفة منتجات صالحة', 'Must send a valid products array');
  }
  next();
}

/**
 * Validate product ID param
 */
function validateProductId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return validationError(res, 'معرف المنتج غير صالح', 'Invalid product ID');
  }
  next();
}

module.exports = {
  validateCreateProduct,
  validateImportProducts,
  validateProductId,
};
