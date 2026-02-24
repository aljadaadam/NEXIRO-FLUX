/**
 * ─── Validators Index ───
 * Central export point for all validators.
 */
const authValidator = require('./authValidator');
const productValidator = require('./productValidator');
const customerValidator = require('./customerValidator');
const orderValidator = require('./orderValidator');
const common = require('./common');

module.exports = {
  ...authValidator,
  ...productValidator,
  ...customerValidator,
  ...orderValidator,
  ...common,
};
