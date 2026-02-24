/**
 * ─── Auth Validators ───
 * Validation middleware for authentication endpoints.
 */
const { isRequired, isValidEmail, isValidPassword, isValidSiteKey, validationError } = require('./common');

/**
 * Validate login request
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!isRequired(email) || !isRequired(password)) {
    return validationError(res, 'البريد الإلكتروني وكلمة المرور مطلوبان', 'Email and password are required');
  }
  next();
}

/**
 * Validate registration request
 */
function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  
  if (!isRequired(name) || !isRequired(email) || !isRequired(password)) {
    return validationError(res, 'جميع الحقول مطلوبة', 'All fields are required');
  }
  if (!isValidEmail(email)) {
    return validationError(res, 'صيغة البريد الإلكتروني غير صحيحة', 'Invalid email format');
  }
  if (!isValidPassword(password)) {
    return validationError(res, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'Password must be at least 8 characters');
  }
  next();
}

/**
 * Validate forgot password request
 */
function validateForgotPassword(req, res, next) {
  const { email } = req.body;
  if (!isRequired(email)) {
    return validationError(res, 'البريد الإلكتروني مطلوب', 'Email is required');
  }
  if (!isValidEmail(email)) {
    return validationError(res, 'صيغة البريد الإلكتروني غير صحيحة', 'Invalid email format');
  }
  next();
}

/**
 * Validate site key presence
 */
function validateSiteKey(req, res, next) {
  const siteKey = req.siteKey;
  if (!isValidSiteKey(siteKey)) {
    return validationError(res, 'لم يتم تحديد الموقع', 'Site not specified');
  }
  next();
}

module.exports = {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateSiteKey,
};
