
const User = require('../models/User');
const Site = require('../models/Site');
const Permission = require('../models/Permission');
const { generateToken } = require('../utils/token');
const { GOOGLE_CLIENT_ID } = require('../config/env');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// In-memory reset tokens store (key: token, value: { email, site_key, expires })
const resetTokens = new Map();
// Cleanup expired tokens every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens) {
    if (data.expires < now) resetTokens.delete(token);
  }
}, 15 * 60 * 1000);

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// إنشاء حساب أدمن جديد للموقع
async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;

    // التحقق من المدخلات
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const siteKey = req.siteKey;
    if (!siteKey || siteKey === 'default-site-key') {
      return res.status(400).json({ 
        error: 'لم يتم تحديد الموقع. أرسل X-Site-Key header أو هيئ SITE_KEY' 
      });
    }

    // التحقق من وجود الموقع
    const site = req.site || await Site.findBySiteKey(siteKey);
    if (!site) {
      return res.status(404).json({ 
        error: 'الموقع غير مسجل في النظام. اتصل بالدعم.' 
      });
    }

    // التحقق من أن البريد الإلكتروني غير مستخدم في نفس الموقع
    const existingUser = await User.findByEmailAndSite(email, siteKey);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني مستخدم بالفعل في هذا الموقع' 
      });
    }

    // إنشاء الأدمن
    const admin = await User.create({
      site_key: siteKey,
      name,
      email,
      password,
      role: 'admin'
    });

    // إنشاء التوكن
    const token = generateToken(admin.id, admin.role, siteKey);

    // إرسال بريد ترحيبي
    emailService.sendWelcomeAdmin({ to: admin.email, name: admin.name, siteName: site.name }).catch(e => console.error('Email error:', e.message));

    res.status(201).json({
      message: 'تم إنشاء حساب الأدمن بنجاح',
      token,
      site_key: siteKey,
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

// ─── تسجيل مستخدم جديد على المنصة (ليس أدمن) ───
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const siteKey = req.siteKey;
    if (!siteKey || siteKey === 'default-site-key') {
      return res.status(400).json({ 
        error: 'لم يتم تحديد الموقع' 
      });
    }

    const site = req.site || await Site.findBySiteKey(siteKey);
    if (!site) {
      return res.status(404).json({ 
        error: 'الموقع غير مسجل في النظام' 
      });
    }

    // التحقق من أن البريد الإلكتروني غير مستخدم
    const existingUser = await User.findByEmailAndSite(email, siteKey);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني مستخدم بالفعل' 
      });
    }

    // إنشاء مستخدم عادي (ليس أدمن)
    const user = await User.create({
      site_key: siteKey,
      name,
      email,
      password,
      role: 'user'
    });

    const token = generateToken(user.id, user.role, siteKey);

    // إرسال بريد ترحيبي للمستخدم العادي (ليس أدمن)
    emailService.sendWelcomeUser({ to: user.email, name: user.name }).catch(e => console.error('Email error:', e.message));

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      site_key: siteKey,
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
    console.error('Error in registerUser:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
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

    const siteKey = req.siteKey;
    if (!siteKey || siteKey === 'default-site-key') {
      return res.status(400).json({ 
        error: 'لم يتم تحديد الموقع' 
      });
    }

    // البحث عن المستخدم في هذا الموقع
    const user = await User.findByEmailAndSite(email, siteKey);
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
    const site = req.site || await Site.findBySiteKey(siteKey);
    if (!site) {
      return res.status(500).json({ 
        error: 'حدث خطأ في بيانات الموقع' 
      });
    }

    // إنشاء التوكن
    const token = generateToken(user.id, user.role, siteKey);

    // تنبيه تسجيل الدخول
    emailService.sendLoginAlert({
      to: user.email, name: user.name,
      ip: req.ip, device: req.headers['user-agent'],
      time: new Date().toLocaleString('ar-SA')
    }).catch(e => console.error('Email error:', e.message));

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      site_key: siteKey,
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

    const siteKey = req.siteKey;
    if (!siteKey || siteKey === 'default-site-key') {
      return res.status(400).json({ 
        error: 'لم يتم تحديد الموقع' 
      });
    }

    // Verify site exists
    const site = req.site || await Site.findBySiteKey(siteKey);
    if (!site) {
      return res.status(404).json({ 
        error: 'الموقع غير مسجل في النظام. اتصل بالدعم.' 
      });
    }

    // Find or create user — platform users get 'user' role, site-specific get 'admin'
    // Determine default role: if this is a provisioned site (has template_id), new users are admin
    // Otherwise on the main platform, new users are regular users
    const isPlatformSite = !site.template_id;
    const defaultRole = isPlatformSite ? 'user' : 'admin';

    const { user, isNew } = await User.findOrCreateByGoogle({
      site_key: siteKey,
      name: name || email.split('@')[0],
      email,
      googleId,
      defaultRole,
    });

    // Generate JWT token
    const token = generateToken(user.id, user.role, siteKey);

    // بريد ترحيبي للمستخدمين الجدد عبر Google
    if (isNew) {
      if (user.role === 'admin') {
        emailService.sendWelcomeAdmin({ to: user.email, name: user.name, siteName: site.name }).catch(e => console.error('Email error:', e.message));
      } else {
        emailService.sendWelcomeUser({ to: user.email, name: user.name }).catch(e => console.error('Email error:', e.message));
      }
    }

    res.json({
      message: isNew ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح عبر Google' : 'تم تسجيل الدخول بنجاح عبر Google',
      token,
      site_key: siteKey,
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

// ─── نسيت كلمة المرور ───
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب', errorEn: 'Email is required' });
    }

    const site_key = req.siteKey || req.site?.site_key;
    if (!site_key) {
      return res.status(400).json({ error: 'لم يتم تحديد الموقع', errorEn: 'Site not identified' });
    }

    const user = await User.findByEmailAndSite(email.toLowerCase().trim(), site_key);

    // Always respond with success (don't reveal if email exists)
    if (!user) {
      return res.json({
        message: 'إذا كان البريد مسجلاً لدينا، سيتم إرسال رابط إعادة تعيين كلمة المرور',
        messageEn: 'If this email is registered, a password reset link will be sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    resetTokens.set(resetToken, {
      email: user.email,
      site_key,
      userId: user.id,
      expires: Date.now() + 30 * 60 * 1000 // 30 minutes
    });

    // Build reset link (platform website)
    const baseUrl = req.headers.origin || req.headers.referer?.replace(/\/[^/]*$/, '') || 'https://nexiroflux.com';
    const resetLink = `${baseUrl}/login?reset_token=${resetToken}`;

    // Send email
    const site = await Site.findBySiteKey(site_key);
    const siteSettings = site?.settings ? (typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings) : null;

    await emailService.sendPasswordReset({
      to: user.email,
      name: user.name,
      resetLink,
      siteSettings,
      siteKey: site_key,
    });

    res.json({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      messageEn: 'Password reset link has been sent to your email'
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'حدث خطأ، حاول لاحقاً', errorEn: 'An error occurred, try again later' });
  }
}

// ─── إعادة تعيين كلمة المرور ───
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'الرمز وكلمة المرور مطلوبان', errorEn: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', errorEn: 'Password must be at least 6 characters' });
    }

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ error: 'رابط إعادة التعيين غير صالح أو منتهي', errorEn: 'Reset link is invalid or expired' });
    }

    if (tokenData.expires < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'انتهت صلاحية رابط إعادة التعيين', errorEn: 'Reset link has expired' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = require('../config/db').getPool();
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ? AND site_key = ?',
      [hashedPassword, tokenData.userId, tokenData.site_key]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'فشل تحديث كلمة المرور', errorEn: 'Failed to update password' });
    }

    // Remove used token
    resetTokens.delete(token);

    res.json({
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
      messageEn: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'حدث خطأ، حاول لاحقاً', errorEn: 'An error occurred, try again later' });
  }
}

module.exports = {
  registerAdmin,
  registerUser,
  login,
  googleLogin,
  createUser,
  getMyProfile,
  getSiteUsers,
  getUserPermissions,
  grantPermission,
  revokePermission,
  getAllPermissions,
  forgotPassword,
  resetPassword
};
