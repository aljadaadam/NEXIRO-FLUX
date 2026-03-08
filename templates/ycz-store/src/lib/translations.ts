// ─── Translation Dictionary ───
// Arabic (ar) is the default. English translations are provided here.

const en: Record<string, string> = {
  // ─── Navigation ───
  'الرئيسية': 'Home',
  'الخدمات': 'Services',
  'طلباتي': 'My Orders',
  'الدعم': 'Support',
  'حسابي': 'My Account',
  'تصفح الخدمات': 'Browse Services',
  'سجل الطلبات': 'Order History',
  'الحساب': 'Account',
  'الرصيد': 'Balance',

  // ─── Home Page ───
  'مرحباً بك 👋': 'Welcome 👋',
  'مرحباً بك': 'Welcome',
  'متجرك الإلكتروني جاهز': 'Your online store is ready',
  'أضف منتجاتك وابدأ البيع الآن': 'Add your products and start selling now',
  'خدمات متنوعة ⚡': 'Various Services ⚡',
  'خدمات متنوعة': 'Various Services',
  'كل ما تحتاجه في مكان واحد': 'Everything you need in one place',
  'تصفح الخدمات واطلب بسهولة': 'Browse services and order easily',
  'دعم فني 🛡️': 'Technical Support 🛡️',
  'دعم فني': 'Technical Support',
  'نحن هنا لمساعدتك': "We're here to help you",
  'فريق دعم متاح على مدار الساعة': 'Support team available 24/7',
  'تسوق الآن': 'Shop Now',
  'متاح': 'Available',

  // ─── Product / Order Modal ───
  'طلب المنتج': 'Order Product',
  'تأكيد الطلب': 'Confirm Order',
  'تم الطلب': 'Order Placed',
  'وقت الخدمة:': 'Service Time:',
  'الكمية': 'Quantity',
  'الدفع بالمحفظة': 'Pay with Wallet',
  'جاري جلب الرصيد...': 'Loading balance...',
  'غير متاح': 'Not Available',
  'يرجى تسجيل الدخول أولاً': 'Please login first',
  'تعذر تحميل رصيد المحفظة': 'Failed to load wallet balance',
  'رصيد المحفظة غير كافٍ': 'Insufficient wallet balance',
  'رقم IMEI': 'IMEI Number',
  'لا توجد حقول إضافية مطلوبة لهذا المنتج.': 'No additional fields required for this product.',
  'جارٍ إرسال الطلب...': 'Submitting order...',
  'تقديم الطلب': 'Submit Order',
  'فشل إرسال الطلب': 'Failed to submit order',
  'الرصيد غير كافٍ لإتمام الطلب': 'Insufficient balance to complete the order',
  'تم إرسال الطلب بنجاح!': 'Order submitted successfully!',
  'سيتم معالجة طلبك خلال دقائق. يمكنك متابعة حالة الطلب من صفحة \u201Cطلباتي\u201D.': 'Your order will be processed within minutes. You can track the order from "My Orders" page.',
  'سيتم معالجة طلبك خلال دقائق. يمكنك متابعة حالة الطلب من صفحة "طلباتي".': 'Your order will be processed within minutes. You can track the order from "My Orders" page.',
  'الرصيد المتبقي:': 'Remaining balance:',
  'حسناً': 'OK',
  'عام': 'General',
  'تفاصيل المنتج': 'Product Details',
  'متابعة': 'Continue',
  'تعديل': 'Edit',
  'ملخص الطلب': 'Order Summary',
  'المنتج': 'Product',
  'المبلغ الإجمالي': 'Total Amount',
  'الرصيد بعد الخصم': 'Balance After Deduction',
  'أدخل': 'Enter',
  'أدخل IMEI': 'Enter IMEI',
  'أدخل رقم IMEI': 'Enter IMEI Number',
  'مثال: 356938035643809': 'Example: 356938035643809',
  'معلومات': 'Information',
  'أدخل اسم المستخدم': 'Enter Username',
  'أدخل كلمة المرور': 'Enter Password',

  // ─── Featured Products ───
  '🔥 المنتجات المميزة': '🔥 Featured Products',
  'عرض الكل ←': 'View All →',
  'جاري التحميل...': 'Loading...',
  'لا توجد منتجات بعد': 'No products yet',
  'سيتم عرض المنتجات هنا بعد إضافتها من لوحة التحكم': 'Products will be displayed here after adding them from the dashboard',

  // ─── How to Order ───
  'كيف تطلب؟': 'How to Order?',
  'اختر الخدمة': 'Choose Service',
  'تصفح واختر الخدمة المناسبة': 'Browse and choose the right service',
  'أدخل البيانات': 'Enter Details',
  'أدخل المعلومات المطلوبة': 'Enter the required information',
  'ادفع بأمان': 'Pay Securely',
  'اختر طريقة الدفع المناسبة': 'Choose the appropriate payment method',
  'استلم فوراً': 'Receive Instantly',
  'احصل على الخدمة خلال دقائق': 'Get the service within minutes',

  // ─── Why Us ───
  'لماذا نحن؟': 'Why Us?',
  'تنفيذ سريع': 'Fast Execution',
  'طلباتك تُنفَّذ خلال دقائق': 'Your orders are processed within minutes',
  'حماية بياناتك': 'Data Protection',
  'تشفير SSL وحماية متقدمة': 'SSL encryption & advanced protection',
  'أسعار منافسة': 'Competitive Prices',
  'أفضل أسعار في السوق': 'Best prices in the market',
  'دعم مستمر': 'Continuous Support',

  // ─── Footer ───
  'نحن نقبل': 'We Accept',
  'روابط مهمة': 'Important Links',
  'سياسة الخصوصية': 'Privacy Policy',
  'الشروط والأحكام': 'Terms & Conditions',
  'سياسة الاسترجاع': 'Refund Policy',
  'تواصل معنا': 'Contact Us',
  'جميع الحقوق محفوظة — قالب من': 'All rights reserved — Template by',
  'لم يتم إضافة روابط بعد': 'No social links added yet',

  // ─── Orders Page ───
  'الانتظار': 'Waiting',
  'قيد الانتظار': 'Waiting',
  'قيد المعالجة': 'Processing',
  'مكتمل': 'Completed',
  'مرفوض': 'Rejected',
  'ملغي': 'Cancelled',
  'مسترجع': 'Refunded',
  '📋 سجل الطلبات': '📋 Order History',
  'الكل': 'All',
  'مكتملة': 'Completed',
  'معلقة': 'Waiting',
  'مرفوضة': 'Rejected',
  'نتيجة الخدمة:': 'Service Result:',
  'بيانات الطلب:': 'Order Details:',
  'بحث بـ IMEI، رقم الطلب، اسم المنتج...': 'Search by IMEI, order #, product...',
  'اليوم': 'Today',
  'فترة': 'Range',
  'مسح': 'Clear',
  'من': 'From',
  'إلى': 'To',
  'عدد النتائج:': 'Results:',
  'ملاحظات': 'Notes',
  'سبب الرفض:': 'Rejection Reason:',
  'لا توجد طلبات': 'No orders',

  // ─── Support Page ───
  'مركز الدعم': 'Support Center',
  'واتساب': 'WhatsApp',
  'تواصل مباشر': 'Direct Contact',
  'البريد': 'Email',
  'اتصل بنا': 'Call Us',
  'الأسئلة الشائعة': 'FAQ',
  'إرسال تذكرة دعم': 'Submit Support Ticket',
  'الموضوع': 'Subject',
  'اكتب رسالتك هنا...': 'Write your message here...',
  'إرسال': 'Send',

  // ─── FAQ ───
  'كم يستغرق تنفيذ الطلب؟': 'How long does order processing take?',
  'معظم الخدمات تُنفّذ خلال 1-24 ساعة حسب نوع الخدمة.': 'Most services are processed within 1-24 hours depending on the service type.',
  'هل الدفع آمن؟': 'Is payment secure?',
  'نعم، نستخدم بوابات دفع مشفرة ومعتمدة عالمياً.': 'Yes, we use globally certified encrypted payment gateways.',
  'ماذا لو فشل الطلب؟': 'What if the order fails?',
  'يتم استرداد المبلغ كاملاً أو إعادة المحاولة مجاناً.': 'The full amount is refunded or the attempt is retried for free.',
  'هل يوجد دعم فني؟': 'Is there technical support?',
  'نعم، فريق الدعم متاح 24/7 عبر التذاكر والواتساب.': 'Yes, the support team is available 24/7 via tickets and WhatsApp.',

  // ─── Services Page ───
  'تصفّح جميع خدماتنا': 'Browse All Our Services',
  'اختر الخدمة المناسبة من بين مجموعة واسعة': 'Choose the right service from a wide range',
  'أدوات سوفتوير': 'Software Tools',
  'خدمات IMEI': 'IMEI Services',
  'ألعاب': 'Games',
  'بحث في الخدمات...': 'Search services...',
  'اختر الجروب': 'Choose Group',
  'كل الجروبات': 'All Groups',
  'لا توجد جروبات ضمن هذا التصنيف': 'No groups in this category',
  'لا توجد نتائج مطابقة': 'No matching results',

  // ─── Profile / Auth ───
  'تسجيل الدخول': 'Login',
  'إنشاء حساب': 'Create Account',
  'البريد الإلكتروني': 'Email',
  'كلمة المرور': 'Password',
  'الاسم الكامل': 'Full Name',
  'دخول': 'Login',
  'جاري...': 'Loading...',
  'حدث خطأ غير متوقع': 'An unexpected error occurred',
  'فشل الاتصال بالخادم': 'Failed to connect to server',
  'كود التحقق': 'Verification Code',
  'تم إرسال كود التحقق إلى': 'Verification code sent to',
  'أدخل الكود المكون من 6 أرقام': 'Enter the 6-digit code',
  'جاري التحقق...': 'Verifying...',
  'تأكيد': 'Confirm',
  '← رجوع لتسجيل الدخول': '→ Back to Login',
  'فشل التحقق': 'Verification failed',

  // ─── Profile Menu ───
  'البيانات الشخصية': 'Personal Data',
  'المحفظة والعمليات': 'Wallet & Transactions',
  'شحن الرصيد': 'Add Balance',
  'التحقق من الهوية': 'Identity Verification',
  'الإشعارات': 'Notifications',
  'الإعدادات': 'Settings',
  'تسجيل الخروج': 'Logout',
  'تم حظر حسابك': 'Your account has been blocked',
  'تواصل مع الدعم إذا كنت تعتقد أن هذا خطأ': 'Contact support if you believe this is a mistake',
  'رصيد المحفظة': 'Wallet Balance',
  'شحن المحفظة': 'Charge Wallet',
  'التفاصيل': 'Details',
  'مستخدم': 'User',
  'غير متحقق': 'Not Verified',
  'رجوع': 'Back',

  // ─── Wallet ───
  'رصيدك الحالي': 'Current Balance',
  'شحن رصيد': 'Add Balance',
  'إجمالي الشحن': 'Total Deposits',
  'إجمالي الشراء': 'Total Purchases',
  'المسترجع': 'Refunded',
  'سجل العمليات': 'Transaction History',
  'شحن محفظة': 'Wallet Deposit',
  'شراء': 'Purchase',
  'عملية': 'Transaction',
  'قيد المراجعة': 'Under Review',
  'بانتظار رفع الإيصال': 'Awaiting Receipt Upload',
  'بانتظار المراجعة': 'Pending Review',
  'بانتظار الإيصال': 'Awaiting Receipt',
  'فشل': 'Failed',

  // ─── Wallet Charge Modal ───
  '💰 شحن المحفظة': '💰 Charge Wallet',
  '📋 إتمام الدفع': '📋 Complete Payment',
  '📎 رفع الإيصال': '📎 Upload Receipt',
  '✅ تم الإرسال': '✅ Sent',
  'المبلغ ($)': 'Amount ($)',
  'أو أدخل مبلغ مخصص': 'Or enter a custom amount',
  'طريقة الدفع': 'Payment Method',
  'جاري تحميل بوابات الدفع...': 'Loading payment gateways...',
  'لا توجد بوابات دفع مفعّلة حالياً': 'No payment gateways enabled',
  'تواصل مع الإدارة لتفعيل بوابات الدفع': 'Contact admin to enable payment gateways',
  'افتراضي': 'Default',
  'فشل في بدء عملية الدفع': 'Failed to start payment',
  'جاري المعالجة...': 'Processing...',
  'المبلغ المطلوب': 'Required Amount',
  'تم توجيهك إلى PayPal': "You've been redirected to PayPal",
  'أكمل الدفع في صفحة PayPal ثم عد هنا': 'Complete payment on PayPal page then return here',
  'تحقق من حالة الدفع': 'Check Payment Status',
  'ادفع عبر Binance Pay': 'Pay via Binance Pay',
  'رابط الدفع:': 'Payment Link:',
  'فتح صفحة الدفع': 'Open Payment Page',
  'بيانات التحويل': 'Transfer Details',
  'عنوان المحفظة': 'Wallet Address',
  'الشبكة': 'Network',
  'المبلغ': 'Amount',
  'انتهت المهلة': 'Time Expired',
  'تحقق من الدفع': 'Verify Payment',
  'جاري التحقق من البلوكتشين...': 'Verifying on blockchain...',
  'لم يتم العثور على تحويل مطابق بعد': 'No matching transfer found yet',
  'أرسل بالضبط': 'Send exactly',
  'تحقق': 'Verify',
  'نسخ العنوان': 'Copy Address',
  'نسخ المبلغ': 'Copy Amount',
  'تم النسخ': 'Copied',
  'أرسل المبلغ بالضبط عبر الشبكة الصحيحة. المبلغ فريد لعمليتك.': 'Send the exact amount via the correct network. The amount is unique to your transaction.',
  'أرسل المبلغ عبر الشبكة الصحيحة. بعد الإرسال انسخ TX Hash للتحقق.': 'Send the amount via the correct network. After sending, copy the TX Hash to verify.',
  '✅ أرسلت المبلغ — التالي': '✅ I sent the amount — Next',
  'المبلغ المرسل': 'Amount Sent',
  'هاش المعاملة (Transaction Hash)': 'Transaction Hash',
  'انسخ TX Hash من محفظتك والصقه هنا': 'Copy TX Hash from your wallet and paste it here',
  'سيتم الكشف عن التحويل تلقائياً': 'Transfer will be detected automatically',
  'اضغط زر التحقق بعد إتمام التحويل': 'Click verify after completing the transfer',
  '🔍 تحقق من الدفع': '🔍 Verify Payment',
  '← العودة لبيانات التحويل': '→ Back to transfer details',
  'يرجى إدخال هاش المعاملة (Transaction Hash)': 'Please enter the Transaction Hash',
  'البنك': 'Bank',
  'اسم الحساب': 'Account Name',
  'العملة': 'Currency',
  'رقم المرجع': 'Reference Number',
  'رفع الإيصال': 'Upload Receipt',
  'تم رفع الإيصال بنجاح': 'Receipt uploaded successfully',
  'اضغط لرفع صورة الإيصال': 'Click to upload receipt image',
  'ملاحظات إضافية (اختياري)': 'Additional notes (optional)',
  'إرسال للمراجعة': 'Submit for Review',
  'جاري الإرسال...': 'Sending...',
  'فشل في رفع الإيصال': 'Failed to upload receipt',
  'تم تأكيد الدفع!': 'Payment Confirmed!',
  'تم تأكيد الدفع وإضافة الرصيد لمحفظتك.': 'Payment confirmed and balance added to your wallet.',
  'تم إرسال طلب الشحن!': 'Charge request sent!',
  'سيتم مراجعة الإيصال وإضافة الرصيد لمحفظتك خلال دقائق.': 'Receipt will be reviewed and balance added within minutes.',
  'رقم العملية:': 'Transaction ID:',
  'فشل في التحقق': 'Verification failed',
  'الدفع لا يزال قيد الانتظار...': 'Payment is still pending...',
  '← رجوع': '→ Back',

  // ─── Personal Data ───
  'رقم الهاتف': 'Phone Number',
  'الدولة': 'Country',
  'كلمة المرور الجديدة': 'New Password',
  'اتركه فارغاً إذا لم ترد تغييرها': "Leave empty if you don't want to change it",
  'حفظ التغييرات': 'Save Changes',
  'تم الحفظ': 'Saved',
  'جاري الحفظ...': 'Saving...',
  'فشل حفظ البيانات. تأكد من تسجيل الدخول.': 'Failed to save data. Make sure you are logged in.',

  // ─── Forgot / Reset Password ───
  'نسيت كلمة المرور؟': 'Forgot Password?',
  'تأكيد كلمة المرور': 'Confirm Password',
  'كلمات المرور غير متطابقة': 'Passwords do not match',
  'استعادة كلمة المرور': 'Reset Password',
  'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور': 'Enter your email to reset your password',
  'إرسال رابط الاستعادة': 'Send Reset Link',
  'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني': 'Reset link has been sent to your email',
  'إعادة تعيين كلمة المرور': 'Reset Password',
  'أدخل كلمة المرور الجديدة': 'Enter new password',
  'تأكيد كلمة المرور الجديدة': 'Confirm new password',
  'تحديث كلمة المرور': 'Update Password',
  'جاري التحديث...': 'Updating...',
  'تم تعيين كلمة المرور بنجاح': 'Password has been reset successfully',
  'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة': 'You can now log in with your new password',
  'رابط غير صالح أو منتهي الصلاحية': 'Invalid or expired link',
  'كلمة المرور يجب أن تكون 8 أحرف على الأقل': 'Password must be at least 8 characters',

  // ─── Privacy Page ───
  'العودة للرئيسية': 'Back to Home',
  'آخر تحديث: فبراير 2026': 'Last updated: February 2026',
  'المعلومات التي نجمعها': 'Information We Collect',
  'نجمع المعلومات التالية عند استخدامك للمنصة: الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)، معلومات الدفع اللازمة لإتمام المعاملات، وبيانات الاستخدام مثل الصفحات التي تزورها ووقت الزيارة.':
    'We collect the following information when you use the platform: name, email, phone number (optional), payment information needed to complete transactions, and usage data such as pages you visit and visit time.',
  'كيف نستخدم معلوماتك': 'How We Use Your Information',
  'نستخدم بياناتك لمعالجة الطلبات وإتمام المعاملات، تحسين تجربة المستخدم وتخصيص المحتوى، إرسال إشعارات مهمة حول حسابك وطلباتك، والتواصل معك بخصوص الدعم الفني إذا لزم الأمر.':
    'We use your data to process orders and complete transactions, improve user experience and personalize content, send important notifications about your account and orders, and contact you regarding technical support when necessary.',
  'حماية البيانات': 'Data Protection',
  'نلتزم بحماية بياناتك الشخصية باستخدام تقنيات تشفير متقدمة وبروتوكولات أمان صارمة. لا نشارك بياناتك مع أطراف ثالثة إلا في حالات الضرورة القانونية أو بموافقتك الصريحة.':
    'We are committed to protecting your personal data using advanced encryption technologies and strict security protocols. We do not share your data with third parties except when legally required or with your explicit consent.',
  'ملفات تعريف الارتباط (Cookies)': 'Cookies',
  'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع، تذكر تفضيلاتك، وتحليل حركة المرور. يمكنك التحكم بإعدادات ملفات تعريف الارتباط من خلال متصفحك.':
    'We use cookies to improve your experience on the website, remember your preferences, and analyze traffic. You can control cookie settings through your browser.',
  'حقوقك': 'Your Rights',
  'يحق لك الوصول إلى بياناتك الشخصية وتعديلها أو حذفها. يمكنك أيضاً طلب نسخة من بياناتك أو الاعتراض على معالجتها في أي وقت عبر التواصل معنا.':
    'You have the right to access, modify, or delete your personal data. You can also request a copy of your data or object to its processing at any time by contacting us.',
  'لأي استفسارات حول سياسة الخصوصية، تواصل معنا عبر صفحة الدعم.':
    'For any inquiries about the privacy policy, contact us through the support page.',
  'مركز الدعم ←': 'Support Center →',

  // ─── Terms Page ───
  'قبول الشروط': 'Acceptance of Terms',
  'حقوق الملكية الفكرية': 'Intellectual Property Rights',
  'جميع المحتويات والتصاميم والعلامات التجارية المعروضة على المنصة هي ملكية خاصة لأصحابها. يُحظر نسخ أو إعادة إنتاج أي محتوى بدون إذن مسبق.':
    'All content, designs, and trademarks displayed on the platform are the property of their respective owners. Copying or reproducing any content without prior permission is prohibited.',
  'الاستخدام المحظور': 'Prohibited Use',
  'يُحظر استخدام المنصة لأي أغراض غير قانونية أو ضارة، بما في ذلك: المحتوى المخالف للقانون، الاحتيال، انتهاك حقوق الآخرين، نشر البرمجيات الخبيثة، أو أي نشاط يضر بالمنصة أو مستخدميها.':
    'Using the platform for any illegal or harmful purposes is prohibited, including: illegal content, fraud, violation of others\' rights, distributing malware, or any activity that harms the platform or its users.',
  'المسؤولية والضمانات': 'Liability and Warranties',
  'نسعى لتقديم خدمة عالية الجودة لكننا لا نضمن خلو المنصة من الأخطاء التقنية بشكل كامل. نحن غير مسؤولين عن أي أضرار ناتجة عن سوء استخدام المنصة أو انقطاع الخدمة المؤقت.':
    'We strive to provide a high-quality service but do not guarantee that the platform is completely free of technical errors. We are not responsible for any damages resulting from misuse of the platform or temporary service interruptions.',
  'تعديل الشروط': 'Modification of Terms',
  'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية قبل تطبيقها. استمرارك في استخدام المنصة يعني موافقتك على الشروط المعدّلة.':
    'We reserve the right to modify these terms and conditions at any time. Users will be notified of any material changes before they are applied. Your continued use of the platform means you agree to the modified terms.',
  'لأي استفسارات حول الشروط والأحكام، تواصل معنا عبر صفحة الدعم.':
    'For any inquiries about the terms and conditions, contact us through the support page.',

  // ─── Refund Page ───
  '⚠️ المنتجات الرقمية غير قابلة للاسترجاع': '⚠️ Digital products are non-refundable',
  'نظراً لطبيعة المنتجات والخدمات الرقمية، فإن جميع عمليات الشراء نهائية وغير قابلة للاسترجاع بعد تنفيذ الخدمة أو تسليم المنتج.':
    'Due to the nature of digital products and services, all purchases are final and non-refundable after the service is executed or the product is delivered.',
  '💰 رصيد المحفظة غير قابل للسحب': '💰 Wallet balance is non-withdrawable',
  'شحن المحفظة يُضاف كرصيد للاستخدام داخل المنصة فقط، ولا يمكن سحب الرصيد إلى البنك أو تحويله خارج المنصة مرة أخرى.':
    'Wallet charges are added as balance for use within the platform only, and the balance cannot be withdrawn to a bank or transferred outside the platform.',
  'متى يمكن الاسترجاع؟': 'When can a refund be issued?',
  'إذا لم يتم تنفيذ الخدمة أو تسليم المنتج بسبب خطأ تقني من المنصة':
    'If the service was not executed or the product was not delivered due to a technical error from the platform',
  'إذا تم خصم المبلغ أكثر من مرة بسبب خطأ في بوابة الدفع (الخصم المكرر فقط)':
    'If the amount was charged more than once due to a payment gateway error (duplicate charge only)',
  'إذا كانت الخدمة المقدمة مختلفة تماماً عن الوصف المعروض':
    'If the service provided was completely different from the displayed description',
  'حالات لا يتم فيها الاسترجاع': 'Cases where refunds are not issued',
  'بعد تنفيذ الخدمة بنجاح وتسليم النتيجة': 'After successful service execution and delivery of results',
  'تغيير رأي العميل بعد الشراء': "Customer's change of mind after purchase",
  'رصيد المحفظة المشحون — لا يمكن سحبه إلى البنك': 'Charged wallet balance — cannot be withdrawn to bank',
  'عدم قراءة وصف الخدمة أو المنتج قبل الشراء': 'Not reading the service or product description before purchase',
  'لأي استفسارات حول سياسة الاسترجاع، تواصل معنا عبر صفحة الدعم.':
    'For any inquiries about the refund policy, contact us through the support page.',

  // ─── Login Page ───
  'جاري تسجيل الدخول...': 'Logging in...',
  'يرجى الانتظار': 'Please wait',

  // ─── Admin Settings ───
  '⚙️ الإعدادات': '⚙️ Settings',
  'حفظ الإعدادات': 'Save Settings',
  'إعدادات البريد الإلكتروني (SMTP)': 'Email Settings (SMTP)',
  'لإرسال رسائل التأكيد والإشعارات للزبائن': 'For sending confirmation and notification emails to customers',
  'سيرفر SMTP (Host)': 'SMTP Server (Host)',
  'المنفذ (Port)': 'Port',
  'اسم المستخدم': 'Username',
  'البريد المرسل (From)': 'Sender Email (From)',
  'إعدادات العملة': 'Currency Settings',
  'العملة الأساسية هي الدولار (USD). يمكنك إضافة عملة ثانوية للعرض': 'Base currency is USD. You can add a secondary currency for display',
  'العملة الثانوية': 'Secondary Currency',
  'بدون عملة ثانوية': 'No secondary currency',
  'سعر تحويل الدولار': 'Dollar Exchange Rate',
  'إعدادات الأمان': 'Security Settings',
  'إعدادات حماية حسابات الزبائن': 'Customer account security settings',
  'تفعيل كود التحقق (OTP)': 'Enable Verification Code (OTP)',
  'عند التفعيل، يُطلب من الزبائن إدخال كود تحقق يُرسل عبر البريد الإلكتروني': 'When enabled, customers must enter a verification code sent via email',
  'عند تسجيل الدخول من جهاز جديد أو بعد فترة انقطاع': 'when logging in from a new device or after a period of inactivity',
  'يجب إعداد البريد الإلكتروني (SMTP) أولاً لتفعيل كود التحقق': 'Email (SMTP) must be configured first to enable verification code',

  // ─── Language Settings ───
  'إعدادات اللغة': 'Language Settings',
  'لغة واجهة المتجر للزبائن': 'Store interface language for customers',
  'واجهة عربية (RTL)': 'Arabic Interface (RTL)',
  'واجهة إنجليزية (LTR)': 'English Interface (LTR)',

  // ─── Gateway Descriptions ───
  'تحويل عبر PayPal': 'Transfer via PayPal',
  'حوالة بنكية مباشرة': 'Direct Bank Transfer',
  'شحن عبر محفظة إلكترونية': 'Top-up via E-Wallet',
  'تعليمات الشحن': 'Charging Instructions',
  'أرقام التواصل للشحن': 'Contact Numbers for Charging',
  'هذه البوابة للتواصل فقط. تواصل مع الأرقام أعلاه لإتمام عملية الشحن.': 'This gateway is for contact only. Reach out to the numbers above to complete the charging process.',

  // ─── Meta ───
  'المتجر': 'Store',
  'المتجر — خدمات رقمية': 'Store — Digital Services',
  'متجر الخدمات الرقمية — فتح شبكات، كريدت، شحن ألعاب والمزيد': 'Digital services store — Unlocks, credits, game top-ups & more',

  // ─── Blog Page ───
  'المدونة': 'Blog',
  'مقالات ونصائح تقنية في عالم الهواتف والبرمجيات': 'Tech articles and tips about phones and software',
  'دقائق قراءة': 'min read',
  'تصفّح خدماتنا': 'Browse Our Services',
  'لا توجد مقالات في هذا التصنيف': 'No articles in this category',
  'مقالات': 'Articles',
  'تصنيفات': 'Categories',
  'إجمالي القراءات': 'Total Views',
  'iCloud': 'iCloud',
  'فتح شبكات': 'Network Unlock',
  'FRP': 'FRP',
  'فحص IMEI': 'IMEI Check',
  'شحن ألعاب': 'Game Top-up',

  // ─── Chat Widget ───
  'فتح الدردشة': 'Open Chat',
  'الدعم المباشر': 'Live Support',
  'متصل الآن': 'Online Now',
  'مرحباً بك!': 'Welcome!',
  'أدخل اسمك لبدء المحادثة مع فريق الدعم': 'Enter your name to start a conversation with support',
  'اسمك...': 'Your name...',
  'ابدأ المحادثة': 'Start Chat',
  'كيف يمكننا مساعدتك اليوم؟': 'How can we help you today?',
  'اكتب رسالتك وسنرد عليك في أقرب وقت ⚡': 'Type your message and we\'ll reply soon ⚡',
  'اكتب رسالتك...': 'Type your message...',
  'إغلاق': 'Close',

  // ─── Profile – Wallet – Identity Verification ───
  'عبر': 'via',
  'حجم الملف يتجاوز 5MB': 'File size exceeds 5MB',
  'يرجى رفع صورة الإيصال أولاً': 'Please upload the receipt image first',
  'بيانات الحساب': 'Account Details',
  'حوّل المبلغ بالعملة المحلية إلى الحساب أعلاه. بعد التحويل ارفع صورة الإشعار للتأكيد.': 'Transfer the amount in local currency to the above account. After transferring, upload the receipt image for confirmation.',
  'رفع إشعار التحويل': 'Upload Transfer Receipt',
  'تم رفع إشعار التحويل بنجاح': 'Transfer receipt uploaded successfully',
  'اضغط لتغيير الصورة': 'Click to change image',
  'حد أقصى': 'Max',
  'غير مصرح': 'Unauthorized',
  'يرجى رفع بطاقة هوية لتوثيق حسابك': 'Please upload an ID card to verify your account',
  'مميزات التوثيق:': 'Verification Benefits:',
  'رفع حد السحب والشحن': 'Increase withdrawal and top-up limits',
  'أولوية في معالجة الطلبات': 'Priority order processing',
  'الوصول لعروض حصرية': 'Access to exclusive offers',
  'حماية إضافية للحساب': 'Additional account protection',
  'رفع صورة الهوية': 'Upload ID Photo',
  'اضغط لرفع صورة بطاقة الهوية': 'Click to upload ID card photo',
  'إرسال للتوثيق': 'Submit for Verification',
  'USDT — تيثر': 'USDT — Tether',
  'دفع عبر بنكك — تحويل محلي': 'Pay via your bank — Local transfer',
  '🔗 فتح صفحة الدفع': '🔗 Open Payment Page',
  '🔄 تحقق من حالة الدفع': '🔄 Check Payment Status',
  'تأكد من إرسال المبلغ الصحيح عبر الشبكة الصحيحة': 'Make sure to send the correct amount via the correct network',

  // ─── Support Page SEO ───
  'مركز الدعم الفني': 'Technical Support Center',
  'تواصل معنا عبر واتساب أو البريد الإلكتروني للحصول على دعم فني سريع': 'Contact us via WhatsApp or email for quick technical support',

  // ─── Services Page ───
  'منتجات سوفت وير': 'Software Products',
  'خدمات المتجر': 'Store Services',

  // ─── Refund Page ───
  'سياسة الاسترجاع والاستبدال': 'Return & Refund Policy',

  // ─── SEO Keywords ───
  'متجر خدمات رقمية': 'Digital Services Store',
  'الرئيسية — متجر خدمات رقمية': 'Home — Digital Services Store',
  'الدعم الفني': 'Technical Support',
  'جميع الخدمات': 'All Services',
  'خدمة رقمية': 'Digital Service',

  // ─── Terms Page ───
  'مرحباً بك في': 'Welcome to',
  'يُرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام المنصة، حيث تُنظّم هذه الشروط العلاقة بينك وبين المنصة.': 'Please read the following terms and conditions carefully before using the platform, as these terms govern the relationship between you and the platform.',

  // ─── Privacy Page ───
  'نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام خدماتنا.': 'We are committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect the information you provide when using our services.',
};

export type Language = 'ar' | 'en';

export function translate(key: string, lang: Language): string {
  if (lang === 'ar') return key;
  return en[key] || key;
}

// Utility: translate with dynamic parts
// Usage: tpl(t, 'باستخدامك لمنصة {store} فإنك...', { store: storeName })
export function translateTemplate(key: string, lang: Language, vars: Record<string, string> = {}): string {
  let result = translate(key, lang);
  for (const [k, v] of Object.entries(vars)) {
    result = result.replace(`{${k}}`, v);
  }
  return result;
}
