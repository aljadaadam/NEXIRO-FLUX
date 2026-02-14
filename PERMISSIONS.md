# 🔐 نظام الصلاحيات (Permissions System)

## نظرة عامة
تم إضافة نظام صلاحيات متقدم للتحكم في وصول المستخدمين (خاصة الأدمن) إلى العمليات المختلفة.

---

## 📋 الصلاحيات المتاحة

### صلاحيات المنتجات (Products)
| الصلاحية | الوصف | العملية |
|---------|------|---------|
| `products:read` | عرض المنتجات | GET /api/products |
| `products:create` | إضافة منتج جديد | POST /api/products |
| `products:update` | تعديل منتج موجود | PUT /api/products/:id |
| `products:delete` | حذف منتج | DELETE /api/products/:id |
| `products:sync` | المزامنة مع مصدر خارجي | (مستقبلي) |

---

## 🗄️ هيكل قاعدة البيانات

### جدول `permissions`
```sql
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول `user_permissions`
```sql
CREATE TABLE user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    site_key VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

---

## 🔧 الاستخدام

### 1. التحقق من الصلاحيات في Routes

```javascript
const { checkPermission } = require('../middlewares/permissionMiddleware');

// مثال: التحقق من صلاحية واحدة
router.post('/', 
  authenticateToken, 
  checkPermission('products:create'), 
  createProduct
);

// مثال: التحقق من عدة صلاحيات
router.post('/special', 
  authenticateToken, 
  checkPermission(['products:create', 'products:sync']), 
  specialOperation
);
```

### 2. إدارة الصلاحيات عبر API

#### جلب جميع الصلاحيات
```bash
GET /api/auth/permissions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "permissions": [
    {
      "id": 1,
      "name": "products:read",
      "description": "عرض المنتجات",
      "category": "products"
    }
  ],
  "grouped": {
    "products": [...]
  }
}
```

#### جلب صلاحيات مستخدم معين
```bash
GET /api/auth/users/:userId/permissions
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "user_id": 5,
  "permissions": [
    {
      "id": 1,
      "name": "products:read",
      "description": "عرض المنتجات",
      "category": "products"
    }
  ]
}
```

#### منح صلاحية لمستخدم
```bash
POST /api/auth/permissions/grant
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": 5,
  "permission": "products:create"
}
```

**Response:**
```json
{
  "message": "تم منح الصلاحية بنجاح",
  "result": {
    "message": "تم منح الصلاحية بنجاح",
    "insertId": 15
  }
}
```

#### إلغاء صلاحية من مستخدم
```bash
POST /api/auth/permissions/revoke
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": 5,
  "permission": "products:create"
}
```

**Response:**
```json
{
  "message": "تم إلغاء الصلاحية بنجاح"
}
```

---

## 💻 استخدام Model في الكود

### منح صلاحية واحدة
```javascript
const Permission = require('./src/models/Permission');

await Permission.grantToUser(userId, 'products:read', siteKey);
```

### منح عدة صلاحيات دفعة واحدة
```javascript
const permissions = ['products:read', 'products:create', 'products:update'];
await Permission.grantMultipleToUser(userId, permissions, siteKey);
```

### منح جميع صلاحيات تصنيف معين
```javascript
await Permission.grantCategoryToUser(userId, 'products', siteKey);
```

### التحقق من وجود صلاحية
```javascript
const hasPermission = await Permission.userHasPermission(userId, 'products:create');
```

### إلغاء صلاحية
```javascript
await Permission.revokeFromUser(userId, 'products:create');
```

### إلغاء جميع صلاحيات المستخدم
```javascript
await Permission.revokeAllFromUser(userId);
```

---

## 🚀 إعداد الصلاحيات للأدمن الجديد

عند إنشاء أدمن جديد باستخدام `setupAdmin.js`، يتم منحه تلقائياً جميع صلاحيات المنتجات:

```bash
node setupAdmin.js
```

**Output:**
```
✅ تم إنشاء حساب الأدمن بنجاح
🔑 جاري منح الصلاحيات للأدمن...
   ✅ products:read
   ✅ products:create
   ✅ products:update
   ✅ products:delete
   ✅ products:sync
```

---

## 🔒 آلية عمل Middleware

```javascript
// middlewares/permissionMiddleware.js
function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    // 1. التحقق من أن المستخدم أدمن
    if (role !== 'admin') {
      return res.status(403).json({ error: 'هذا الإجراء يحتاج صلاحيات أدمن' });
    }

    // 2. التحقق من كل صلاحية مطلوبة
    for (const permission of permissions) {
      const hasPermission = await Permission.userHasPermission(userId, permission);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: `ليس لديك صلاحية: ${permission}`,
          required_permission: permission
        });
      }
    }

    next();
  };
}
```

---

## ✅ مزايا النظام

1. **تحكم دقيق**: صلاحيات محددة لكل عملية
2. **مرونة**: سهولة إضافة صلاحيات جديدة
3. **أمان**: فصل الصلاحيات عن الأدوار (roles)
4. **قابلية التوسع**: يمكن إضافة تصنيفات جديدة (categories)
5. **Multi-tenant**: دعم عدة مواقع بنفس النظام

---

## 📝 إضافة صلاحيات جديدة

### 1. إضافة في قاعدة البيانات
```sql
INSERT INTO permissions (name, description, category) VALUES
('orders:read', 'عرض الطلبات', 'orders'),
('orders:create', 'إنشاء طلب', 'orders');
```

### 2. إضافة في Routes
```javascript
router.get('/orders', 
  authenticateToken, 
  checkPermission('orders:read'), 
  getAllOrders
);
```

### 3. منح الصلاحية للمستخدمين
```javascript
await Permission.grantToUser(adminId, 'orders:read', siteKey);
```

---

## 🛠️ الملفات المعدلة/المضافة

### ملفات جديدة
- `src/models/Permission.js` - Model للصلاحيات
- `src/middlewares/permissionMiddleware.js` - Middleware للتحقق
- `migrations/add_permissions.sql` - Migration لإنشاء الجداول
- `PERMISSIONS.md` - هذا الملف

### ملفات محدثة
- `src/routes/productRoutes.js` - إضافة checkPermission
- `src/controllers/authController.js` - إضافة endpoints للصلاحيات
- `src/routes/authRoutes.js` - إضافة routes للصلاحيات
- `setupAdmin.js` - منح صلاحيات تلقائياً

---

## 🧪 اختبار النظام

### 1. تسجيل الدخول كأدمن
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "aljadadm654@gmail.com",
  "password": "12345678"
}
```

### 2. جلب صلاحيات الأدمن
```bash
GET http://localhost:3000/api/auth/users/1/permissions
Authorization: Bearer <token>
```

### 3. محاولة إنشاء منتج
```bash
POST http://localhost:3000/api/products
Authorization: Bearer <token>
{
  "name": "منتج تجريبي",
  "price": 100
}
```

**بدون صلاحية `products:create`:**
```json
{
  "error": "ليس لديك صلاحية: products:create",
  "required_permission": "products:create"
}
```

---

## 📞 الدعم

للمزيد من المعلومات أو المساعدة، راجع الكود المصدري أو تواصل مع فريق التطوير.
