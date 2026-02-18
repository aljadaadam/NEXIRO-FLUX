// ─── ترجمة — عربي / إنجليزي ───

export type Language = 'ar' | 'en';

const translations: Record<string, string> = {
  // ─── هيدر ───
  'الرئيسية': 'Home',
  'السيارات': 'Cars',
  'سيارات جديدة': 'New Cars',
  'سيارات مستعملة': 'Used Cars',
  'الفروع': 'Branches',
  'تواصل معنا': 'Contact Us',
  'لوحة التحكم': 'Dashboard',
  'تسجيل الدخول': 'Login',
  'تسجيل الخروج': 'Logout',

  // ─── هيرو ───
  'اعثر على سيارة أحلامك': 'Find Your Dream Car',
  'نقدم لك أفضل السيارات الجديدة والمستعملة بأسعار منافسة وضمان شامل': 'We offer the best new and used cars at competitive prices with comprehensive warranty',
  'تصفح السيارات': 'Browse Cars',
  'زيارة أقرب فرع': 'Visit Nearest Branch',
  'سيارة متاحة': 'Cars Available',
  'فرع': 'Branch',
  'عميل سعيد': 'Happy Customer',
  'سنة خبرة': 'Years Experience',

  // ─── فلاتر ───
  'بحث عن سيارة...': 'Search for a car...',
  'الكل': 'All',
  'جديد': 'New',
  'مستعمل': 'Used',
  'الماركة': 'Brand',
  'كل الماركات': 'All Brands',
  'الموديل': 'Model',
  'السنة': 'Year',
  'السعر': 'Price',
  'من': 'From',
  'إلى': 'To',
  'نوع الوقود': 'Fuel Type',
  'ناقل الحركة': 'Transmission',
  'بحث': 'Search',
  'إعادة ضبط': 'Reset',

  // ─── بطاقة السيارة ───
  'كم': 'km',
  'حصان': 'HP',
  'مقعد': 'Seats',
  'تفاصيل': 'Details',
  'احجز الآن': 'Book Now',
  'مميزة': 'Featured',
  'تم البيع': 'Sold',
  'جديدة': 'New',
  'مستعملة': 'Used',

  // ─── تفاصيل السيارة ───
  'المواصفات': 'Specifications',
  'اللون': 'Color',
  'المحرك': 'Engine',
  'القوة': 'Power',
  'المسافة المقطوعة': 'Mileage',
  'عدد المقاعد': 'Seats',
  'الوصف': 'Description',
  'طلب شراء': 'Purchase Request',
  'اتصل بنا': 'Call Us',
  'واتساب': 'WhatsApp',

  // ─── الفروع ───
  'فروعنا': 'Our Branches',
  'الفرع الرئيسي': 'Main Branch',
  'فرع': 'Branch',
  'ساعات العمل': 'Working Hours',
  'العنوان': 'Address',
  'الهاتف': 'Phone',
  'البريد الإلكتروني': 'Email',
  'عرض على الخريطة': 'View on Map',

  // ─── نموذج الحجز ───
  'الاسم الكامل': 'Full Name',
  'رقم الهاتف': 'Phone Number',
  'البريد': 'Email',
  'ملاحظات': 'Notes',
  'إرسال الطلب': 'Submit Request',
  'تم إرسال طلبك بنجاح': 'Your request has been sent successfully',
  'سنتواصل معك قريباً': 'We will contact you soon',

  // ─── فوتر ───
  'جميع الحقوق محفوظة': 'All Rights Reserved',
  'سياسة الخصوصية': 'Privacy Policy',
  'الشروط والأحكام': 'Terms & Conditions',

  // ─── لوحة التحكم ───
  'نظرة عامة': 'Overview',
  'إدارة السيارات': 'Manage Cars',
  'الطلبات': 'Orders',
  'العملاء': 'Customers',
  'إدارة الفروع': 'Manage Branches',
  'التخصيص': 'Customize',
  'الإعدادات': 'Settings',
  'إجمالي السيارات': 'Total Cars',
  'سيارات جديدة': 'New Cars',
  'سيارات مستعملة': 'Used Cars',
  'إجمالي الطلبات': 'Total Orders',
  'طلبات معلقة': 'Pending Orders',
  'إجمالي العملاء': 'Total Customers',
  'الإيرادات': 'Revenue',
  'إضافة سيارة': 'Add Car',
  'تعديل': 'Edit',
  'حذف': 'Delete',
  'حفظ': 'Save',
  'إلغاء': 'Cancel',
  'مؤكد': 'Confirmed',
  'مكتمل': 'Completed',
  'ملغي': 'Cancelled',
  'معلق': 'Pending',

  // ─── عام ───
  'لا توجد نتائج': 'No results found',
  'جاري التحميل...': 'Loading...',
  'خطأ في التحميل': 'Loading Error',
  'حاول مرة أخرى': 'Try Again',
};

export function translate(key: string, lang: Language): string {
  if (lang === 'ar') return key;
  return translations[key] || key;
}
