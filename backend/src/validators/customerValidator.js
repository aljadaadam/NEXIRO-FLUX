/**
 * ─── Customer Validators ───
 * Validation middleware for customer endpoints.
 */
const { isRequired, isValidEmail, isValidPassword, isPositiveNumber, validationError } = require('./common');

/**
 * Validate customer registration
 */
function validateCustomerRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!isRequired(name) || !isRequired(email) || !isRequired(password)) {
    return validationError(res, 'جميع الحقول مطلوبة', 'All fields are required');
  }
  if (!isValidEmail(email)) {
    return validationError(res, 'صيغة البريد الإلكتروني غير صحيحة', 'Invalid email format');
  }
  if (!isValidPassword(password, 6)) {
    return validationError(res, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Password must be at least 6 characters');
  }
  next();
}

/**
 * Validate customer login
 */
function validateCustomerLogin(req, res, next) {
  const { email, password } = req.body;
  if (!isRequired(email) || !isRequired(password)) {
    return validationError(res, 'البريد الإلكتروني وكلمة المرور مطلوبان', 'Email and password are required');
  }
  next();
}

/**
 * Validate wallet deposit amount
 */
function validateWalletAmount(req, res, next) {
  const { amount } = req.body;
  if (!isPositiveNumber(amount)) {
    return validationError(res, 'المبلغ مطلوب ويجب أن يكون رقم موجب', 'Amount must be a positive number');
  }
  next();
}

/**
 * Validate customer profile update
 */
function validateProfileUpdate(req, res, next) {
  const { email } = req.body;
  if (email !== undefined && !isValidEmail(email)) {
    return validationError(res, 'البريد الإلكتروني غير صالح', 'Invalid email');
  }
  next();
}

module.exports = {
  validateCustomerRegister,
  validateCustomerLogin,
  validateWalletAmount,
  validateProfileUpdate,
};
