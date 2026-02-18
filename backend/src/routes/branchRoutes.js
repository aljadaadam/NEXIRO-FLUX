const express = require('express');
const router = express.Router();
const {
  getPublicBranches,
  getPublicBranch,
  getAllBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch
} = require('../controllers/branchController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── Public (بدون مصادقة) ───
router.get('/public', getPublicBranches);
router.get('/public/:id', getPublicBranch);

// ─── Admin routes (تحتاج مصادقة) ───
router.use(validateSite);

router.get('/', authenticateToken, requireRole('admin', 'user'), getAllBranches);
router.get('/:id', authenticateToken, requireRole('admin', 'user'), getBranch);
router.post('/', authenticateToken, requireRole('admin', 'user'), createBranch);
router.put('/:id', authenticateToken, requireRole('admin', 'user'), updateBranch);
router.delete('/:id', authenticateToken, requireRole('admin', 'user'), deleteBranch);

module.exports = router;
