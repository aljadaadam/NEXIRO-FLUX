const BlogPost = require('../models/BlogPost');

// ═══ Public (بدون مصادقة) ═══

// جلب المقالات المنشورة
async function getPublicPosts(req, res) {
  try {
    const siteKey = req.siteKey;
    if (!siteKey) {
      return res.status(400).json({ error: 'لم يتم تحديد الموقع' });
    }
    const posts = await BlogPost.findPublishedBySiteKey(siteKey);
    // parse content JSON
    const parsed = posts.map(p => ({
      ...p,
      content: typeof p.content === 'string' ? JSON.parse(p.content || '[]') : p.content,
    }));
    res.json({ posts: parsed });
  } catch (error) {
    console.error('Error in getPublicPosts:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المقالات' });
  }
}

// جلب مقال واحد منشور + زيادة عداد القراءات
async function getPublicPost(req, res) {
  try {
    const siteKey = req.siteKey;
    if (!siteKey) {
      return res.status(400).json({ error: 'لم يتم تحديد الموقع' });
    }
    const post = await BlogPost.findPublishedById(req.params.id, siteKey);
    if (!post) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    post.content = typeof post.content === 'string' ? JSON.parse(post.content || '[]') : post.content;
    res.json({ post });
  } catch (error) {
    console.error('Error in getPublicPost:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المقال' });
  }
}

// ═══ Admin (يحتاج مصادقة) ═══

// جلب جميع المقالات
async function getPosts(req, res) {
  try {
    const { site_key } = req.user;
    const posts = await BlogPost.findBySiteKey(site_key);
    const parsed = posts.map(p => ({
      ...p,
      content: typeof p.content === 'string' ? JSON.parse(p.content || '[]') : p.content,
    }));
    res.json({ posts: parsed });
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المقالات' });
  }
}

// جلب مقال واحد
async function getPost(req, res) {
  try {
    const { site_key } = req.user;
    const post = await BlogPost.findById(req.params.id, site_key);
    if (!post) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    post.content = typeof post.content === 'string' ? JSON.parse(post.content || '[]') : post.content;
    res.json({ post });
  } catch (error) {
    console.error('Error in getPost:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المقال' });
  }
}

// إنشاء مقال
async function createPost(req, res) {
  try {
    const { site_key } = req.user;
    // Security: whitelist allowed fields to prevent mass assignment
    const allowedFields = ['title', 'slug', 'content', 'excerpt', 'cover_image', 'is_published', 'category', 'tags', 'meta_title', 'meta_description'];
    const data = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    // Length limits
    if (data.title && data.title.length > 500) return res.status(400).json({ error: 'العنوان طويل جداً (حد 500 حرف)' });
    if (data.excerpt && data.excerpt.length > 2000) return res.status(400).json({ error: 'المقتطف طويل جداً (حد 2000 حرف)' });
    if (Array.isArray(data.content)) {
      data.content = JSON.stringify(data.content);
    }
    const post = await BlogPost.create(site_key, data);
    post.content = typeof post.content === 'string' ? JSON.parse(post.content || '[]') : post.content;
    res.status(201).json({ message: 'تم إنشاء المقال', post });
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المقال' });
  }
}

// تحديث مقال
async function updatePost(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    // Security: whitelist allowed fields
    const allowedFields = ['title', 'slug', 'content', 'excerpt', 'cover_image', 'is_published', 'category', 'tags', 'meta_title', 'meta_description'];
    const data = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    if (data.title && data.title.length > 500) return res.status(400).json({ error: 'العنوان طويل جداً' });
    if (data.excerpt && data.excerpt.length > 2000) return res.status(400).json({ error: 'المقتطف طويل جداً' });
    if (Array.isArray(data.content)) {
      data.content = JSON.stringify(data.content);
    }
    const post = await BlogPost.update(id, site_key, data);
    if (!post) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    post.content = typeof post.content === 'string' ? JSON.parse(post.content || '[]') : post.content;
    res.json({ message: 'تم تحديث المقال', post });
  } catch (error) {
    console.error('Error in updatePost:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث المقال' });
  }
}

// حذف مقال
async function deletePost(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const deleted = await BlogPost.delete(id, site_key);
    if (!deleted) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    res.json({ message: 'تم حذف المقال' });
  } catch (error) {
    console.error('Error in deletePost:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المقال' });
  }
}

// تبديل حالة النشر
async function togglePublish(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const post = await BlogPost.findById(id, site_key);
    if (!post) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    const updated = await BlogPost.update(id, site_key, { is_published: !post.is_published });
    updated.content = typeof updated.content === 'string' ? JSON.parse(updated.content || '[]') : updated.content;
    res.json({ message: updated.is_published ? 'تم نشر المقال' : 'تم إلغاء النشر', post: updated });
  } catch (error) {
    console.error('Error in togglePublish:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

module.exports = {
  getPublicPosts,
  getPublicPost,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
};
