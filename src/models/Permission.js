const { getPool } = require('../config/db');

class Permission {
  // جلب جميع الصلاحيات
  static async findAll() {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM permissions ORDER BY category, name'
    );
    return rows;
  }

  // جلب صلاحية بالاسم
  static async findByName(name) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM permissions WHERE name = ?',
      [name]
    );
    return rows[0] || null;
  }

  // جلب صلاحيات حسب التصنيف
  static async findByCategory(category) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM permissions WHERE category = ?',
      [category]
    );
    return rows;
  }

  // جلب صلاحيات المستخدم
  static async findByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.* 
       FROM permissions p
       INNER JOIN user_permissions up ON p.id = up.permission_id
       WHERE up.user_id = ?`,
      [userId]
    );
    return rows;
  }

  // التحقق من وجود صلاحية للمستخدم
  static async userHasPermission(userId, permissionName) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count
       FROM user_permissions up
       INNER JOIN permissions p ON up.permission_id = p.id
       WHERE up.user_id = ? AND p.name = ?`,
      [userId, permissionName]
    );
    return rows[0].count > 0;
  }

  // منح صلاحية للمستخدم
  static async grantToUser(userId, permissionName, siteKey) {
    const pool = getPool();
    
    // الحصول على معرف الصلاحية
    const permission = await this.findByName(permissionName);
    if (!permission) {
      throw new Error(`الصلاحية ${permissionName} غير موجودة`);
    }

    // التحقق من عدم وجود الصلاحية مسبقاً
    const hasPermission = await this.userHasPermission(userId, permissionName);
    if (hasPermission) {
      return { message: 'المستخدم لديه هذه الصلاحية بالفعل' };
    }

    const [result] = await pool.query(
      'INSERT INTO user_permissions (user_id, permission_id, site_key) VALUES (?, ?, ?)',
      [userId, permission.id, siteKey]
    );

    return { 
      message: 'تم منح الصلاحية بنجاح',
      insertId: result.insertId 
    };
  }

  // منح عدة صلاحيات للمستخدم دفعة واحدة
  static async grantMultipleToUser(userId, permissionNames, siteKey) {
    const pool = getPool();
    const results = [];

    for (const permissionName of permissionNames) {
      try {
        const result = await this.grantToUser(userId, permissionName, siteKey);
        results.push({ permission: permissionName, success: true, result });
      } catch (error) {
        results.push({ permission: permissionName, success: false, error: error.message });
      }
    }

    return results;
  }

  // إلغاء صلاحية من المستخدم
  static async revokeFromUser(userId, permissionName) {
    const pool = getPool();
    
    const permission = await this.findByName(permissionName);
    if (!permission) {
      throw new Error(`الصلاحية ${permissionName} غير موجودة`);
    }

    const [result] = await pool.query(
      'DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?',
      [userId, permission.id]
    );

    return result.affectedRows > 0;
  }

  // إلغاء جميع صلاحيات المستخدم
  static async revokeAllFromUser(userId) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM user_permissions WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  }

  // منح جميع صلاحيات تصنيف معين للمستخدم
  static async grantCategoryToUser(userId, category, siteKey) {
    const permissions = await this.findByCategory(category);
    const permissionNames = permissions.map(p => p.name);
    return await this.grantMultipleToUser(userId, permissionNames, siteKey);
  }
}

module.exports = Permission;
