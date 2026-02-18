// ─── بيانات تجريبية — متجر سيارات ───
import { Car, Branch, Order, DashboardStats } from './types';

const demoCars: Car[] = [
  // ───────────── سيارات جديدة (16) ─────────────
  {
    id: 1, name: 'مرسيدس بنز S-Class 2024', name_en: 'Mercedes-Benz S-Class 2024',
    brand: 'Mercedes-Benz', model: 'S 500', year: 2024, price: 450000, original_price: 495000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أسود ميتاليك',
    engine: 'V8 4.0L Twin Turbo', horsepower: 496, seats: 5,
    description: 'مرسيدس S-Class الفئة الفاخرة مع باقة AMG الرياضية وتقنيات القيادة الذاتية. تتميز بمقصورة داخلية فاخرة من الجلد الطبيعي ونظام MBUX الترفيهي المتقدم مع شاشات OLED.',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'], is_featured: true, category: 'سيدان'
  },
  {
    id: 2, name: 'بي ام دبليو X7 2024', name_en: 'BMW X7 2024',
    brand: 'BMW', model: 'X7 xDrive40i', year: 2024, price: 380000, original_price: 420000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أبيض لؤلؤي',
    engine: 'I6 3.0L Turbo', horsepower: 375, seats: 7,
    description: 'بي ام دبليو X7 الفاخرة مع مقصورة فسيحة تتسع لـ7 ركاب وتقنيات متطورة. نظام iDrive 8 مع شاشة منحنية وقيادة شبه ذاتية على الطرق السريعة.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'], is_featured: true, category: 'SUV'
  },
  {
    id: 3, name: 'أودي RS7 2025', name_en: 'Audi RS7 2025',
    brand: 'Audi', model: 'RS7 Sportback', year: 2025, price: 560000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'رمادي نيبلا',
    engine: 'V8 4.0L TFSI', horsepower: 621, seats: 4,
    description: 'أودي RS7 الأداء العالي مع نظام Quattro للدفع الرباعي. تسارع 0-100 في 3.4 ثانية مع نظام العادم الرياضي RS وفرامل سيراميك كربونية.',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'], is_featured: true, category: 'سبورت'
  },
  {
    id: 4, name: 'تويوتا كامري 2025', name_en: 'Toyota Camry 2025',
    brand: 'Toyota', model: 'Camry Grande', year: 2025, price: 142000,
    condition: 'new', fuel_type: 'هايبرد', transmission: 'أوتوماتيك CVT', color: 'فضي ميتاليك',
    engine: 'I4 2.5L Hybrid', horsepower: 225, seats: 5,
    description: 'تويوتا كامري الجيل الجديد بتصميم أنيق ومحرك هايبرد اقتصادي. استهلاك وقود لا يتجاوز 4.5 لتر/100 كم مع نظام Toyota Safety Sense 3.0.',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'], category: 'سيدان'
  },
  {
    id: 6, name: 'بورش 911 كاريرا 2025', name_en: 'Porsche 911 Carrera 2025',
    brand: 'Porsche', model: '911 Carrera S', year: 2025, price: 720000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك PDK', color: 'أحمر جارنيت',
    engine: 'H6 3.0L Twin Turbo', horsepower: 473, seats: 4,
    description: 'بورش 911 كاريرا S الأيقونية الموديل المحدث مع ناقل PDK ثماني السرعات ونظام PASM الرياضي. تجربة قيادة لا مثيل لها مع صوت محرك أسطوري.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'], is_featured: true, category: 'سبورت'
  },
  {
    id: 7, name: 'لكزس LX 600 2025', name_en: 'Lexus LX 600 2025',
    brand: 'Lexus', model: 'LX 600 Prestige', year: 2025, price: 435000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أبيض سوني كوارتز',
    engine: 'V6 3.5L Twin Turbo', horsepower: 409, seats: 7,
    description: 'لكزس LX 600 الفاخرة مع نظام AVS التكيفي وشاشات ترفيهية خلفية. فخامة يابانية لا تُضاهى مع متانة أسطورية في الطرق الوعرة.',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0637?w=800'], category: 'SUV'
  },
  {
    id: 9, name: 'مرسيدس AMG GT 2025', name_en: 'Mercedes-AMG GT 2025',
    brand: 'Mercedes-Benz', model: 'AMG GT 63 S', year: 2025, price: 890000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'رمادي سيلينايت',
    engine: 'V8 4.0L Biturbo', horsepower: 630, seats: 4,
    description: 'مرسيدس AMG GT — الوحش الألماني بقوة 630 حصان. تسارع 0-100 في 3.2 ثانية مع نظام تعليق AMG Active Ride Control ونظام عادم Performance Exhaust.',
    images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800'], is_featured: true, category: 'سبورت'
  },
  {
    id: 10, name: 'تويوتا لاندكروزر 2025', name_en: 'Toyota Land Cruiser 2025',
    brand: 'Toyota', model: 'Land Cruiser GXR', year: 2025, price: 320000,
    condition: 'new', fuel_type: 'ديزل', transmission: 'أوتوماتيك', color: 'أبيض',
    engine: 'V6 3.3L Diesel Twin Turbo', horsepower: 309, seats: 7,
    description: 'تويوتا لاندكروزر الجيل الجديد — ملك الطرق الوعرة. هيكل TNGA-F الجديد أخف وزناً وأقوى أداءً مع نظام E-KDSS الإلكتروني.',
    images: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800'], is_featured: true, category: 'SUV'
  },
  {
    id: 11, name: 'كيا EV6 GT 2025', name_en: 'Kia EV6 GT 2025',
    brand: 'Kia', model: 'EV6 GT', year: 2025, price: 245000,
    condition: 'new', fuel_type: 'كهربائي', transmission: 'أوتوماتيك', color: 'أخضر زيتوني',
    engine: 'Dual Motor AWD', horsepower: 585, seats: 5,
    description: 'كيا EV6 GT الكهربائية بالكامل — مستقبل القيادة. تسارع 0-100 في 3.5 ثانية مع شحن فائق السرعة 800V وقيادة ممتعة لا تقل عن السيارات الرياضية.',
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'], category: 'كهربائي'
  },
  {
    id: 12, name: 'بي ام دبليو M4 كومبتيشن 2025', name_en: 'BMW M4 Competition 2025',
    brand: 'BMW', model: 'M4 Competition xDrive', year: 2025, price: 480000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أصفر ساو باولو',
    engine: 'I6 3.0L Twin Turbo', horsepower: 530, seats: 4,
    description: 'بي ام دبليو M4 كومبتيشن مع الدفع الرباعي xDrive. سيارة رياضية حقيقية مع قدرات يومية وناقل M Steptronic ثماني السرعات.',
    images: ['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'], category: 'سبورت'
  },
  {
    id: 13, name: 'نيسان باترول بلاتينيوم 2025', name_en: 'Nissan Patrol Platinum 2025',
    brand: 'Nissan', model: 'Patrol V8 Platinum', year: 2025, price: 295000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'بيج ميتاليك',
    engine: 'V8 5.6L', horsepower: 400, seats: 8,
    description: 'نيسان باترول بلاتينيوم — الرفيق الأمثل للرحلات الصحراوية. محرك V8 جبار مع نظام تعليق هيدروليكي وشاشات ترفيه خلفية.',
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'], category: 'SUV'
  },
  {
    id: 14, name: 'جينيسيس GV80 2025', name_en: 'Genesis GV80 2025',
    brand: 'Genesis', model: 'GV80 3.5T Sport', year: 2025, price: 270000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أخضر ماتسبورو',
    engine: 'V6 3.5L Twin Turbo', horsepower: 375, seats: 7,
    description: 'جينيسيس GV80 الفاخرة — فخامة كورية تنافس الألمان. مقصورة مكسوة بالجلد والخشب الطبيعي مع نظام صوتي Lexicon بـ21 سماعة.',
    images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800'], category: 'SUV'
  },
  {
    id: 15, name: 'مرسيدس GLE 450 2025', name_en: 'Mercedes-Benz GLE 450 2025',
    brand: 'Mercedes-Benz', model: 'GLE 450 4MATIC', year: 2025, price: 365000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'كحلي داكن',
    engine: 'I6 3.0L Turbo + EQ Boost', horsepower: 362, seats: 5,
    description: 'مرسيدس GLE 450 مع تقنية EQ Boost الهايبرد الخفيفة. رحابة ورفاهية مع نظام E-Active Body Control الذكي.',
    images: ['https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800'], category: 'SUV'
  },
  {
    id: 16, name: 'أودي e-tron GT RS 2025', name_en: 'Audi e-tron GT RS 2025',
    brand: 'Audi', model: 'e-tron GT RS', year: 2025, price: 750000,
    condition: 'new', fuel_type: 'كهربائي', transmission: 'أوتوماتيك', color: 'أسود ميثوس',
    engine: 'Dual Motor AWD', horsepower: 646, seats: 4,
    description: 'أودي e-tron GT RS — أسرع أودي كهربائية على الإطلاق. تسارع 0-100 في 3.3 ثانية مع هيكل من ألياف الكربون وفرامل سيراميك.',
    images: ['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800'], is_featured: true, category: 'كهربائي'
  },
  {
    id: 17, name: 'هيونداي سوناتا N-Line 2025', name_en: 'Hyundai Sonata N-Line 2025',
    brand: 'Hyundai', model: 'Sonata N-Line', year: 2025, price: 128000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك DCT', color: 'أحمر كريمسون',
    engine: 'I4 2.5L Turbo', horsepower: 290, seats: 5,
    description: 'هيونداي سوناتا N-Line الرياضية — أداء مبهر بسعر منافس. تعليق رياضي معزز مع وضعيات قيادة متعددة وتصميم عدواني.',
    images: ['https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800'], category: 'سيدان'
  },
  {
    id: 18, name: 'لكزس ES 350 F-Sport 2025', name_en: 'Lexus ES 350 F-Sport 2025',
    brand: 'Lexus', model: 'ES 350 F-Sport', year: 2025, price: 195000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أبيض لؤلؤي',
    engine: 'V6 3.5L', horsepower: 302, seats: 5,
    description: 'لكزس ES 350 F-Sport — هدوء لا يُضاهى مع لمسة رياضية. أفخم سيدان يابانية مع نظام Mark Levinson الصوتي.',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'], category: 'سيدان'
  },

  // ───────────── سيارات مستعملة (8) ─────────────
  {
    id: 5, name: 'رينج روفر سبورت 2022', name_en: 'Range Rover Sport 2022',
    brand: 'Land Rover', model: 'Sport HSE', year: 2022, price: 295000, original_price: 380000,
    condition: 'used', mileage: 25000, fuel_type: 'ديزل', transmission: 'أوتوماتيك', color: 'أخضر بريطاني',
    engine: 'V6 3.0L Diesel', horsepower: 300, seats: 5,
    description: 'رينج روفر سبورت مستعملة بحالة ممتازة مع تاريخ صيانة كامل عند الوكيل. كفالة مصنع سارية.',
    images: ['https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800'], category: 'SUV'
  },
  {
    id: 8, name: 'هيونداي توسان 2023', name_en: 'Hyundai Tucson 2023',
    brand: 'Hyundai', model: 'Tucson Limited', year: 2023, price: 95000, original_price: 125000,
    condition: 'used', mileage: 18000, fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أزرق',
    engine: 'I4 2.5L', horsepower: 187, seats: 5,
    description: 'هيونداي توسان بتصميمها الجريء والعصري بحالة ممتازة — مالك أول فقط مع فحص شامل.',
    images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'], category: 'SUV'
  },
  {
    id: 19, name: 'بي ام دبليو 530i 2022', name_en: 'BMW 530i 2022',
    brand: 'BMW', model: '530i M Sport', year: 2022, price: 185000, original_price: 260000,
    condition: 'used', mileage: 42000, fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'رمادي معدني',
    engine: 'I4 2.0L Turbo', horsepower: 248, seats: 5,
    description: 'بي ام دبليو 530i بباقة M-Sport الرياضية. حالة ممتازة مع سجل صيانة كامل عند الوكيل وتاريخ حوادث نظيف.',
    images: ['https://images.unsplash.com/photo-1520050206-44e79e3fa4b3?w=800'], category: 'سيدان'
  },
  {
    id: 20, name: 'تويوتا فورتشنر 2021', name_en: 'Toyota Fortuner 2021',
    brand: 'Toyota', model: 'Fortuner GXR', year: 2021, price: 125000, original_price: 175000,
    condition: 'used', mileage: 65000, fuel_type: 'ديزل', transmission: 'أوتوماتيك', color: 'أبيض',
    engine: 'I4 2.8L Diesel Turbo', horsepower: 204, seats: 7,
    description: 'تويوتا فورتشنر GXR — السيارة العائلية المثالية للمغامرات. محرك ديزل اقتصادي مع دفع رباعي ومقصورة واسعة.',
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'], category: 'SUV'
  },
  {
    id: 21, name: 'بورش كايين 2021', name_en: 'Porsche Cayenne 2021',
    brand: 'Porsche', model: 'Cayenne S', year: 2021, price: 340000, original_price: 450000,
    condition: 'used', mileage: 38000, fuel_type: 'بنزين', transmission: 'أوتوماتيك PDK', color: 'أسود',
    engine: 'V6 2.9L Twin Turbo', horsepower: 434, seats: 5,
    description: 'بورش كايين S — رياضية وفاخرة في آن واحد. حالة استثنائية مع باقة Sport Chrono وتعليق هوائي.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'], category: 'SUV'
  },
  {
    id: 22, name: 'مرسيدس C200 2022', name_en: 'Mercedes-Benz C200 2022',
    brand: 'Mercedes-Benz', model: 'C200 AMG Line', year: 2022, price: 175000, original_price: 235000,
    condition: 'used', mileage: 30000, fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أبيض بولار',
    engine: 'I4 1.5L Turbo + EQ Boost', horsepower: 204, seats: 5,
    description: 'مرسيدس C200 بباقة AMG Line — أناقة ألمانية بحالة الزيرو. شاشات رقمية كاملة ونظام MBUX الذكي مع مساعد صوتي.',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'], category: 'سيدان'
  },
  {
    id: 23, name: 'أودي Q7 2022', name_en: 'Audi Q7 2022',
    brand: 'Audi', model: 'Q7 55 TFSI', year: 2022, price: 220000, original_price: 310000,
    condition: 'used', mileage: 45000, fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'رمادي منهاتن',
    engine: 'V6 3.0L TFSI', horsepower: 335, seats: 7,
    description: 'أودي Q7 الفاخرة — فسحة ورفاهية لكل العائلة. نظام Quattro للدفع الرباعي مع تعليق هوائي تكيفي وشاشات ثلاثية.',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'], category: 'SUV'
  },
  {
    id: 24, name: 'كيا K5 GT 2023', name_en: 'Kia K5 GT 2023',
    brand: 'Kia', model: 'K5 GT', year: 2023, price: 98000, original_price: 135000,
    condition: 'used', mileage: 22000, fuel_type: 'بنزين', transmission: 'أوتوماتيك DCT', color: 'أحمر',
    engine: 'I4 2.5L Turbo', horsepower: 290, seats: 5,
    description: 'كيا K5 GT — سيدان رياضية بسعر لا يُقاوم. محرك تيربو قوي مع ناقل DCT ثماني السرعات وتصميم حاد.',
    images: ['https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800'], category: 'سيدان'
  },
];

