const express = require('express');
const router = express.Router();
const {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  createDeliveryRegion,
  updateDeliveryRegion,
  deleteDeliveryRegion
} = require('../controllers/deliveryZoneController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// مناطق التوصيل
router.get('/', authenticateToken, requireRole('admin', 'user'), getDeliveryZones);
router.post('/', authenticateToken, requireRole('admin', 'user'), createDeliveryZone);
router.put('/:id', authenticateToken, requireRole('admin', 'user'), updateDeliveryZone);
router.delete('/:id', authenticateToken, requireRole('admin', 'user'), deleteDeliveryZone);

// المناطق الفرعية (المدن/المحافظات)
router.post('/regions', authenticateToken, requireRole('admin', 'user'), createDeliveryRegion);
router.put('/regions/:id', authenticateToken, requireRole('admin', 'user'), updateDeliveryRegion);
router.delete('/regions/:id', authenticateToken, requireRole('admin', 'user'), deleteDeliveryRegion);

module.exports = router;
