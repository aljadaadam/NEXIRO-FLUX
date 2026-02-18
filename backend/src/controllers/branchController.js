const Branch = require('../models/Branch');

// ─── Public: جلب الفروع النشطة (للمتجر) ───
async function getPublicBranches(req, res) {
  try {
    const site_key = req.siteKey;
    if (!site_key) {
      return res.status(400).json({ error: 'Site key مطلوب' });
    }
    const branches = await Branch.findActiveBySiteKey(site_key);
    res.json({ branches });
  } catch (error) {
    console.error('Error in getPublicBranches:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الفروع' });
  }
}

// ─── Public: جلب فرع واحد ───
async function getPublicBranch(req, res) {
  try {
    const site_key = req.siteKey;
    const branch = await Branch.findByIdAndSite(req.params.id, site_key);
    if (!branch || branch.status !== 'active') {
      return res.status(404).json({ error: 'الفرع غير موجود' });
    }
    res.json({ branch });
  } catch (error) {
    console.error('Error in getPublicBranch:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الفرع' });
  }
}

// ─── Admin: جلب جميع الفروع ───
async function getAllBranches(req, res) {
  try {
    const { site_key } = req.user;
    const branches = await Branch.findBySiteKey(site_key);
    res.json({ branches });
  } catch (error) {
    console.error('Error in getAllBranches:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الفروع' });
  }
}

// ─── Admin: جلب فرع واحد ───
async function getBranch(req, res) {
  try {
    const { site_key } = req.user;
    const branch = await Branch.findByIdAndSite(req.params.id, site_key);
    if (!branch) {
      return res.status(404).json({ error: 'الفرع غير موجود' });
    }
    res.json({ branch });
  } catch (error) {
    console.error('Error in getBranch:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الفرع' });
  }
}

// ─── Admin: إنشاء فرع جديد ───
async function createBranch(req, res) {
  try {
    const { site_key } = req.user;
    const { name, name_en, address, address_en, city, phone, email, lat, lng, working_hours, is_main, image } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'اسم الفرع مطلوب' });
    }

    const branch = await Branch.create({
      site_key, name, name_en, address, address_en, city, phone, email,
      lat, lng, working_hours, is_main, image
    });

    res.status(201).json({ branch, message: 'تم إنشاء الفرع بنجاح' });
  } catch (error) {
    console.error('Error in createBranch:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الفرع' });
  }
}

// ─── Admin: تحديث فرع ───
async function updateBranch(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;

    const existing = await Branch.findByIdAndSite(id, site_key);
    if (!existing) {
      return res.status(404).json({ error: 'الفرع غير موجود' });
    }

    const branch = await Branch.update(id, site_key, req.body);
    res.json({ branch, message: 'تم تحديث الفرع بنجاح' });
  } catch (error) {
    console.error('Error in updateBranch:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الفرع' });
  }
}

// ─── Admin: حذف فرع ───
async function deleteBranch(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;

    const deleted = await Branch.delete(id, site_key);
    if (!deleted) {
      return res.status(404).json({ error: 'الفرع غير موجود' });
    }

    res.json({ message: 'تم حذف الفرع بنجاح' });
  } catch (error) {
    console.error('Error in deleteBranch:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الفرع' });
  }
}

module.exports = {
  getPublicBranches,
  getPublicBranch,
  getAllBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch
};
