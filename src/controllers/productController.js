const Product = require('../models/Product');

// جلب جميع منتجات الموقع
async function getAllProducts(req, res) {
  try {
    const { site_key } = req.user;
    
    // Get products with source information
    const { getPool } = require('../config/db');
    const pool = getPool();
    const [products] = await pool.query(
      `SELECT p.*, s.id as source_id, s.name as source_name, s.url as source_url
       FROM products p
       LEFT JOIN sources s ON p.source_id = s.id
       WHERE p.site_key = ?
       ORDER BY p.created_at DESC`,
      [site_key]
    );
    
    // Transform products to include customPrice field and parse JSON fields for dashboard compatibility
    const transformedProducts = products.map(p => {
      // Parse JSON fields if they are strings
      let customJson = null;
      let requiresCustomJson = null;
      let rawJson = null;
      
      try {
        if (p.custom_json && typeof p.custom_json === 'string') {
          customJson = JSON.parse(p.custom_json);
        } else if (p.custom_json && typeof p.custom_json === 'object') {
          customJson = p.custom_json;
        }
      } catch (e) {
        console.error('Error parsing custom_json for product', p.id, e);
      }
      
      try {
        if (p.requires_custom_json && typeof p.requires_custom_json === 'string') {
          requiresCustomJson = JSON.parse(p.requires_custom_json);
        } else if (p.requires_custom_json && typeof p.requires_custom_json === 'object') {
          requiresCustomJson = p.requires_custom_json;
        }
      } catch (e) {
        console.error('Error parsing requires_custom_json for product', p.id, e);
      }
      
      try {
        if (p.raw_json && typeof p.raw_json === 'string') {
          rawJson = JSON.parse(p.raw_json);
        } else if (p.raw_json && typeof p.raw_json === 'object') {
          rawJson = p.raw_json;
        }
      } catch (e) {
        console.error('Error parsing raw_json for product', p.id, e);
      }
      
      return {
        ...p,
        customPrice: p.is_custom_price === 1 ? p.price : null,
        custom_json: customJson,
        requires_custom_json: requiresCustomJson,
        raw_json: rawJson,
        // Add customFields array for dashboard compatibility
        customFields: requiresCustomJson || [],
        // Add source information for dashboard
        source: p.source_id ? {
          id: p.source_id,
          name: p.source_name,
          url: p.source_url
        } : null
      };
    });
    
    res.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب المنتجات' 
    });
  }
}

// إنشاء منتج جديد
async function createProduct(req, res) {
  try {
    const { site_key } = req.user;
    const { name, description, price, service_type } = req.body;

    // التحقق من المدخلات
    if (!name || !price) {
      return res.status(400).json({ 
        error: 'الاسم والسعر مطلوبان' 
      });
    }

    // التحقق من أن السعر رقم موجب
    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({ 
        error: 'السعر يجب أن يكون رقم موجب' 
      });
    }

    const product = await Product.create({
      site_key,
      name,
      description: description || '',
      price: parseFloat(price),
      service_type: service_type || 'SERVER'
    });

    res.status(201).json({
      message: 'تم إنشاء المنتج بنجاح',
      product
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء إنشاء المنتج' 
    });
  }
}

// تحديث منتج
async function updateProduct(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    
    // دعم تنسيقات مختلفة من Dashboard
    const name = req.body.name || req.body.SERVICENAME || req.body.servicename;
    const price = req.body.price || req.body.CREDIT || req.body.credit;
    const description = req.body.description || '';
    const service_type = req.body.service_type || req.body.SERVICETYPE || 'SERVER';
    const source_id = req.body.source_id !== undefined ? req.body.source_id : undefined;

    // التحقق من المدخلات
    if (!name || !price) {
      return res.status(400).json({ 
        error: 'الاسم والسعر مطلوبان' 
      });
    }

    // التحقق من أن السعر رقم موجب
    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({ 
        error: 'السعر يجب أن يكون رقم موجب' 
      });
    }

    const updateData = {
      name,
      description: description || '',
      price: parseFloat(price),
      service_type
    };
    
    // Add source_id if provided (can be null to unlink from source)
    if (source_id !== undefined) {
      updateData.source_id = source_id === null || source_id === 'null' || source_id === '' ? null : parseInt(source_id);
    }

    const product = await Product.update(id, site_key, updateData);

    if (!product) {
      return res.status(404).json({ 
        error: 'المنتج غير موجود أو ليس لديك صلاحية لتعديله' 
      });
    }

    res.json({
      message: 'تم تحديث المنتج بنجاح',
      product
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تحديث المنتج' 
    });
  }
}

