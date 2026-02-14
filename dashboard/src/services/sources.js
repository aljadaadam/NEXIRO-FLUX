import api from './api';

/**
 * الحصول على جميع المصادر
 */
export const getAllSources = async () => {
  try {
    const response = await api.get('/sources');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching sources:', error);
    return { success: false, error: error.message };
  }
};

/**
 * إضافة مصدر جديد
 */
export const createSource = async (sourceData) => {
  try {
    console.log('📤 Creating source:', sourceData);
    const response = await api.post('/sources', sourceData);
    console.log('✅ Source created:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error creating source:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data?.error || error.message 
    };
  }
};

/**
 * تحديث مصدر موجود
 */
export const updateSource = async (sourceId, sourceData) => {
  try {
    console.log('📤 Updating source:', sourceId, sourceData);
    const response = await api.put(`/sources/${sourceId}`, sourceData);
    console.log('✅ Source updated:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error updating source:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message
    };
  }
};

/**
 * حذف مصدر
 */
export const deleteSource = async (sourceId) => {
  try {
    if (!sourceId) {
      return { success: false, error: 'Missing source id' };
    }
    const response = await api.delete(`/sources/${sourceId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error deleting source:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message,
    };
  }
};

/**
 * تفعيل/تعطيل مصدر
 */
export const toggleSourceStatus = async (sourceId, enabled) => {
  try {
    const response = await api.patch(`/sources/${sourceId}/status`, { enabled });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error toggling source status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * اختبار اتصال المصدر
 */
export const testSourceConnection = async (sourceId) => {
  try {
    const response = await api.post(`/sources/${sourceId}/test`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error testing source connection:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

/**
 * مزامنة المنتجات من مصدر محدد
 */
export const syncSourceProducts = async (sourceId, options = {}) => {
  try {
    const response = await api.post(`/sources/${sourceId}/sync`, options);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error syncing source products:', error);
    return { success: false, error: error.message };
  }
};

/**
 * الحصول على إحصائيات المصدر
 */
export const getSourceStats = async (sourceId) => {
  try {
    const response = await api.get(`/sources/${sourceId}/stats`);
    return { success: true, data: response.data };
  } catch (error) {
    const status = error.response?.status;
    // Many backends don't implement /stats yet; 404 is expected.
    if (status !== 404) {
      console.error('Error fetching source stats:', error);
    }
    return {
      success: false,
      status,
      error: error.response?.data?.message || error.response?.data?.error || error.message,
    };
  }
};

/**
 * تطبيق نسبة الربح على جميع منتجات المصدر
 */
export const applyProfitMargin = async (sourceId, profitPercentage) => {
  try {
    const response = await api.post(`/sources/${sourceId}/apply-profit`, {
      profitPercentage,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error applying profit margin:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message,
      details: error.response?.data,
    };
  }
};

/**
 * استيراد منتجات من مصدر خارجي
 */
export const importFromSource = async (sourceId) => {
  try {
    const response = await api.post(`/sources/${sourceId}/import`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error importing from source:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    };
  }
};

/**
 * الحصول على خدمات المصدر مجمعة حسب المجموعات
 */
export const getSourceServicesGrouped = async (sourceId) => {
  try {
    if (sourceId == null || sourceId === '') {
      return { success: true, data: { groups: [] } };
    }

    // Try main endpoint
    const response = await api.get(`/sources/${sourceId}/services`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching source services:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch services',
    };
  }
};
