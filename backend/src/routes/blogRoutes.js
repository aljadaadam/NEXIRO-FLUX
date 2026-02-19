const express = require('express');
const router = express.Router();
const {
  getPublicPosts,
  getPublicPost,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
} = require('../controllers/blogController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── Public (بدون مصادقة) ───
router.get('/public', getPublicPosts);
router.get('/public/:id', getPublicPost);

// ─── Admin routes (تحتاج مصادقة) ───
router.use(validateSite);

router.get('/', authenticateToken, requireRole('admin', 'user'), getPosts);
router.get('/:id', authenticateToken, requireRole('admin', 'user'), getPost);
router.post('/', authenticateToken, requireRole('admin', 'user'), createPost);
router.put('/:id', authenticateToken, requireRole('admin', 'user'), updatePost);
router.delete('/:id', authenticateToken, requireRole('admin', 'user'), deletePost);
router.patch('/:id/toggle-publish', authenticateToken, requireRole('admin', 'user'), togglePublish);

module.exports = router;
