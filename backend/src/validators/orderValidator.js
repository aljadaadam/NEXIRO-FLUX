/**
 * ─── Order Validators ───
 * Validation middleware for order endpoints.
 */
const { isRequired, isPositiveNumber, validationError } = require('./common');

/**
 * Validate create order request
 */
function validateCreateOrder(req, res, next) {
  const { product_id, product_name, unit_price } = req.body;

  if (!isRequired(product_id)) {
    return validationError(res, 'المنتج مطلوب', 'Product is required');
  }
  if (!isRequired(product_name)) {
    return validationError(res, 'اسم المنتج مطلوب', 'Product name is required');
  }
  if (!isPositiveNumber(unit_price)) {
    return validationError(res, 'السعر غير صالح', 'Invalid price');
  }
  next();
}

/**
 * Validate order status update
 */
function validateOrderStatus(req, res, next) {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
  
  if (!isRequired(status)) {
    return validationError(res, 'الحالة مطلوبة', 'Status is required');
  }
  if (!validStatuses.includes(status)) {
    return validationError(res, 'حالة غير صالحة', 'Invalid status');
  }
  next();
}

module.exports = {
  validateCreateOrder,
  validateOrderStatus,
};