const demoBranches: Branch[] = [
  {
    id: 1, name: 'الفرع الرئيسي — الرياض', name_en: 'Main Branch — Riyadh',
    address: 'طريق الملك فهد، حي العليا، الرياض 12211', address_en: 'King Fahd Road, Olaya District, Riyadh 12211',
    city: 'الرياض', phone: '+966 11 234 5678', email: 'riyadh@autozone.sa',
    lat: 24.7136, lng: 46.6753, working_hours: '٩ ص — ١٠ م، الجمعة: ٤ م — ١٠ م', is_main: true,
    image: 'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=800'
  },
  {
    id: 2, name: 'فرع جدة — طريق الأمير سلطان', name_en: 'Jeddah Branch — Prince Sultan Rd',
    address: 'طريق الأمير سلطان، حي الروضة، جدة 23432', address_en: 'Prince Sultan Road, Al Rawdah, Jeddah 23432',
    city: 'جدة', phone: '+966 12 678 9012', email: 'jeddah@autozone.sa',
    lat: 21.5433, lng: 39.1728, working_hours: '٩ ص — ١١ م، الجمعة: ٤ م — ١١ م', is_main: false,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800'
  },
  {
    id: 3, name: 'فرع الدمام — الشاطئ', name_en: 'Dammam Branch — Al Shati',
    address: 'طريق الملك سعود، حي الشاطئ، الدمام 32234', address_en: 'King Saud Road, Al Shati, Dammam 32234',
    city: 'الدمام', phone: '+966 13 456 7890', email: 'dammam@autozone.sa',
    lat: 26.3927, lng: 49.9777, working_hours: '١٠ ص — ١٠ م، الجمعة: ٤ م — ١٠ م', is_main: false,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'
  },
  {
    id: 4, name: 'فرع مكة المكرمة', name_en: 'Makkah Branch',
    address: 'طريق أم القرى، حي العزيزية، مكة المكرمة 24381', address_en: 'Umm Al-Qura Road, Al Aziziyah, Makkah 24381',
    city: 'مكة المكرمة', phone: '+966 12 543 2100', email: 'makkah@autozone.sa',
    lat: 21.4225, lng: 39.8262, working_hours: '١٠ ص — ١٠ م، الجمعة: مغلق', is_main: false,
    image: 'https://images.unsplash.com/photo-1562519776-b232298dc657?w=800'
  },
  {
    id: 5, name: 'فرع المدينة المنورة', name_en: 'Madinah Branch',
    address: 'طريق الملك عبدالله، حي السلام، المدينة المنورة 42317', address_en: 'King Abdullah Road, As Salam, Madinah 42317',
    city: 'المدينة المنورة', phone: '+966 14 876 5432', email: 'madinah@autozone.sa',
    lat: 24.4672, lng: 39.6024, working_hours: '٩ ص — ١٠ م، الجمعة: ٤ م — ١٠ م', is_main: false,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'
  },
  {
    id: 6, name: 'فرع الخبر — الكورنيش', name_en: 'Al Khobar Branch — Corniche',
    address: 'كورنيش الخبر، حي العقربية، الخبر 34424', address_en: 'Al Khobar Corniche, Al Aqrabiyah, Al Khobar 34424',
    city: 'الخبر', phone: '+966 13 899 1234', email: 'khobar@autozone.sa',
    lat: 26.2172, lng: 50.1971, working_hours: '١٠ ص — ١١ م، الجمعة: ٤ م — ١١ م', is_main: false,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800'
  },
];