// حذف منتج
async function deleteProduct(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    
    const deleted = await Product.delete(id, site_key);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: 'المنتج غير موجود أو ليس لديك صلاحية لحذفه' 
      });
    }

    res.json({ 
      message: 'تم حذف المنتج بنجاح' 
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء حذف المنتج' 
    });
  }
}

// ============================================
// 1️⃣ IMPORT (استيراد من مصدر خارجي)
// ============================================
// الهدف: استقبال منتجات جاهزة من Dashboard وحفظها في Backend
// الطريقة: Dashboard يعد البيانات ويرسلها جاهزة
// Request Body: { products: [{name, price, description, service_type}, ...] }
// مثال الاستخدام: Dashboard يقرأ من ملف أو form ويرسل البيانات للـ Backend
async function importProducts(req, res) {
  try {
    const { site_key } = req.user;
    const { products } = req.body;

    // التحقق من وجود المنتجات
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        error: 'يجب إرسال مصفوفة منتجات صالحة' 
      });
    }

    const results = {
      success: [],
      failed: [],
      total: products.length
    };

    // استيراد كل منتج
    for (const productData of products) {
      try {
        const { name, description, price } = productData;

        // التحقق من البيانات الأساسية
        if (!name || !price) {
          results.failed.push({
            product: productData,
            error: 'الاسم والسعر مطلوبان'
          });
          continue;
        }

        // التحقق من السعر
        if (isNaN(price) || parseFloat(price) <= 0) {
          results.failed.push({
            product: productData,
            error: 'السعر يجب أن يكون رقم موجب'
          });
          continue;
        }

        // إنشاء المنتج
        const product = await Product.create({
          site_key,
          name,
          description: description || '',
          price: parseFloat(price)
        });

        results.success.push(product);
      } catch (error) {
        results.failed.push({
          product: productData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `تم استيراد ${results.success.length} من ${results.total} منتج بنجاح`,
      results: {
        imported: results.success.length,
        failed: results.failed.length,
        total: results.total,
        successProducts: results.success,
        failedProducts: results.failed
      }
    });
  } catch (error) {
    console.error('Error in importProducts:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء استيراد المنتجات' 
    });
  }
}

