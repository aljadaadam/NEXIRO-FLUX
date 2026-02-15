
const User = require('../models/User');
const Site = require('../models/Site');
const Permission = require('../models/Permission');
const { generateToken } = require('../utils/token');
const { SITE_KEY, GOOGLE_CLIENT_ID } = require('../config/env');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/email');

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// إنشاء حساب أدمن جديد للموقع
async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;

    // التحقق من المدخلات
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    // التحقق من أن SITE_KEY موجود
    if (!SITE_KEY || SITE_KEY === 'default-site-key') {
      return res.status(400).json({ 
        error: 'لم يتم تهيئة الموقع، تأكد من إعداد SITE_KEY في ملف .env' 
      });
    }

    // التحقق من وجود الموقع
    const site = await Site.findBySiteKey(SITE_KEY);
    if (!site) {
      return res.status(404).json({ 
        error: 'الموقع غير مسجل في النظام. اتصل بالدعم.' 
      });
    }

    // التحقق من أن البريد الإلكتروني غير مستخدم في نفس الموقع
    const existingUser = await User.findByEmailAndSite(email, SITE_KEY);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني مستخدم بالفعل في هذا الموقع' 
      });
    }

    // إنشاء الأدمن
    const admin = await User.create({
      site_key: SITE_KEY,
      name,
      email,
      password,
      role: 'admin'
    });

    // إنشاء التوكن
    const token = generateToken(admin.id, admin.role, SITE_KEY);

    // إرسال بريد ترحيبي
    emailService.sendWelcomeAdmin({ to: admin.email, name: admin.name, siteName: site.name }).catch(e => console.error('Email error:', e.message));

    res.status(201).json({
      message: 'تم إنشاء حساب الأدمن بنجاح',
      token, // التوكن في الجذر
      site_key: SITE_KEY, // إضافة site_key في الجذر
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        site_key: admin.site_key
      },
      site: {
        id: site.id,
        name: site.name,
        domain: site.domain,
        site_key: site.site_key
      }
    });
  } catch (error) {
    console.error('Error in registerAdmin:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء حساب الأدمن' });
  }
}

// تسجيل الدخول
async function login(req, res) {
  try {
    const { email, password } = req.body;
    // 🚨 أضف هذا السطر المؤقت
    console.log('Login Request Body:', req.body);

    // التحقق من المدخلات
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
      });
    }

    // التحقق من أن SITE_KEY موجود
    if (!SITE_KEY || SITE_KEY === 'default-site-key') {
      return res.status(400).json({ 
        error: 'لم يتم تهيئة الموقع، تأكد من إعداد SITE_KEY في ملف .env' 
      });
    }

    // البحث عن المستخدم في هذا الموقع
    const user = await User.findByEmailAndSite(email, SITE_KEY);
    if (!user) {
      return res.status(401).json({ 
        error: 'بيانات الدخول غير صحيحة' 
      });
    }

    // التحقق من كلمة المرور
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'بيانات الدخول غير صحيحة' 
      });
    }

    // التحقق من وجود الموقع
    const site = await Site.findBySiteKey(SITE_KEY);
    if (!site) {
      return res.status(500).json({ 
        error: 'حدث خطأ في بيانات الموقع' 
      });
    }

    // إنشاء التوكن
    const token = generateToken(user.id, user.role, SITE_KEY);

    // تنبيه تسجيل الدخول
    emailService.sendLoginAlert({
      to: user.email, name: user.name,
      ip: req.ip, device: req.headers['user-agent'],
      time: new Date().toLocaleString('ar-SA')
    }).catch(e => console.error('Email error:', e.message));

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token, // التوكن في الجذر (متوافق مع الواجهة الأمامية)
      site_key: SITE_KEY, // إضافة site_key في الجذر
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        site_key: user.site_key
      },
      site: {
        id: site.id,
        name: site.name,
        domain: site.domain,
        site_key: site.site_key
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تسجيل الدخول' 
    });
  }
}

// إنشاء مستخدم جديد (للأدمن فقط)
async function createUser(req, res) {
  try {
    const { site_key } = req.user;
    const { name, email, password, role = 'user' } = req.body;

    // التحقق من أن المستخدم أدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
      });
    }

    // التحقق من المدخلات
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'جميع الحقول مطلوبة' 
      });
    }

    // التحقق من أن البريد الإلكتروني غير مستخدم في نفس الموقع
    const existingUser = await User.findByEmailAndSite(email, site_key);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني مستخدم بالفعل في هذا الموقع' 
      });
    }

    // إنشاء المستخدم
    const user = await User.create({ 
      site_key, 
      name, 
      email, 
      password,
      role
    });

    res.status(201).json({
      message: 'تم إنشاء المستخدم بنجاح',
      token: req.headers.authorization?.replace('Bearer ', ''), // إعادة التوكن
      site_key: site_key, // إضافة site_key
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        site_key: user.site_key
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء إنشاء المستخدم' 
    });
  }
}

// الحصول على بيانات الملف الشخصي
async function getMyProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'المستخدم غير موجود' 
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        site_key: user.site_key
      },
      site_key: user.site_key // إضافة site_key
    });
  } catch (error) {
    console.error('Error in getMyProfile:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب بيانات الملف الشخصي' 
    });
  }
}

