# Products Component - Refactored Structure

## Overview
تم تقسيم ملف `ProductEditorContent.jsx` إلى مكونات منفصلة لتسهيل الصيانة والتطوير.

## Structure / البنية

```
src/components/Products/
├── ProductEditorContent.jsx    (Main container - الملف الرئيسي)
├── tabs/                        (Tab components - مكونات الأعمدة)
│   ├── OverviewTab.jsx         (نظرة عامة)
│   ├── EditTab.jsx             (تعديل المنتج)
│   ├── ApiTab.jsx              (اتصال API)
│   ├── FieldsTab.jsx           (الحقول المخصصة)
│   └── StatusTab.jsx           (حالة المنتج)
├── hooks/                       (Custom hooks)
│   └── useSourceServices.js    (Hook لتحميل الخدمات)
└── utils/                       (Utility functions - دوال مساعدة)
    └── fieldUtils.js           (دوال الحقول المخصصة)
```

## Files Description / وصف الملفات

### Main Container
- **ProductEditorContent.jsx**: الملف الرئيسي الذي يربط جميع المكونات ويوزع المهام حسب العمود المختار

### Tabs Components / مكونات الأعمدة

#### 1. OverviewTab.jsx
- **Purpose**: عرض نظرة عامة عن المنتج
- **Features**: 
  - عرض المجموعة (Group)
  - عرض المصدر (Source)
  - عرض الخدمة المرتبطة (Linked Service)
  - عدد الحقول المخصصة (Custom Fields Count)

#### 2. EditTab.jsx
- **Purpose**: تعديل بيانات المنتج الأساسية
- **Features**:
  - تعديل اسم الخدمة (Service Name)
  - تعديل السعر (Price/CREDIT)
  - تعديل الوقت (Time)
  - تعديل المعلومات (Info)
  - تفعيل/تعطيل المنتج (Enable/Disable)

#### 3. ApiTab.jsx
- **Purpose**: ربط المنتج بمصدر خارجي (API Connection)
- **Features**:
  - اختيار المصدر (Source Selection)
  - اختيار الخدمة من المصدر (Service Selection)
  - عرض معلومات المصدر الحالي من السيرفر
  - بحث في الخدمات المتاحة
  - عرض عدد الخدمات المحملة
  - خيار "None" لإلغاء الربط
- **Components**: يحتوي على `ServiceDropdown` كمكون فرعي

#### 4. FieldsTab.jsx
- **Purpose**: عرض الحقول المخصصة للمنتج (عرض فقط)
- **Features**:
  - عرض جميع الحقول المخصصة
  - عرض نوع الحقل (Field Type)
  - عرض ما إذا كان الحقل إلزامي (Required)
  - عرض وصف الحقل (Description)
  - عرض الخيارات المتاحة (Options)

#### 5. StatusTab.jsx
- **Purpose**: عرض وتغيير حالة المنتج
- **Features**:
  - عرض الحالة الحالية (Active/Inactive)
  - زر تفعيل/تعطيل المنتج

### Custom Hooks / Hooks مخصصة

#### useSourceServices.js
- **Purpose**: Hook لإدارة تحميل وفلترة خدمات المصدر
- **Returns**:
  - `sourceServices`: قائمة الخدمات المحملة
  - `loadingServices`: حالة التحميل
  - `filteredServices`: الخدمات بعد الفلترة
- **Features**:
  - تحميل الخدمات تلقائياً عند تغيير المصدر
  - فلترة الخدمات حسب البحث
  - Console logs للتتبع والتطوير
  - Cleanup عند unmount

### Utility Functions / دوال مساعدة

#### fieldUtils.js
- **Functions**:
  - `normalizeRequired(value)`: تحويل قيمة الحقل الإلزامي إلى boolean
  - `getFieldLabel(field, dir)`: الحصول على اسم الحقل
  - `getCustomFields(product)`: استخراج الحقول المخصصة من المنتج

## Benefits / الفوائد

### 1. Separation of Concerns / فصل المسؤوليات
- كل عمود (tab) له ملف منفصل
- سهولة في العثور على الكود المطلوب
- تقليل التعقيد في الملف الواحد

### 2. Reusability / إعادة الاستخدام
- يمكن استخدام الـ hooks في أي مكان
- دوال مساعدة قابلة لإعادة الاستخدام
- مكونات مستقلة يمكن استخدامها منفصلة

### 3. Maintainability / سهولة الصيانة
- تحديثات أسهل على كل جزء
- أقل احتمالية لحدوث تعارضات في Git
- سهولة إضافة features جديدة

### 4. Testing / الاختبار
- يمكن اختبار كل مكون بشكل منفصل
- Hooks قابلة للاختبار بشكل مستقل

### 5. Performance / الأداء
- يمكن إضافة lazy loading للـ tabs لاحقاً
- تحسين في re-rendering

## Usage Example / مثال على الاستخدام

```jsx
// In ProductsPage.jsx
import ProductEditorContent from '../components/Products/ProductEditorContent';

<ProductEditorContent
  theme={theme}
  dir={dir}
  product={selectedProduct}
  selectedOption="api"  // overview, edit, api, fields, status, image
  editValues={editValues}
  onEditChange={handleEditChange}
  onSave={handleSave}
  onToggleStatus={handleToggleStatus}
  selectedGroup={selectedGroup}
  sources={sources}
/>
```

## Future Improvements / تحسينات مستقبلية

1. **Lazy Loading**: تحميل الـ tabs عند الحاجة فقط
2. **Error Boundaries**: إضافة error boundaries لكل tab
3. **Unit Tests**: كتابة اختبارات لكل مكون
4. **TypeScript**: تحويل الملفات إلى TypeScript لتحسين Type Safety
5. **Storybook**: إضافة stories لكل component
6. **Custom Hooks**: إضافة hooks إضافية حسب الحاجة

## Notes / ملاحظات

- جميع الـ console.logs موجودة للتطوير ويمكن إزالتها في الإنتاج
- الـ servicesSearchTerm تم نقله إلى داخل ServiceDropdown في ApiTab
- يمكن إضافة المزيد من الـ utility functions حسب الحاجة
- البنية الحالية تدعم إضافة tabs جديدة بسهولة

## Change Log / سجل التغييرات

### Version 1.0.0 (Current)
- ✅ تقسيم ProductEditorContent.jsx إلى 5 tabs منفصلة
- ✅ إنشاء useSourceServices custom hook
- ✅ إنشاء fieldUtils utility functions
- ✅ إضافة documentation كاملة
- ✅ No errors or warnings في التطبيق

---

Created: December 20, 2025
Last Updated: December 20, 2025