// ============================================
// 2️⃣ SYNC (استيراد من أي API خارجي عام)
// ============================================
// الهدف: جلب منتجات من API خارجي والتعامل معها بذكاء
// الطريقة: Backend يتصل بـ API الخارجي، يستخرج البيانات، ويحفظها
// Request Body: { url, apiKey } أو { sourceUrl, apiKey }
// يدعم:
//   - unlock-world.net (مع استخراج المجموعات)
//   - FakeStoreAPI (products/data)
//   - أي API آخر (مع parsing ذكي)
// مثال الاستخدام: Dashboard يرسل رابط API ونحن نتولى الباقي
async function syncProducts(req, res) {
  try {
    const { site_key } = req.user;
    
    // دعم تنسيقات مختلفة من Dashboard
    const sourceUrl = req.body.sourceUrl || req.body.url;
    const apiKey = req.body.apiKey || req.body.apiaccesskey || req.body.key;

    console.log('📥 Sync request:', { sourceUrl, hasApiKey: !!apiKey });

    // التحقق من المدخلات
    if (!sourceUrl) {
      return res.status(400).json({ 
        error: 'عنوان API المصدر مطلوب (sourceUrl أو url)' 
      });
    }

    // محاولة جلب البيانات من API الخارجي
    let externalData;
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // إضافة API Key إذا كان موجوداً
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      console.log('🔄 Fetching from:', sourceUrl);
      const response = await fetch(sourceUrl, { 
        headers,
        timeout: 10000 // 10 seconds timeout
      });

      if (!response.ok) {
        return res.status(400).json({ 
          error: `فشل الاتصال بالـ API الخارجي: ${response.statusText}` 
        });
      }

      externalData = await response.json();
      console.log('✅ Response received, processing...');
    } catch (error) {
      console.error('❌ Sync error:', error);
      return res.status(400).json({ 
        error: `خطأ في الاتصال بالـ API الخارجي: ${error.message}` 
      });
    }

    // معالجة البيانات حسب التنسيق
    let externalProducts = [];
    let groupName = 'General'; // اسم مجموعة افتراضي

    // تنسيق 1: مصفوفة مباشرة من المنتجات
    if (Array.isArray(externalData)) {
      externalProducts = externalData;
    }
    // تنسيق 2: كائن يحتوي على products/data/services
    else if (externalData.products) {
      externalProducts = externalData.products;
    } else if (externalData.data) {
      externalProducts = externalData.data;
    } else if (externalData.services) {
      externalProducts = externalData.services;
    }
    // تنسيق 3: unlock-world.net style مع groups
    else if (externalData.SERVICELIST && Array.isArray(externalData.SERVICELIST)) {
      // معالجة قائمة الخدمات مع المجموعات
      const processed = [];
      for (const group of externalData.SERVICELIST) {
        if (group.GROUPNAME && group.SERVICES) {
          for (const serviceId in group.SERVICES) {
            const service = group.SERVICES[serviceId];
            processed.push({
              ...service,
              GROUPNAME: group.GROUPNAME,
              GROUPTYPE: group.GROUPTYPE,
              _group: group.GROUPNAME // حقل منفصل لاستخراج المجموعة
            });
          }
        }
      }
      externalProducts = processed;
    }
    // تنسيق 4: آخر - محاولة استخراج جميع القيم
    else {
      // جعل externalData مصفوفة إذا كانت كائن واحد
      externalProducts = Object.values(externalData).find(val => Array.isArray(val)) || [];
    }

    if (!Array.isArray(externalProducts) || externalProducts.length === 0) {
      return res.status(400).json({ 
        error: 'لم يتم العثور على منتجات في الاستجابة',
        receivedFormat: typeof externalData,
        keys: Object.keys(externalData || {}).slice(0, 5)
      });
    }

    console.log(`📦 Found ${externalProducts.length} products to sync`);

    const results = {
      synced: [],
      failed: [],
      total: externalProducts.length,
      groups: {} // تتبع المجموعات
    };

    // مزامنة كل منتج
    for (const extProduct of externalProducts) {
      try {
        // استخراج اسم المجموعة بأولوية
        const currentGroup = extProduct._group || 
                            extProduct.GROUPNAME || 
                            extProduct.groupName || 
                            extProduct.group || 
                            'General';
        
        // استخراج اسم المنتج
        const name = extProduct.name || 
                    extProduct.SERVICENAME || 
                    extProduct.servicename || 
                    extProduct.title || 
                    extProduct.product_name;
        
        // استخراج السعر
        const price = extProduct.price || 
                     extProduct.CREDIT || 
                     extProduct.credit || 
                     extProduct.cost || 
                     extProduct.amount;
        
        // استخراج الوصف
        const description = extProduct.description || 
                           extProduct.INFO || 
                           extProduct.info || 
                           extProduct.desc || '';
        
        // استخراج النوع
        const service_type = extProduct.service_type || 
                            extProduct.SERVICETYPE || 
                            extProduct.GROUPTYPE || 
                            'SERVER';

        if (!name || !price) {
          results.failed.push({
            product: extProduct,
            error: 'بيانات غير كاملة (اسم أو سعر مفقود)',
            group: currentGroup
          });
          continue;
        }

        // بناء الوصف النهائي مع اسم المجموعة
        let fullDescription = '';
        if (currentGroup && currentGroup !== 'General') {
          fullDescription += `المجموعة: ${currentGroup}\n`;
        }
        if (description) {
          fullDescription += description;
        }

        // إنشاء المنتج
        const product = await Product.create({
          site_key,
          name,
          description: fullDescription.trim() || 'لا يوجد وصف',
          price: parseFloat(price),
          service_type
        });

        // تتبع المجموعات
        if (!results.groups[currentGroup]) {
          results.groups[currentGroup] = 0;
        }
        results.groups[currentGroup]++;

        results.synced.push(product);
        console.log(`✅ Synced: ${name} (${currentGroup})`);
      } catch (error) {
        results.failed.push({
          product: extProduct,
          error: error.message
        });
      }
    }

    // بناء الرسالة النهائية
    const groupSummary = Object.entries(results.groups)
      .map(([group, count]) => `${group}: ${count}`)
      .join(', ');

    res.json({
      message: `تمت مزامنة ${results.synced.length} من ${results.total} منتج بنجاح`,
      results: {
        synced: results.synced.length,
        failed: results.failed.length,
        total: results.total,
        groupsSummary: groupSummary,
        groups: results.groups,
        syncedProducts: results.synced.slice(0, 10), // أول 10 منتجات فقط
        failedProducts: results.failed
      }
    });
  } catch (error) {
    console.error('Error in syncProducts:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء المزامنة' 
    });
  }
}

