/**
 * ─── Routes Index ───
 * Centralizes all route mounting to reduce clutter in app.js.
 * Each route module is mounted on its respective API path.
 */
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const sourceRoutes = require('./sourceRoutes');
const customerRoutes = require('./customerRoutes');
const orderRoutes = require('./orderRoutes');
const ticketRoutes = require('./ticketRoutes');
const customizationRoutes = require('./customizationRoutes');
const notificationRoutes = require('./notificationRoutes');
const paymentRoutes = require('./paymentRoutes');
const paymentGatewayRoutes = require('./paymentGatewayRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const setupRoutes = require('./setupRoutes');
const purchaseCodeRoutes = require('./purchaseCodeRoutes');
const deliveryZoneRoutes = require('./deliveryZoneRoutes');
const currencyRoutes = require('./currencyRoutes');
const branchRoutes = require('./branchRoutes');
const blogRoutes = require('./blogRoutes');
const chatRoutes = require('./chatRoutes');
const reservationRoutes = require('./reservationRoutes');

/**
 * Mount all API routes on the Express app
 * @param {import('express').Application} app
 * @param {object} limiters - Rate limiter middleware instances
 * @param {Function} limiters.authLimiter
 * @param {Function} limiters.resetLimiter
 * @param {Function} limiters.otpLimiter
 */
function mountRoutes(app, { authLimiter, resetLimiter, otpLimiter, provisionLimiter, codeLimiter }) {
  // ─── Rate limiting for sensitive paths ───
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/register-admin', authLimiter);
  app.use('/api/auth/forgot-password', resetLimiter);
  app.use('/api/auth/reset-password', resetLimiter);
  app.use('/api/customers/login', authLimiter);
  app.use('/api/customers/register', authLimiter);
  app.use('/api/customers/verify-otp', otpLimiter);
  app.use('/api/setup/provision', provisionLimiter);
  app.use('/api/purchase-codes/validate', codeLimiter);

  // ─── API Routes ───
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/sources', sourceRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/customization', customizationRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/payment-gateways', paymentGatewayRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/delivery-zones', deliveryZoneRoutes);
  app.use('/api/currencies', currencyRoutes);
  app.use('/api/branches', branchRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/reservations', reservationRoutes);

  // ─── Binance webhook: use ONLY /api/checkout/webhooks/binance (with rate limiting) ───
  // Legacy paths removed for security — they bypassed rate limiting

  app.use('/api/setup', setupRoutes);
  app.use('/api/purchase-codes', purchaseCodeRoutes);
}

module.exports = { mountRoutes };