// الحصول على جميع مستخدمي الموقع (للأدمن فقط)
async function getSiteUsers(req, res) {
  try {
    const { site_key, role } = req.user;
    
    // التحقق من أن المستخدم أدمن
    if (role !== 'admin') {
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
      });
    }
    
    const users = await User.findBySiteKey(site_key);
    
    res.json({
      users,
      site_key: site_key // إضافة site_key
    });
  } catch (error) {
    console.error('Error in getSiteUsers:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب مستخدمي الموقع' 
    });
  }
}

// الحصول على صلاحيات مستخدم معين (للأدمن فقط)
async function getUserPermissions(req, res) {
  try {
    const { role } = req.user;
    const { userId } = req.params;

    if (role !== 'admin') {
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
      });
    }

    const permissions = await Permission.findByUserId(userId);
    
    res.json({
      user_id: userId,
      permissions
    });
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب صلاحيات المستخدم' 
    });
  }
}

// منح صلاحية لمستخدم (للأدمن فقط)
async function grantPermission(req, res) {
  try {
    const { role, site_key } = req.user;
    const { userId, permission } = req.body;

    if (role !== 'admin') {
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
      });
    }

    if (!userId || !permission) {
      return res.status(400).json({ 
        error: 'معرف المستخدم والصلاحية مطلوبان' 
      });
    }

    const result = await Permission.grantToUser(userId, permission, site_key);
    
    res.json({
      message: 'تم منح الصلاحية بنجاح',
      result
    });
  } catch (error) {
    console.error('Error in grantPermission:', error);
    res.status(500).json({ 
      error: error.message || 'حدث خطأ أثناء منح الصلاحية' 
    });
  }
}

// إلغاء صلاحية من مستخدم (للأدمن فقط)
async function revokePermission(req, res) {
  try {
    const { role } = req.user;
    const { userId, permission } = req.body;

    if (role !== 'admin') {
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
      });
    }

    if (!userId || !permission) {
      return res.status(400).json({ 
        error: 'معرف المستخدم والصلاحية مطلوبان' 
      });
    }

    const revoked = await Permission.revokeFromUser(userId, permission);
    
    if (!revoked) {
      return res.status(404).json({ 
        error: 'الصلاحية غير موجودة للمستخدم' 
      });
    }

    res.json({
      message: 'تم إلغاء الصلاحية بنجاح'
    });
  } catch (error) {
    console.error('Error in revokePermission:', error);
    res.status(500).json({ 
      error: error.message || 'حدث خطأ أثناء إلغاء الصلاحية' 
    });
  }
}

// الحصول على جميع الصلاحيات المتاحة
async function getAllPermissions(req, res) {
  try {
    const permissions = await Permission.findAll();
    
    // تجميع الصلاحيات حسب التصنيف
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    res.json({
      permissions,
      grouped: groupedPermissions
    });
  } catch (error) {
    console.error('Error in getAllPermissions:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب الصلاحيات' 
    });
  }
}

// تسجيل الدخول بحساب Google
async function googleLogin(req, res) {
  try {
    const { credential, access_token } = req.body;

    if (!credential && !access_token) {
      return res.status(400).json({ error: 'Google credential or access_token is required' });
    }

    let email, name, googleId, picture;

    if (credential) {
      // Verify Google ID token (from GoogleLogin component / One Tap)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
      picture = payload.picture;
    } else {
      // Verify access_token by fetching user info from Google
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
      if (!response.ok) {
        return res.status(401).json({ error: 'Invalid Google access token' });
      }
      const payload = await response.json();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
      picture = payload.picture;
    }

    if (!email) {
      return res.status(400).json({ error: 'Could not retrieve email from Google account' });
    }

    // Verify SITE_KEY
    if (!SITE_KEY || SITE_KEY === 'default-site-key') {
      return res.status(400).json({ 
        error: 'لم يتم تهيئة الموقع، تأكد من إعداد SITE_KEY في ملف .env' 
      });
    }

    // Verify site exists
    const site = await Site.findBySiteKey(SITE_KEY);
    if (!site) {
      return res.status(404).json({ 
        error: 'الموقع غير مسجل في النظام. اتصل بالدعم.' 
      });
    }

    // Find or create user
    const { user, isNew } = await User.findOrCreateByGoogle({
      site_key: SITE_KEY,
      name: name || email.split('@')[0],
      email,
      googleId,
    });

    // Generate JWT token
    const token = generateToken(user.id, user.role, SITE_KEY);

    // بريد ترحيبي للمستخدمين الجدد عبر Google
    if (isNew) {
      emailService.sendWelcomeAdmin({ to: user.email, name: user.name, siteName: site.name }).catch(e => console.error('Email error:', e.message));
    }

    res.json({
      message: isNew ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح عبر Google' : 'تم تسجيل الدخول بنجاح عبر Google',
      token,
      site_key: SITE_KEY,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        site_key: user.site_key,
        picture: picture || null,
      },
      site: {
        id: site.id,
        name: site.name,
        domain: site.domain,
        site_key: site.site_key,
      },
    });
  } catch (error) {
    console.error('Error in googleLogin:', error);
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Google token is invalid or expired' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول عبر Google' });
  }
}

module.exports = {
  registerAdmin,
  login,
  googleLogin,
  createUser,
  getMyProfile,
  getSiteUsers,
  getUserPermissions,
  grantPermission,
  revokePermission,
  getAllPermissions
};
