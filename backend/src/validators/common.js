/**
 * ─── Common Validation Helpers ───
 * Reusable validation functions used across validators.
 * Centralizes validation logic that was previously scattered in controllers.
 */

/**
 * Check if a value is present (not null, undefined, or empty string)
 */
function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

/**
 * Basic email format validation
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Check minimum password length
 */
function isValidPassword(password, minLength = 8) {
  return typeof password === 'string' && password.length >= minLength;
}

/**
 * Check if value is a positive number
 */
function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Check if value is a valid non-empty array
 */
function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Validate site key is present and not default
 */
function isValidSiteKey(siteKey) {
  return isRequired(siteKey) && siteKey !== 'default-site-key';
}

/**
 * Normalize and trim email
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
}

/**
 * Create a validation error response
 * @param {object} res - Express response object
 * @param {string} error - Arabic error message
 * @param {string} [errorEn] - Optional English error message
 * @param {number} [status=400] - HTTP status code
 */
function validationError(res, error, errorEn = null, status = 400) {
  const response = { error };
  if (errorEn) response.errorEn = errorEn;
  return res.status(status).json(response);
}

/**
 * Validate multiple required fields at once
 * @param {object} data - The data object (usually req.body)
 * @param {string[]} fields - Array of field names to check
 * @returns {string|null} - Returns the first missing field name, or null if all present
 */
function findMissingField(data, fields) {
  for (const field of fields) {
    if (!isRequired(data[field])) return field;
  }
  return null;
}

module.exports = {
  isRequired,
  isValidEmail,
  isValidPassword,
  isPositiveNumber,
  isNonEmptyArray,
  isValidSiteKey,
  normalizeEmail,
  validationError,
  findMissingField,
};