const demoCustomers = [
  { id: 1, name: 'خالد العتيبي', email: 'khaled.otaibi@gmail.com', phone: '+966 50 123 4567', created_at: '2024-08-12' },
  { id: 2, name: 'محمد الشمري', email: 'moh.shamri@outlook.com', phone: '+966 55 987 6543', created_at: '2024-09-05' },
  { id: 3, name: 'سارة القحطاني', email: 'sarah.q@gmail.com', phone: '+966 54 111 2222', created_at: '2024-10-18' },
  { id: 4, name: 'فهد الدوسري', email: 'fahad.dosari@yahoo.com', phone: '+966 50 333 4444', created_at: '2024-11-01' },
  { id: 5, name: 'عبدالله المالكي', email: 'abdullah.malki@gmail.com', phone: '+966 56 777 8899', created_at: '2024-11-20' },
  { id: 6, name: 'نورة السبيعي', email: 'noura.s@hotmail.com', phone: '+966 55 222 3344', created_at: '2024-12-03' },
  { id: 7, name: 'عمر الحربي', email: 'omar.harbi@gmail.com', phone: '+966 50 444 5566', created_at: '2025-01-10' },
  { id: 8, name: 'ريم العنزي', email: 'reem.anazi@outlook.com', phone: '+966 54 666 7788', created_at: '2025-01-22' },
  { id: 9, name: 'سلطان الغامدي', email: 'sultan.gh@gmail.com', phone: '+966 59 888 9900', created_at: '2025-02-01' },
  { id: 10, name: 'هيفاء الزهراني', email: 'haifa.z@gmail.com', phone: '+966 53 111 4455', created_at: '2025-02-08' },
  { id: 11, name: 'تركي المطيري', email: 'turki.mutairi@yahoo.com', phone: '+966 50 999 1122', created_at: '2025-02-12' },
  { id: 12, name: 'لمى البقمي', email: 'lama.b@outlook.com', phone: '+966 55 333 6677', created_at: '2025-02-16' },
];

