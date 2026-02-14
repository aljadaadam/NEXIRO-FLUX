import api from './api';

// استيراد المنتجات من API الخارجي
export const fetchExternalProducts = async () => {
  try {
    const response = await api.get('/products/external/fetch');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch external products'
    };
  }
};

// جلب جميع المنتجات من قاعدة البيانات
export const getAllProducts = async () => {
  try {
    const response = await api.get('/products');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch products'
    };
  }
};

// تحديث منتج معين
export const updateProduct = async (serviceId, updates) => {
  try {
    console.log('📡 Sending PUT request:', {
      url: `/products/${serviceId}`,
      serviceId,
      updates
    });
    const response = await api.put(`/products/${serviceId}`, updates);
    console.log('✅ API Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update product'
    };
  }
};

// تحديث مجموعة كاملة
export const updateGroup = async (groupName, updates) => {
  try {
    const response = await api.put(`/products/group/${groupName}`, updates);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update group'
    };
  }
};

// تفعيل/إيقاف منتج
export const toggleProductStatus = async (serviceId, enabled) => {
  try {
    const response = await api.patch(`/products/${serviceId}/status`, { enabled });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to toggle product status'
    };
  }
};

// استيراد منتجات من مصدر خارجي (sd-unlocker, unlock-world, etc.)
export const importFromExternalSource = async (sourceConfig) => {
  try {
    console.log('📤 Importing from external source:', sourceConfig);
    const payload = {
      sourceUrl: sourceConfig.url,
      username: sourceConfig.username,
      apiKey: sourceConfig.apikey,
      ...(sourceConfig.cookie ? { cookie: sourceConfig.cookie } : {})
    };
    const response = await api.post('/products/import-external', payload);
    console.log('✅ Import result:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Import error:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Failed to import from external source'
    };
  }
};

// مزامنة المنتجات (تحديث من الباك ايند → Dashboard)
export const syncProducts = async () => {
  try {
    const response = await api.get('/products');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to sync products'
    };
  }
};

// حذف منتج
export const deleteProduct = async (serviceId) => {
  try {
    const response = await api.delete(`/products/${serviceId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete product'
    };
  }
};

// جلب إحصائيات المنتجات
export const getProductsStats = async () => {
  try {
    const response = await api.get('/products/stats');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stats'
    };
  }
};

// استيراد منتجات من مصدر خارجي
export const importProducts = async (products) => {
  try {
    const response = await api.post('/products/import', { products });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to import products'
    };
  }
};

// حفظ إعدادات API الخارجي
export const saveApiConfig = async (config) => {
  try {
    const response = await api.post('/products/api-config', config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to save API config'
    };
  }
};

// جلب إعدادات API الخارجي
export const getApiConfig = async () => {
  try {
    const response = await api.get('/products/api-config');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch API config'
    };
  }
};

// جلب جميع الخدمات المتاحة من المصدر المحدد
export const getSourceServices = async (sourceId) => {
  try {
    const response = await api.get(`/sources/${sourceId}/services`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch source services'
    };
  }
};
