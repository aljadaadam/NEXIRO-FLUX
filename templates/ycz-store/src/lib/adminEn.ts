/**
 * Admin Panel — Arabic → English Translation Dictionary
 * Extracted from all 17 admin page/component files.
 * Grouped by component / page — deduplicated across all files.
 */

const adminEn: Record<string, string> = {

  // ─── Navigation / Sidebar / Mobile Nav ───
  'الرئيسية': 'Home',
  'نظرة عامة': 'Overview',
  'المنتجات': 'Products',
  'الطلبات': 'Orders',
  'المستخدمين': 'Users',
  'المدفوعات': 'Payments',
  'المصادر': 'Sources',
  'التخصيص': 'Customize',
  'الإعلانات': 'Announcements',
  'المدونة': 'Blog',
  'الدردشة': 'Chat',
  'فلاش إعلان': 'Flash Ad',
  'الإعدادات': 'Settings',
  'تسجيل الخروج': 'Log Out',
  'إغلاق القائمة': 'Close Menu',

  // ─── Login / Auth ───
  'البريد الإلكتروني وكلمة المرور مطلوبان': 'Email and password are required',
  'حدث خطأ أثناء تسجيل الدخول': 'An error occurred during login',
  'هذا الحساب ليس حساب مدير': 'This account is not an admin account',
  'لا يمكن الاتصال بالخادم': 'Cannot connect to the server',
  'البريد الإلكتروني': 'Email',
  'كلمة المرور': 'Password',
  'سجّل الدخول للوصول إلى لوحة الإدارة': 'Log in to access the admin panel',
  'لوحة التحكم': 'Dashboard',
  'جاري الدخول...': 'Logging in...',
  'تسجيل الدخول': 'Log In',

  // ─── 404 Page ───
  'الصفحة غير موجودة': 'Page Not Found',
  'العودة للرئيسية': 'Back to Home',

  // ─── Error Page ───
  'حدث خطأ': 'An Error Occurred',
  'إعادة المحاولة': 'Retry',

  // ─── Dash Header ───
  'بحث...': 'Search...',
  'المدير': 'Admin',

  // ─── Overview Page ───
  'إجمالي الأرباح': 'Total Revenue',
  'معدل الإكمال': 'Completion Rate',
  'الزبائن': 'Customers',
  'إجمالي': 'Total',
  'اليوم': 'Today',
  'إدارة المتجر ومتابعة الأداء من مكان واحد': 'Manage your store and track performance from one place',
  'تحديث البيانات': 'Refresh Data',
  'المتجر نشط ✅': 'Store is Active ✅',
  'منتج جديد': 'New Product',
  'الطلبات المعلقة': 'Pending Orders',
  'الرسائل': 'Messages',
  'معاينة المتجر': 'Preview Store',
  'المبيعات الشهرية': 'Monthly Sales',
  'لا توجد بيانات مبيعات بعد': 'No sales data yet',
  'آخر الطلبات': 'Latest Orders',
  'عرض الكل': 'View All',
  'لا توجد طلبات بعد': 'No orders yet',
  [`لديك \${pendingCount} طلب معلق بانتظار المعالجة`]: `You have \${pendingCount} pending order(s) awaiting processing`,
  [`لديك \${unreadChat} رسالة جديدة غير مقروءة`]: `You have \${unreadChat} new unread message(s)`,

  // ─── Status Labels (shared across pages) ───
  'معلق': 'Pending',
  'جارٍ': 'In Progress',
  'جارٍ التنفيذ': 'In Progress',
  'مكتمل': 'Completed',
  'مرفوض': 'Rejected',
  'ملغي': 'Cancelled',
  'مسترجع': 'Refunded',
  'نشط': 'Active',
  'غير نشط': 'Inactive',
  'محظور': 'Blocked',
  'قيد الانتظار': 'Pending',
  'قيد المعالجة': 'Processing',
  'فاشل': 'Failed',

  // ─── Orders Page ───
  '🛒 الطلبات': '🛒 Orders',
  'الكل': 'All',
  'رقم الطلب': 'Order #',
  'المنتج': 'Product',
  'العميل': 'Customer',
  'المبلغ': 'Amount',
  'الحالة': 'Status',
  'التاريخ': 'Date',
  'إجراءات': 'Actions',
  'جاري التحميل...': 'Loading...',
  'لا توجد طلبات': 'No orders',
  'إكمال الطلب': 'Complete Order',
  'رفض الطلب': 'Reject Order',
  'المنتج:': 'Product:',
  'العميل:': 'Customer:',
  'المبلغ:': 'Amount:',
  'رسالة الإكمال / نتيجة الخدمة': 'Completion message / Service result',
  'أدخل رد الخدمة أو رسالة الإكمال للعميل...': 'Enter the service response or completion message for the customer...',
  'سبب الرفض': 'Rejection reason',
  'أدخل سبب الرفض...': 'Enter the rejection reason...',
  'جاري...': 'Processing...',
  'إلغاء': 'Cancel',
  'مرفوض من الإدارة': 'Rejected by admin',
  'تحويل لجارٍ التنفيذ': 'Move to In Progress',
  'استرجاع الرصيد': 'Refund Balance',

  // ─── Products Page ───
  'إضافة منتج': 'Add Product',
  'اسم المنتج': 'Product Name',
  'اسم المنتج بالعربي': 'Product Name (Arabic)',
  'السعر ($)': 'Price ($)',
  'وصف المنتج...': 'Product description...',
  'اسم القروب الجديد': 'New Group Name',
  '— اختر القروب —': '— Select Group —',
  '➕ قروب جديد...': '➕ New Group...',
  'تصنيف كـ لعبة (isGame)': 'Classify as Game (isGame)',
  'جاري الحفظ...': 'Saving...',
  'حفظ': 'Save',
  'تم إنشاء المنتج بنجاح': 'Product created successfully',
  'فشل إنشاء المنتج': 'Failed to create product',
  'تم تحديث المنتج بنجاح': 'Product updated successfully',
  'فشل تحديث المنتج': 'Failed to update product',
  'تم حذف المنتج': 'Product deleted',
  'فشل حذف المنتج': 'Failed to delete product',
  'إجمالي المنتجات': 'Total Products',
  'منتجات نشطة': 'Active Products',
  'خدمات IMEI': 'IMEI Services',
  'أدوات سوفتوير': 'Software Tools',
  'كل الحالات': 'All Statuses',
  'كل الأنواع': 'All Types',
  'كل القروبات': 'All Groups',
  '⊞ إدارة القروبات': '⊞ Manage Groups',
  'جاري الحذف...': 'Deleting...',
  'القروبات': 'Groups',
  'اسم القروب': 'Group Name',
  'عدد المنتجات': 'Products Count',
  'لا توجد قروبات': 'No groups',
  'قروب': 'Group',
  'تعديل الاسم': 'Edit Name',
  'حذف القروب ومنتجاتها': 'Delete group and its products',
  'عرض المنتجات': 'View Products',
  'تم تغيير اسم القروب': 'Group name changed',
  'فشل تغيير اسم القروب': 'Failed to change group name',
  'تم حذف القروب': 'Group deleted',
  'فشل حذف القروب': 'Failed to delete group',
  '#': '#',
  'السعر': 'Price',
  'النوع': 'Type',
  'المصدر': 'Source',
  'لا توجد منتجات مطابقة للفلتر': 'No products matching the filter',
  'لا توجد نتائج': 'No results',
  'تعديل المنتج': 'Edit Product',
  'تعديل بيانات وإعدادات المنتج': 'Edit product data and settings',
  'معلومات أساسية': 'Basic Information',
  'الاسم (إنجليزي)': 'Name (English)',
  'الاسم (عربي)': 'Name (Arabic)',
  'إعدادات المنتج': 'Product Settings',
  'أولوية اللغة': 'Language Priority',
  'عربي أولاً': 'Arabic First',
  'تصنيف كـ لعبة': 'Classify as Game',
  'تفعيل QNT (الكمية)': 'Enable QNT (Quantity)',
  'القروب': 'Group',
  '— بدون قروب —': '— No Group —',
  '+ قروب جديد...': '+ New Group...',
  'الوصف': 'Description',
  'أضف وصف للمنتج...': 'Add product description...',
  'اتصال المصدر': 'Source Connection',
  'متصل — يرسل تلقائياً': 'Connected — Auto-sends',
  'مفصول — الطلبات معلقة': 'Disconnected — Orders pending',
  'المصدر المرتبط': 'Linked Source',
  '— بدون مصدر (مفصول) —': '— No Source (Disconnected) —',
  'سيتم نقل المنتج لمصدر جديد': 'Product will be moved to a new source',
  'المنتج المرتبط (تحويل الطلب)': 'Linked Product (Order Forwarding)',
  'نفس المنتج': 'Same Product',
  'نفسه': 'Same',
  'حقول المنتج': 'Product Fields',
  'حقل': 'Field',
  'الحقول التي يملأها العميل عند الطلب': 'Fields the customer fills when ordering',
  'المفتاح (Key)': 'Key',
  'التسمية (Label)': 'Label',
  'النص التوضيحي': 'Placeholder Text',
  'مطلوب': 'Required',
  'إضافة حقل': 'Add Field',
  'مسح الكل': 'Clear All',
  'لا توجد حقول مخصصة': 'No custom fields',
  'أضف حقول ليملأها العميل عند الطلب': 'Add fields for the customer to fill when ordering',
  'حفظ التعديل': 'Save Changes',
  'فصل المنتج من المصدر': 'Disconnect product from source',
  'إعادة ربط بالمصدر الأصلي': 'Reconnect to original source',
  'رقم IMEI': 'IMEI Number',
  'اسم المستخدم': 'Username',
  'معلومات': 'Info',
  'أدخل اسم المستخدم': 'Enter username',
  'أدخل كلمة المرور': 'Enter password',
  'أدخل المعلومات المطلوبة': 'Enter required info',
  'إلغاء التمييز': 'Unfeature',
  'تمييز المنتج': 'Feature Product',
  'تعديل': 'Edit',
  'حذف': 'Delete',
  [`فشل تبديل حالة المنتج المميز — تأكد من أن الخادم يعمل`]: `Failed to toggle featured product — make sure the server is running`,
  [`ابحث في منتجات \${editServiceType}...`]: `Search in \${editServiceType} products...`,
  [`حذف المحدد (\${selectedIds.size})`]: `Delete Selected (\${selectedIds.size})`,

  // ─── Users Page ───
  'إجمالي المستخدمين': 'Total Users',
  'الزبائن النشطين': 'Active Customers',
  'المشرفين': 'Admins',
  'المحظورين': 'Blocked Users',
  'بحث عن مستخدم...': 'Search for a user...',
  'عرض التفاصيل': 'View Details',
  'تعديل الرصيد': 'Edit Balance',
  'إلغاء الحظر': 'Unblock',
  'حظر المستخدم': 'Block User',
  'تحديث': 'Refresh',
  'زبون': 'Customer',
  'مدير': 'Admin',
  'مشرف': 'Moderator',
  'المستخدم': 'User',
  'الدور': 'Role',
  'الرصيد': 'Balance',
  'الإنفاق': 'Spending',
  'تاريخ التسجيل': 'Registration Date',
  'لا توجد نتائج مطابقة للبحث': 'No results matching the search',
  'لا يوجد مستخدمين': 'No users',
  'مسح البحث': 'Clear Search',
  'الرصيد الحالي:': 'Current Balance:',
  'إضافة رصيد': 'Add Balance',
  'خصم رصيد': 'Deduct Balance',
  'المبلغ ($)': 'Amount ($)',
  'فشلت العملية': 'Operation failed',
  'جارٍ التنفيذ...': 'Processing...',
  'تأكيد الحظر': 'Confirm Block',
  'حظر': 'Block',

  // ─── User Details Page ───
  'رجوع للمستخدمين': 'Back to Users',
  'رجوع': 'Back',
  'المستخدم غير موجود': 'User not found',
  'التحقق من الهوية': 'Identity Verification',
  'إجمالي الطلبات': 'Total Orders',
  'مكتملة': 'Completed',
  'إجمالي الإنفاق': 'Total Spending',
  'الكمية': 'Quantity',
  'الإجمالي': 'Total',
  'طريقة الدفع': 'Payment Method',
  'لا توجد طلبات لهذا العميل': 'No orders for this customer',
  'لا توجد عمليات دفع': 'No payments',
  'إيداع': 'Deposit',
  'شراء': 'Purchase',
  'استرجاع': 'Refund',
  'اشتراك': 'Subscription',
  'رقم الهاتف': 'Phone Number',
  'لم يتم إضافة رقم هاتف': 'No phone number added',
  'تم التحقق من وثيقة الهوية': 'Identity document verified',
  'لم يتم تقديم وثيقة هوية بعد': 'No identity document submitted yet',
  'عمر الحساب': 'Account Age',
  'آخر تسجيل دخول': 'Last Login',
  'لم يسجل دخول بعد': 'Has not logged in yet',
  'حالة الحساب': 'Account Status',
  'هذا الحساب محظور حالياً': 'This account is currently blocked',
  'الحساب نشط بدون قيود': 'Account is active with no restrictions',
  'معلومات المشرف': 'Moderator Info',
  'الصلاحية': 'Permission',
  'مدير النظام - صلاحيات كاملة': 'System Admin — Full permissions',
  'مشرف - صلاحيات محدودة': 'Moderator — Limited permissions',
  'تاريخ الإنشاء': 'Creation Date',
  [`\${orders.length} طلب`]: `\${orders.length} order(s)`,
  [`\${payments.length} عملية`]: `\${payments.length} transaction(s)`,
  [`تاريخ الإنشاء: \${user.created_at}`]: `Created: \${user.created_at}`,
  [`انضم \${user.joined}`]: `Joined \${user.joined}`,

  // ─── Payments / Payment Gateways Page ───
  'بوابات الدفع': 'Payment Gateways',
  'لا يوجد مفعّلة': 'None active',
  'اختر وفعّل بوابات الدفع التي تريد تقديمها لعملائك': 'Choose and activate payment gateways to offer your customers',
  'بطاقات ائتمان و PayPal': 'Credit cards and PayPal',
  'دفع عبر العملات الرقمية': 'Pay via cryptocurrencies',
  'تيثر على شبكة Tron/ERC20/BEP20': 'USDT on Tron/ERC20/BEP20 network',
  'تحويل بنكي مباشر': 'Direct bank transfer',
  'شحن عبر محافظ إلكترونية (تعليمات فقط)': 'Top-up via e-wallets (instructions only)',
  'دفع عبر بنكك — تحويل محلي بسعر الصرف': 'Pay via your bank — local transfer at exchange rate',
  'التحويل البنكي': 'Bank Transfer',
  'محفظة إلكترونية': 'E-Wallet',
  'بنكك': 'Your Bank',
  'بريد PayPal': 'PayPal Email',
  'الوضع': 'Mode',
  'Sandbox (تجريبي)': 'Sandbox (Test)',
  'Live (حقيقي)': 'Live (Production)',
  'مفتاح الـ API': 'API Key',
  'السر': 'Secret',
  'رقم حساب Binance': 'Binance Account Number',
  'البريد (اختياري)': 'Email (optional)',
  'عنوان المحفظة': 'Wallet Address',
  'الشبكة': 'Network',
  'مفتاح API (اختياري)': 'API Key (optional)',
  'اسم البنك': 'Bank Name',
  'اسم صاحب الحساب': 'Account Holder Name',
  'IBAN / رقم الحساب': 'IBAN / Account Number',
  'عملة الحساب': 'Account Currency',
  'تعليمات الشحن': 'Top-up Instructions',
  'أرقام التواصل للشحن': 'Contact Numbers for Top-up',
  'رابط صورة/لوغو المحفظة': 'Wallet Image/Logo URL',
  'رقم الحساب': 'Account Number',
  'الاسم الكامل (صاحب الحساب)': 'Full Name (Account Holder)',
  'سعر الصرف (1 دولار = ؟ جنيه سوداني)': 'Exchange Rate (1 USD = ? SDG)',
  'رمز العملة المحلية': 'Local Currency Code',
  'رابط صورة/لوغو بنكك': 'Your Bank Image/Logo URL',
  // ─── CONFIG_FIELDS — Placeholders ───
  'مفتاح BscScan / Etherscan / TronGrid': 'BscScan / Etherscan / TronGrid Key',
  'مثال: البنك المركزي': 'Example: Central Bank',
  'الاسم الكامل': 'Full Name',
  'اكتب تعليمات الشحن عبر هذه المحفظة...': 'Write top-up instructions for this wallet...',
  'أدخل رقم الحساب البنكي': 'Enter bank account number',
  'مثال: أحمد محمد علي': 'Example: John Doe',
  'مثال: 600': 'Example: 600',
  'مثال: 07701234567': 'Example: 07701234567',
  // ─── CONFIG_FIELDS — Option Labels ───
  'IQD (د.ع)': 'IQD',
  'SAR (ر.س)': 'SAR',
  'SDG (ج.س)': 'SDG',
  'غير مُهيأة': 'Not Configured',
  'افتراضي': 'Default',
  'إعداد البوابة': 'Set Up Gateway',
  'البريد': 'Email',
  'المحفظة': 'Wallet',
  'البنك': 'Bank',
  'التعليمات': 'Instructions',
  'التواصل': 'Contact',
  'صاحب الحساب': 'Account Holder',
  'سعر الصرف': 'Exchange Rate',
  'لم يتم إدخال بيانات بعد': 'No data entered yet',
  'اسم البوابة': 'Gateway Name',
  'بوابة افتراضية': 'Default Gateway',
  'ستكون الأولى في قائمة الدفع': 'Will be first in the payment list',
  'حفظ التعديلات': 'Save Changes',
  'إضافة البوابة': 'Add Gateway',
  'فشل في جلب بوابات الدفع': 'Failed to fetch payment gateways',
  'تم تحديث البوابة بنجاح': 'Gateway updated successfully',
  'تم إضافة البوابة بنجاح': 'Gateway added successfully',
  'فشل في حفظ البوابة': 'Failed to save gateway',
  'فشل في تبديل الحالة': 'Failed to toggle status',
  'تم حذف البوابة': 'Gateway deleted',
  'فشل في حذف البوابة': 'Failed to delete gateway',
  'اسم البوابة مطلوب': 'Gateway name is required',
  'حذف بوابة الدفع؟': 'Delete payment gateway?',
  'هذا الإجراء لا يمكن التراجع عنه': 'This action cannot be undone',
  'نعم، احذف': 'Yes, Delete',
  'سجل عمليات الدفع': 'Payment Transaction Log',
  'جميع عمليات الشحن والدفع — يمكنك الموافقة على المعلقة': 'All top-ups and payments — you can approve pending ones',
  'معلّقة': 'Pending',
  'مرفوضة': 'Rejected',
  'مستردة': 'Refunded',
  'ملغاة': 'Cancelled',
  'الإجراء': 'Action',
  'شحن رصيد': 'Balance Top-up',
  'استرداد': 'Refund',
  'إيصال': 'Receipt',
  'موافقة': 'Approve',
  'رفض': 'Reject',
  'فشل في الموافقة على الدفعة': 'Failed to approve payment',
  'تم رفض الدفعة': 'Payment rejected',
  'فشل في رفض الدفعة': 'Failed to reject payment',
  '← السابق': '← Previous',
  'التالي →': 'Next →',
  'إيصال الدفع': 'Payment Receipt',
  'تاريخ الرفع': 'Upload Date',
  'ملاحظات العميل:': 'Customer Notes:',
  'موافقة وإضافة الرصيد': 'Approve & Add Balance',
  'البوابة': 'Gateway',
  [`\${activeCount} مفعّلة`]: `\${activeCount} active`,
  [`حقول ناقصة: \${missing}`]: `Missing fields: \${missing}`,
  [`أكمل الحقول المطلوبة أولاً: \${missing}`]: `Complete required fields first: \${missing}`,
  [`تعديل \${name}`]: `Edit \${name}`,
  [`إعداد \${name}`]: `Set Up \${name}`,
  [`إعدادات \${name}`]: `\${name} Settings`,
  [`تمت الموافقة على الدفعة #\${id} وتم إضافة الرصيد`]: `Payment #\${id} approved and balance added`,
  [`عميل #\${id}`]: `Customer #\${id}`,
  [`لا توجد عمليات دفع \${txFilter !== 'all' ? 'بهذا التصنيف' : 'بعد'}`]: `No payments \${txFilter !== 'all' ? 'in this category' : 'yet'}`,
  'بهذا التصنيف': 'in this category',
  'بعد': 'yet',

  // ─── External Sources Page ───
  'المصادر الخارجية': 'External Sources',
  'إدارة مصادر API الخارجية ومزامنة الخدمات': 'Manage external API sources and sync services',
  'ربط مصدر جديد': 'Connect New Source',
  'المصادر المتاحة': 'Available Sources',
  'المصادر المتصلة': 'Connected Sources',
  'سجل المزامنة': 'Sync Log',
  'مصادر متصلة': 'Connected Sources',
  'خدمات مستوردة': 'Imported Services',
  'آخر مزامنة': 'Last Sync',
  'الحقول المطلوبة:': 'Required Fields:',
  'ربط الآن': 'Connect Now',
  'لا توجد مصادر متصلة بعد': 'No connected sources yet',
  'اربط مصدر من تبويب "المصادر المتاحة" لبدء جلب الخدمات تلقائياً': 'Connect a source from the "Available Sources" tab to start importing services automatically',
  'اختبار': 'Test',
  'مزامنة': 'Sync',
  'الخدمات': 'Services',
  'الربح': 'Profit',
  'تطبيق الربح': 'Apply Profit',
  'نسبة': 'Percentage',
  'مبلغ': 'Amount',
  'تطبيق': 'Apply',
  'خطأ اتصال': 'Connection Error',
  'نتيجة الاختبار': 'Test Result',
  'نتيجة المزامنة': 'Sync Result',
  'سجل العمليات:': 'Operations Log:',
  'خدمات مستوردة:': 'Imported Services:',
  'سجل المزامنة الأخيرة': 'Latest Sync Log',
  'لا توجد عمليات مزامنة بعد': 'No sync operations yet',
  'ستظهر هنا سجلات المزامنة عند تنفيذ أي عملية مزامنة من تبويب المصادر المتصلة': 'Sync logs will appear here when any sync operation is performed from the Connected Sources tab',
  'حذف المصدر': 'Delete Source',
  'سيتم حذف جميع الخدمات المرتبطة به نهائياً.': 'All associated services will be permanently deleted.',
  'تم حذف المصدر بنجاح': 'Source deleted successfully',
  'فشل حذف المصدر': 'Failed to delete source',
  'تم التبديل لوضع المزامنة فقط': 'Switched to sync-only mode',
  'تم تفعيل التثبيت في المتجر': 'Store listing activated',
  'فشل تبديل وضع المزامنة': 'Failed to toggle sync mode',
  'تعديل المصدر': 'Edit Source',
  'اسم المصدر': 'Source Name',
  'النوع:': 'Type:',
  'الرابط:': 'URL:',
  'فشل التحديث': 'Update failed',
  'حفظ التغييرات': 'Save Changes',
  'مزامنة فقط': 'Sync Only',
  'مزامنة وتثبيت': 'Sync & List',
  'المنتجات مُزامَنة لكن لا تظهر للزبائن': 'Products are synced but not visible to customers',
  'المنتجات مُزامَنة وتظهر في المتجر': 'Products are synced and visible in the store',
  'متصل': 'Connected',
  'غير متصل': 'Disconnected',
  'غير محدد': 'Unknown',
  'مصدر': 'Source',
  'مزامنة الخدمات': 'Sync Services',
  'القيمة غير صالحة': 'Invalid value',
  'تم تطبيق الربح بنجاح': 'Profit applied successfully',
  'فشل تطبيق الربح': 'Failed to apply profit',
  'فشل المزامنة': 'Sync failed',
  'الاتصال ناجح': 'Connection successful',
  'فشل الاتصال': 'Connection failed',
  'فشل اختبار الاتصال': 'Connection test failed',
  [`فشل جلب المصادر من الخادم`]: 'Failed to fetch sources from server',

  // ─── Connect Source Modal ───
  'رابط الـ API': 'API URL',
  'نوع الربح': 'Profit Type',
  'نسبة مئوية': 'Percentage',
  'مبلغ ثابت': 'Fixed Amount',
  'تُضاف كنسبة مئوية فوق سعر التكلفة.': 'Added as a percentage on top of cost price.',
  'يُضاف كمبلغ ثابت ($) فوق سعر التكلفة.': 'Added as a fixed amount ($) on top of cost price.',
  'سيتم اختبار الاتصال عبر فحص الرصيد ثم جلب جميع الخدمات المتاحة من IMEI Check.': 'Connection will be tested by checking the balance then fetching all available services from IMEI Check.',
  'سيتم اختبار الاتصال تلقائياً ثم جلب جميع الخدمات المتاحة من المصدر.': 'Connection will be tested automatically then all available services from the source will be fetched.',
  'اختبار وربط المصدر': 'Test & Connect Source',
  'جاري اختبار الاتصال...': 'Testing connection...',
  'يتم التحقق من بيانات الدخول وجلب الخدمات': 'Verifying credentials and fetching services',
  'تم الربط بنجاح!': 'Connected successfully!',
  'فشل الاتصال بالمصدر': 'Failed to connect to source',
  'تعديل البيانات': 'Edit Data',
  'أدخل رابط الموقع فقط — سيتم اكتشاف مسار API تلقائياً': 'Enter the site URL only — API path will be auto-discovered',
  'أدخل مفتاح API من لوحة تحكم IMEI Check': 'Enter the API key from IMEI Check dashboard',
  'أدخل مفتاح الوصول': 'Enter the access key',
  'اسم المستخدم في النظام': 'Username in the system',
  [`ربط \${source.name}`]: `Connect \${source.name}`,
  [`تم الاتصال بـ \${sourceName} وجلب الخدمات المتاحة.`]: `Connected to \${sourceName} and fetched available services.`,
  [`تم مزامنة \${count} خدمة بنجاح`]: `Successfully synced \${count} service(s)`,
  [`تم مزامنة \${count} خدمة`]: `Synced \${count} service(s)`,
  [`\${count} خدمة`]: `\${count} service(s)`,
  [`تم تطبيق نسبة \${val}% على \${productsCount} منتج`]: `Applied \${val}% profit on \${productsCount} product(s)`,
  [`تم تطبيق مبلغ $\${val} على \${productsCount} منتج`]: `Applied $\${val} profit on \${productsCount} product(s)`,
  [`الاتصال ناجح — تم اكتشاف: \${resolvedUrl}`]: `Connection successful — discovered: \${resolvedUrl}`,

  // ─── Source Descriptions ───
  'اتصل بأي نظام DHRU FUSION لجلب خدمات فك القفل والـ IMEI تلقائياً. يدعم SD-Unlocker وغيرها.': 'Connect to any DHRU FUSION system to automatically fetch unlock and IMEI services. Supports SD-Unlocker and others.',
  'اتصل بمنصة IMEI Checker لفحص أجهزة Apple والتحقق من حالة IMEI/SN فورياً. نتائج لحظية مع دعم كامل لجميع خدمات الفحص.': 'Connect to IMEI Checker platform to check Apple devices and verify IMEI/SN status instantly. Real-time results with full support for all check services.',

  // ─── Customize Page ───
  '🎨 تخصيص المتجر': '🎨 Customize Store',
  'إعادة تعيين': 'Reset',
  'تم الحفظ': 'Saved',
  'فشل حفظ التخصيصات! تأكد من اتصالك بالسيرفر.': 'Failed to save customizations! Check your server connection.',
  'هل أنت متأكد من إعادة التخصيص للقيم الافتراضية؟ لا يمكن التراجع.': 'Are you sure you want to reset to defaults? This cannot be undone.',
  'فشل إعادة التعيين!': 'Reset failed!',
  'نوع الملف غير مدعوم. استخدم PNG, JPG, WebP أو SVG': 'File type not supported. Use PNG, JPG, WebP, or SVG',
  'الشعار والهوية': 'Logo & Identity',
  'شعار المتجر': 'Store Logo',
  'رفع شعار': 'Upload Logo',
  'اسم المتجر': 'Store Name',
  'لغة المتجر': 'Store Language',
  'العربية 🇸🇦': 'Arabic 🇸🇦',
  'الخط': 'Font',
  'ألوان الموقع': 'Site Colors',
  'تخطيط الصفحة': 'Page Layout',
  'نمط الهيدر': 'Header Style',
  'كلاسيكي': 'Classic',
  'وسطي': 'Centered',
  'بسيط': 'Minimal',
  'انحناء الأزرار': 'Button Radius',
  'صغير (8px)': 'Small (8px)',
  'متوسط (14px)': 'Medium (14px)',
  'كبير (20px)': 'Large (20px)',
  'الوضع الداكن': 'Dark Mode',
  'إظهار البانر': 'Show Banner',
  'روابط التواصل الاجتماعي': 'Social Media Links',
  'أضف روابط حساباتك لتظهر في أسفل المتجر': 'Add your account links to show at the bottom of the store',
  'واتساب': 'WhatsApp',
  'تليجرام': 'Telegram',
  'فيسبوك': 'Facebook',
  'انستقرام': 'Instagram',
  'X (تويتر)': 'X (Twitter)',
  'النص السفلي و CSS مخصص': 'Footer Text & Custom CSS',
  'نص أسفل الصفحة (Footer)': 'Footer Text',
  'يظهر نص مخصص بدل حقوق النشر الافتراضية': 'Displays custom text instead of default copyright',
  'CSS مخصص': 'Custom CSS',
  'أضف CSS مخصص — يُطبق فورياً على المتجر بالكامل': 'Add custom CSS — applied instantly to the entire store',
  'معاينة مباشرة': 'Live Preview',
  'منتج': 'Product',
  'العربية (RTL)': 'Arabic (RTL)',
  '🌙 داكن': '🌙 Dark',
  '☀️ فاتح': '☀️ Light',

  // ─── Customize — Color Theme Names ───
  'بنفسجي كلاسيكي': 'Classic Purple',
  'أزرق محيطي': 'Ocean Blue',
  'أخضر زمردي': 'Emerald Green',
  'وردي أنيق': 'Elegant Rose',
  'ذهبي فاخر': 'Luxury Gold',
  'رمادي عصري': 'Modern Gray',

  // ─── Customize — Font Options ───
  'تجوال': 'Tajawal',
  'خط عربي حديث وأنيق': 'Modern and elegant Arabic font',
  'القاهرة': 'Cairo',
  'خط عربي كلاسيكي': 'Classic Arabic font',
  'IBM عربي': 'IBM Arabic',
  'خط تقني احترافي': 'Professional technical font',
  'نوتو': 'Noto',
  'خط عالمي متوافق': 'Universally compatible font',

  // ─── Customize — Preview ───
  'اكتشف أفضل الخدمات': 'Discover the best services',
  [`مرحباً بك في \${storeName} 🎉`]: `Welcome to \${storeName} 🎉`,

  // ─── Announcements Page ───
  '📢 الإعلانات': '📢 Announcements',
  'إعلان جديد': 'New Announcement',
  'عنوان الإعلان': 'Announcement Title',
  'محتوى الإعلان...': 'Announcement content...',
  'جاري النشر...': 'Publishing...',
  'نشر': 'Publish',
  'متوقف': 'Paused',

  // ─── Blog Admin Page ───
  '📝 المدونة': '📝 Blog',
  'مقال': 'Article',
  'مقال جديد': 'New Article',
  '✏️ تعديل المقال': '✏️ Edit Article',
  '➕ مقال جديد': '➕ New Article',
  'العنوان (عربي) *': 'Title (Arabic) *',
  'عنوان المقال بالعربي': 'Article title in Arabic',
  'العنوان (إنجليزي)': 'Title (English)',
  'الملخص (عربي)': 'Excerpt (Arabic)',
  'ملخص قصير للمقال': 'Short article excerpt',
  'الملخص (إنجليزي)': 'Excerpt (English)',
  'التصنيف': 'Category',
  'وقت القراءة (دقائق)': 'Read Time (minutes)',
  'لون التصنيف': 'Category Color',
  'أيقونة المقال': 'Article Icon',
  'المحتوى (كل سطر = فقرة)': 'Content (each line = paragraph)',
  'نشر المقال فوراً': 'Publish article immediately',
  'نشر المقال': 'Publish Article',
  'لا توجد مقالات بعد': 'No articles yet',
  'اضغط "مقال جديد" لإضافة أول مقال في المدونة': 'Click "New Article" to add the first blog post',
  'مسودة': 'Draft',
  'بدون تصنيف': 'Uncategorized',
  'إلغاء النشر': 'Unpublish',
  'هل تريد حذف هذا المقال؟': 'Do you want to delete this article?',
  'د': 'min',

  // ─── Blog — Color Labels ───
  'أزرق': 'Blue',
  'بنفسجي': 'Purple',
  'أحمر': 'Red',
  'أخضر': 'Green',
  'برتقالي': 'Orange',
  'نيلي': 'Indigo',
  'وردي': 'Pink',

  // ─── Chat Admin Page ───
  '💬 الدردشة المباشرة': '💬 Live Chat',
  'لا توجد محادثات': 'No conversations',
  'ستظهر هنا عندما يبدأ زبون محادثة': 'Will appear here when a customer starts a conversation',
  'زائر': 'Visitor',
  'بدون رسائل': 'No messages',
  'مغلق': 'Closed',
  'إغلاق': 'Close',
  'لا توجد رسائل بعد': 'No messages yet',
  'أنت': 'You',
  'الزبون': 'Customer',
  'اكتب ردك...': 'Type your reply...',
  '🔒 هذه المحادثة مغلقة': '🔒 This conversation is closed',
  'اختر محادثة للبدء': 'Select a conversation to start',
  'اضغط على أي محادثة من القائمة': 'Click any conversation from the list',
  [`المحادثات (\${count})`]: `Conversations (\${count})`,

  // ─── Flash Popup Page ───
  '⚡ فلاش الإعلان': '⚡ Flash Ad',
  'معاينة': 'Preview',
  'حفظ...': 'Saving...',
  'تم الحفظ ✓': 'Saved ✓',
  'تفعيل الفلاش': 'Enable Flash',
  'يظهر للزائر عند فتح الموقع مرة واحدة': 'Shown to the visitor once when opening the website',
  'العنوان': 'Title',
  'عنوان الإعلان...': 'Ad title...',
  'المحتوى': 'Content',
  'نص الإعلان... (يدعم أسطر متعددة)': 'Ad text... (supports multiple lines)',
  'صورة / GIF (اختياري)': 'Image / GIF (optional)',
  'رابط صورة أو GIF...': 'Image or GIF URL...',
  '📁 رفع صورة': '📁 Upload Image',
  'حجم الصورة يجب أن يكون أقل من 5MB': 'Image size must be less than 5MB',
  'لون الخلفية': 'Background Color',
  'لون النص': 'Text Color',
  'ألوان سريعة': 'Quick Colors',
  'داكن': 'Dark',
  'أبيض': 'White',
  'تدرج': 'Gradient',
  'نص الزر': 'Button Text',
  'حسناً': 'OK',
  'رابط الزر (اختياري)': 'Button Link (optional)',
  'تصميم الخط': 'Font Design',
  'عادي': 'Normal',
  'مخطط': 'Outlined',
  'ظل': 'Shadow',
  'نيون': 'Neon',
  'مائل': 'Italic',

  // ─── Settings Admin Page ───
  '⚙️ الإعدادات': '⚙️ Settings',
  'حفظ الإعدادات': 'Save Settings',
  '✅ تم حفظ الإعدادات بنجاح': '✅ Settings saved successfully',
  'حدث خطأ أثناء الحفظ': 'An error occurred while saving',
  '✓ تم الحفظ': '✓ Saved',
  'البريد الإلكتروني غير مُعدّ': 'Email is not configured',
  'لن يتم إرسال أي رسائل بريدية (تأكيد الطلبات، كود التحقق، إشعارات الدفع) حتى تقوم بإعداد SMTP.\nيمكنك استخدام خدمات مثل Gmail SMTP أو Mailgun أو أي مزود بريد إلكتروني.': 'No emails will be sent (order confirmations, verification codes, payment notifications) until you set up SMTP.\nYou can use services like Gmail SMTP, Mailgun, or any email provider.',
  'إعدادات البريد الإلكتروني (SMTP)': 'Email Settings (SMTP)',
  'لإرسال رسائل التأكيد والإشعارات للزبائن': 'For sending confirmation and notification emails to customers',
  '✓ مُعدّ': '✓ Configured',
  '✗ غير مُعدّ': '✗ Not Configured',
  'سيرفر SMTP (Host)': 'SMTP Server (Host)',
  'المنفذ (Port)': 'Port',
  'البريد المرسل (From)': 'Sender Email (From)',
  'إعدادات العملة': 'Currency Settings',
  'العملة الأساسية هي الدولار (USD). يمكنك إضافة عملة ثانوية للعرض': 'Primary currency is USD. You can add a secondary display currency',
  'العملة الثانوية': 'Secondary Currency',
  'بدون عملة ثانوية': 'No secondary currency',
  'ريال سعودي (SAR)': 'Saudi Riyal (SAR)',
  'درهم إماراتي (AED)': 'UAE Dirham (AED)',
  'جنيه مصري (EGP)': 'Egyptian Pound (EGP)',
  'دينار كويتي (KWD)': 'Kuwaiti Dinar (KWD)',
  'ريال قطري (QAR)': 'Qatari Riyal (QAR)',
  'دينار بحريني (BHD)': 'Bahraini Dinar (BHD)',
  'ريال عماني (OMR)': 'Omani Riyal (OMR)',
  'دينار أردني (JOD)': 'Jordanian Dinar (JOD)',
  'دينار عراقي (IQD)': 'Iraqi Dinar (IQD)',
  'ليرة تركية (TRY)': 'Turkish Lira (TRY)',
  'يورو (EUR)': 'Euro (EUR)',
  'جنيه إسترليني (GBP)': 'British Pound (GBP)',
  'سعر تحويل الدولار': 'Dollar Conversion Rate',
  'إعدادات اللغة': 'Language Settings',
  'لغة واجهة المتجر للزبائن': 'Store interface language for customers',
  'واجهة عربية (RTL)': 'Arabic Interface (RTL)',
  'الواجهة الافتراضية': 'Default Interface',
  'واجهة إنجليزية (LTR)': 'English Interface (LTR)',
  'بيانات التواصل والدعم': 'Contact & Support Info',
  'تظهر في صفحة الدعم للزبائن': 'Shown on the support page for customers',
  'بريد الدعم (Email)': 'Support Email',
  'رقم واتساب / اتصال': 'WhatsApp / Phone Number',
  'اكتب الرقم بالصيغة الدولية لربطه بالواتساب': 'Enter the number in international format to link to WhatsApp',
  'إعدادات الأمان': 'Security Settings',
  'إعدادات حماية حسابات الزبائن': 'Customer account protection settings',
  'تفعيل كود التحقق (OTP)': 'Enable Verification Code (OTP)',
  'عند التفعيل، يُطلب من الزبائن إدخال كود تحقق يُرسل عبر البريد الإلكتروني\nعند تسجيل الدخول من جهاز جديد أو بعد فترة انقطاع': 'When enabled, customers are required to enter a verification code sent via email\nwhen logging in from a new device or after a period of inactivity',
  'يجب إعداد البريد الإلكتروني (SMTP) أولاً لتفعيل كود التحقق': 'Email (SMTP) must be set up first to enable verification codes',
  'رابط لوحة التحكم': 'Dashboard Link',
  'رابط فريد للوصول إلى لوحة التحكم — لا تشاركه مع أحد': 'Unique link to access the dashboard — do not share with anyone',
  'تم النسخ': 'Copied',
  'نسخ': 'Copy',
  'هذا الرابط هو الطريقة الوحيدة للوصول إلى لوحة التحكم. الدخول من /admin مباشرة لن يعمل.': 'This link is the only way to access the dashboard. Going to /admin directly will not work.',

  // ─── Shared / Common ───
  [`من \${total}`]: `of \${total}`,
  [`\${current} من \${total}`]: `\${current} of \${total}`,
  [`تم إضافة/خصم $\${amount} بنجاح. الرصيد الجديد: $\${balance}`]: `Successfully added/deducted $\${amount}. New balance: $\${balance}`,
  [`إضافة $\${amount}`]: `Add $\${amount}`,
  [`خصم $\${amount}`]: `Deduct $\${amount}`,
  [`هل أنت متأكد من استرجاع $\${amount} للعميل \${name}؟`]: `Are you sure you want to refund $\${amount} to customer \${name}?`,
  [`حجم الملف \${size}MB — الحد الأقصى 2MB`]: `File size \${size}MB — maximum 2MB`,
  [`مثال: جميع الحقوق محفوظة © 2025 — اسم متجرك`]: `Example: All rights reserved © 2025 — Your Store Name`,
  [`مثال: iCloud, فتح شبكات, أدوات سوفتوير`]: `Example: iCloud, Network Unlocks, Software Tools`,
  [`اكتب محتوى المقال هنا...\nكل سطر يُعتبر فقرة منفصلة.\nيمكنك استخدام إيموجي مثل 🔹 أو ✅ في بداية السطر.`]: `Write article content here...\nEach line is a separate paragraph.\nYou can use emojis like 🔹 or ✅ at the beginning of a line.`,

  // ─── Additional Missing Keys ───
  'English أولاً': 'English first',
  'PNG, JPG, WebP, SVG — حد أقصى 2MB': 'PNG, JPG, WebP, SVG — max 2MB',
  '؟': '?',
  'الرصيد:': 'Balance:',
  'الطريقة': 'Method',
  'العنوان (عربي)': 'Title (Arabic)',
  'المتجر نشط': 'Store Active',
  'المحادثات': 'Conversations',
  'انضم': 'Joined',
  'تخصيص المتجر': 'Customize Store',
  'تم حفظ الإعدادات بنجاح': 'Settings saved successfully',
  'جارٍ...': 'Processing...',
  'ربط': 'Connect',
  'طلب': 'Order',
  'عملية': 'Transaction',
  'عند التفعيل، يُطلب من الزبائن إدخال كود تحقق يُرسل عبر البريد الإلكتروني': 'When enabled, customers are required to enter a verification code sent via email',
  'عند تسجيل الدخول من جهاز جديد أو بعد فترة انقطاع': 'When logging in from a new device or after a period of inactivity',
  'فلاش الإعلان': 'Flash Ad',
  'لن يتم إرسال أي رسائل بريدية (تأكيد الطلبات، كود التحقق، إشعارات الدفع) حتى تقوم بإعداد SMTP.': 'No emails will be sent (order confirmations, verification codes, payment notifications) until you set up SMTP.',
  'يمكنك استخدام خدمات مثل Gmail SMTP أو Mailgun أو أي مزود بريد إلكتروني.': 'You can use services like Gmail SMTP, Mailgun, or any email provider.',
  'مثال: 356938035643809': 'Example: 356938035643809',
  'مثل: iCloud, فتح شبكات, أدوات سوفتوير': 'e.g. iCloud, Network Unlocks, Software Tools',
  'من': 'of',
  'هل أنت متأكد من حذف': 'Are you sure you want to delete',
  'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.': 'Are you sure you want to delete this product? This cannot be undone.',
  '⏳ جاري الحفظ...': '⏳ Saving...',
  '● تجريبي': '● Sandbox',
  '● حقيقي': '● Live',
  '✓ موافقة': '✓ Approve',
  '✓ موافقة وإضافة الرصيد': '✓ Approve & Add Balance',
  '✗ رفض': '✗ Reject',
  '✦ نفسه': '✦ Same',
  '💾 إضافة البوابة': '💾 Add Gateway',
  '💾 حفظ التعديلات': '💾 Save Changes',
  '🧾 إيصال': '🧾 Receipt',
};

export default adminEn;