const demoOrders: Order[] = [
  { id: 1001, customer_name: 'خالد العتيبي', customer_phone: '+966 50 123 4567', customer_email: 'khaled.otaibi@gmail.com', car_id: 1, car_name: 'مرسيدس بنز S-Class 2024', status: 'completed', total_price: 450000, branch_id: 1, notes: 'يرغب بلون أسود ميتاليك — تم التسليم', created_at: '2025-01-05' },
  { id: 1002, customer_name: 'محمد الشمري', customer_phone: '+966 55 987 6543', car_id: 3, car_name: 'أودي RS7 2025', status: 'completed', total_price: 560000, branch_id: 1, created_at: '2025-01-12' },
  { id: 1003, customer_name: 'سارة القحطاني', customer_phone: '+966 54 111 2222', car_id: 5, car_name: 'رينج روفر سبورت 2022', status: 'completed', total_price: 295000, branch_id: 2, notes: 'سيارة مستعملة — فحص كامل قبل التسليم', created_at: '2025-01-18' },
  { id: 1004, customer_name: 'فهد الدوسري', customer_phone: '+966 50 333 4444', car_id: 4, car_name: 'تويوتا كامري 2025', status: 'completed', total_price: 142000, branch_id: 3, created_at: '2025-01-25' },
  { id: 1005, customer_name: 'عبدالله المالكي', customer_phone: '+966 56 777 8899', car_id: 10, car_name: 'تويوتا لاندكروزر 2025', status: 'completed', total_price: 320000, branch_id: 1, notes: 'تمويل بنكي — الراجحي', created_at: '2025-01-28' },
  { id: 1006, customer_name: 'نورة السبيعي', customer_phone: '+966 55 222 3344', car_id: 7, car_name: 'لكزس LX 600 2025', status: 'confirmed', total_price: 435000, branch_id: 2, created_at: '2025-02-02' },
  { id: 1007, customer_name: 'عمر الحربي', customer_phone: '+966 50 444 5566', car_id: 9, car_name: 'مرسيدس AMG GT 2025', status: 'confirmed', total_price: 890000, branch_id: 1, notes: 'يرغب بإضافة باقة Carbon Fiber', created_at: '2025-02-05' },
  { id: 1008, customer_name: 'ريم العنزي', customer_phone: '+966 54 666 7788', car_id: 22, car_name: 'مرسيدس C200 2022', status: 'confirmed', total_price: 175000, branch_id: 4, created_at: '2025-02-07' },
  { id: 1009, customer_name: 'سلطان الغامدي', customer_phone: '+966 59 888 9900', car_id: 6, car_name: 'بورش 911 كاريرا 2025', status: 'pending', total_price: 720000, branch_id: 1, notes: 'طلب تجربة قيادة أولاً', created_at: '2025-02-10' },
  { id: 1010, customer_name: 'هيفاء الزهراني', customer_phone: '+966 53 111 4455', car_id: 14, car_name: 'جينيسيس GV80 2025', status: 'pending', total_price: 270000, branch_id: 2, created_at: '2025-02-12' },
  { id: 1011, customer_name: 'تركي المطيري', customer_phone: '+966 50 999 1122', car_id: 12, car_name: 'بي ام دبليو M4 كومبتيشن 2025', status: 'pending', total_price: 480000, branch_id: 1, notes: 'مقارنة مع أودي RS5', created_at: '2025-02-14' },
  { id: 1012, customer_name: 'لمى البقمي', customer_phone: '+966 55 333 6677', car_id: 11, car_name: 'كيا EV6 GT 2025', status: 'pending', total_price: 245000, branch_id: 6, notes: 'استفسار عن محطات الشحن', created_at: '2025-02-15' },
  { id: 1013, customer_name: 'خالد العتيبي', customer_phone: '+966 50 123 4567', car_id: 16, car_name: 'أودي e-tron GT RS 2025', status: 'pending', total_price: 750000, branch_id: 1, notes: 'عميل سابق — يرغب بسيارة ثانية كهربائية', created_at: '2025-02-16' },
  { id: 1014, customer_name: 'عبدالله المالكي', customer_phone: '+966 56 777 8899', car_id: 2, car_name: 'بي ام دبليو X7 2024', status: 'confirmed', total_price: 380000, branch_id: 5, notes: 'إهداء للعائلة', created_at: '2025-02-17' },
  { id: 1015, customer_name: 'محمد الشمري', customer_phone: '+966 55 987 6543', car_id: 21, car_name: 'بورش كايين 2021', status: 'cancelled', total_price: 340000, branch_id: 1, notes: 'ألغى الطلب — وجد سعر أفضل', created_at: '2025-02-08' },
];