// ============================================
// 3️⃣ IMPORT/SD-UNLOCKER (استيراد متخصص من SD-Unlocker)
// ============================================
// الهدف: استيراد متخصص من SD-Unlocker API مع معالجة خاصة بتنسيقها
// الطريقة: Backend يتصل بـ SD-Unlocker، يستخرج SERVICELIST، ويحفظها
// Request Body: { apiConfig: {url, username, apiaccesskey, action, ...} }
// التنسيق المتوقع: SUCCESS[0].LIST.GroupName.SERVICES.serviceId
// مثال الاستخدام: متخصص لـ SD-Unlocker API فقط
async function importFromExternalApi(req, res) {
  try {
    const { site_key } = req.user;
    const { apiConfig } = req.body;

    console.log('📥 Import from external API request:', apiConfig);

    // التحقق من وجود apiConfig
    if (!apiConfig || !apiConfig.url) {
      return res.status(400).json({ 
        error: 'يجب إرسال بيانات API صالحة (apiConfig)' 
      });
    }

    // إعداد البيانات للإرسال للـ API الخارجي
    const apiRequestData = {
      username: apiConfig.username,
      apiaccesskey: apiConfig.apiaccesskey,
      requestformat: apiConfig.requestformat || 'JSON',
      action: apiConfig.action || 'imeiservicelist'
    };

    console.log('🔄 Fetching from external API:', apiConfig.url);
    console.log('📤 Request data:', apiRequestData);

    // محاولة جلب البيانات من API الخارجي
    let externalResponse;
    try {
      const response = await fetch(apiConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(apiRequestData).toString(),
        timeout: 30000 // 30 seconds timeout
      });

      if (!response.ok) {
        return res.status(400).json({ 
          error: `فشل الاتصال بالـ API الخارجي: ${response.statusText}` 
        });
      }

      externalResponse = await response.json();
      console.log('✅ External API response received:', Object.keys(externalResponse));

    } catch (error) {
      console.error('❌ External API error:', error);
      return res.status(400).json({ 
        error: `خطأ في الاتصال بالـ API الخارجي: ${error.message}` 
      });
    }

    // معالجة استجابة SD-Unlocker API
    let products = [];
    
    // التنسيق الفعلي لـ SD-Unlocker:
    // { SUCCESS: [{ MESSAGE: "...", LIST: { GroupName: { SERVICES: { id: {...} } } } }] }
    if (externalResponse.SUCCESS && Array.isArray(externalResponse.SUCCESS)) {
      const successResponse = externalResponse.SUCCESS[0];
      if (successResponse && successResponse.LIST) {
        // استخراج جميع الخدمات من جميع المجموعات
        const groups = Object.values(successResponse.LIST);
        
        for (const group of groups) {
          if (group.SERVICES) {
            const services = Object.values(group.SERVICES);
            products.push(...services.map(service => ({
              ...service,
              GROUPNAME: group.GROUPNAME,
              GROUPTYPE: group.GROUPTYPE
            })));
          }
        }
        
        console.log(`📦 Found ${products.length} services from SD-Unlocker`);
      }
    } else if (externalResponse.SERVICELIST && Array.isArray(externalResponse.SERVICELIST)) {
      products = externalResponse.SERVICELIST;
      console.log(`📦 Found ${products.length} services from SERVICELIST format`);
    } else if (externalResponse.services && Array.isArray(externalResponse.services)) {
      products = externalResponse.services;
    } else if (Array.isArray(externalResponse)) {
      products = externalResponse;
    }
    
    if (products.length === 0) {
      return res.status(400).json({ 
        error: 'لم يتم العثور على منتجات في استجابة API',
        receivedFormat: Object.keys(externalResponse).join(', ')
      });
    }

    const results = {
      imported: [],
      failed: [],
      total: products.length
    };

    // استيراد كل منتج
    for (const extProduct of products) {
      try {
        // تطبيع البيانات من SD-Unlocker format
        const name = extProduct.SERVICENAME || extProduct.servicename || extProduct.name;
        const description = extProduct.INFO || extProduct.DESCRIPTION || extProduct.description || '';
        const price = parseFloat(extProduct.CREDIT || extProduct.PRICE || extProduct.price || extProduct.SERVICECREDITS || 0);
        const serviceId = extProduct.SERVICEID || extProduct.serviceid || extProduct.id;
        const groupName = extProduct.GROUPNAME || '';
        const time = extProduct.TIME || '';

        if (!name) {
          results.failed.push({
            product: extProduct,
            error: 'اسم المنتج مفقود'
          });
          continue;
        }

        if (!price || price <= 0) {
          results.failed.push({
            product: extProduct,
            error: 'السعر غير صالح'
          });
          continue;
        }

        // استخراج service_type
        const serviceType = extProduct.SERVICETYPE || extProduct.servicetype || 'SERVER';
        
        // إنشاء وصف شامل
        let fullDescription = '';
        if (groupName) fullDescription += `المجموعة: ${groupName}\n`;
        if (time) fullDescription += `الوقت: ${time}\n`;
        if (description) fullDescription += `${description}\n`;
        if (serviceId) fullDescription += `معرف الخدمة: ${serviceId}`;

        // إنشاء المنتج
        const product = await Product.create({
          site_key,
          name,
          description: fullDescription.trim() || 'لا يوجد وصف',
          price,
          service_type: serviceType
        });

        results.imported.push(product);
      } catch (error) {
        console.error('❌ Error importing product:', error);
        results.failed.push({
          product: extProduct,
          error: error.message
        });
      }
    }

    console.log(`✅ Import completed: ${results.imported.length}/${results.total} successful`);

    res.json({
      message: `تم استيراد ${results.imported.length} من ${results.total} منتج بنجاح`,
      results: {
        imported: results.imported.length,
        failed: results.failed.length,
        total: results.total,
        importedProducts: results.imported,
        failedProducts: results.failed.slice(0, 5) // أول 5 أخطاء فقط
      },
      source: apiConfig.sourceName || 'External API'
    });
  } catch (error) {
    console.error('❌ Error in importFromExternalApi:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء الاستيراد من API الخارجي',
      details: error.message
    });
  }
}

// إحصائيات المنتجات
async function getProductsStats(req, res) {
  try {
    const { site_key } = req.user;
    const products = await Product.findBySiteKey(site_key);
    
    const stats = {
      total: products.length,
      totalValue: products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0),
      averagePrice: products.length > 0 
        ? products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / products.length 
        : 0,
      highestPrice: products.length > 0 
        ? Math.max(...products.map(p => parseFloat(p.price || 0))) 
        : 0,
      lowestPrice: products.length > 0 
        ? Math.min(...products.map(p => parseFloat(p.price || 0))) 
        : 0
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error in getProductsStats:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب الإحصائيات' 
    });
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  syncProducts,
  importFromExternalApi,
  getProductsStats
};