const demoStats: DashboardStats = {
  total_cars: 24, new_cars: 16, used_cars: 8,
  total_orders: 15, pending_orders: 5,
  total_customers: 312, total_revenue: 6_652_000, featured_cars: 7,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDemoResponse(endpoint: string, method: string): any {
  const e = endpoint.replace(/\?.*$/, '');
  if (method === 'GET') {
    if (e === '/products' || e === '/products/' || e === '/products/public' || e === '/products/public/') return { products: demoCars };
    if (e.match(/^\/products\/(public\/)?\d+$/)) {
      const id = parseInt(e.split('/').pop()!);
      return { product: demoCars.find(c => c.id === id) || demoCars[0] };
    }
    if (e === '/branches' || e === '/branches/' || e === '/branches/public' || e === '/branches/public/') return { branches: demoBranches };
    if (e.match(/^\/branches\/(public\/)?\d+$/)) {
      const id = parseInt(e.split('/').pop()!);
      return { branch: demoBranches.find(b => b.id === id) || demoBranches[0] };
    }
    if (e === '/orders' || e === '/orders/' || e === '/customers/orders') return { orders: demoOrders };
    if (e === '/dashboard/stats') return demoStats;
    if (e === '/customers') return { customers: demoCustomers };
    if (e === '/customization/store' || e === '/customization') return { customization: {} };
    if (e === '/settings' || e === '/setup/my-site') return { settings: {} };
  }
  if (method === 'POST') {
    if (e === '/orders' || e === '/customers/orders') return { order: { id: 99, status: 'pending' }, message: 'تم إرسال الطلب بنجاح! سيتم التواصل معك خلال 24 ساعة.' };
    if (e === '/products') return { product: { id: 99 }, message: 'تم إضافة السيارة بنجاح' };
    if (e === '/branches') return { branch: { id: 99 }, message: 'تم إضافة الفرع بنجاح' };
    if (e === '/auth/login') return { token: 'demo-admin-token', user: { id: 1, username: 'admin', role: 'admin' } };
    if (e === '/customers/login') return { token: 'demo-customer-token' };
    if (e === '/customers/register') return { token: 'demo-customer-token' };
  }
  if (method === 'PUT') {
    return { message: 'تم التحديث بنجاح' };
  }
  if (method === 'PATCH') {
    return { message: 'تم التحديث بنجاح' };
  }
  if (method === 'DELETE') {
    return { message: 'تم الحذف بنجاح' };
  }
  return null;
}
