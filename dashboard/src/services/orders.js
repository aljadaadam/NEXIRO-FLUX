import api from './api';

/**
 * الحصول على جميع الطلبات
 */
export const getAllOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.user_email) params.append('user_email', filters.user_email);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * الحصول على تفاصيل طلب معين
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return { success: false, error: error.message };
  }
};

/**
 * إرجاع الرصيد للطلب الفاشل
 */
export const refundOrder = async (orderId) => {
  try {
    const response = await api.post(`/orders/${orderId}/refund`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error refunding order:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data?.error || error.message 
    };
  }
};

/**
 * إعادة محاولة الطلب الفاشل
 */
export const retryOrder = async (orderId) => {
  try {
    const response = await api.post(`/orders/${orderId}/retry`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error retrying order:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data?.error || error.message 
    };
  }
};

/**
 * إحصائيات الطلبات
 */
export const getOrdersStats = async () => {
  try {
    const response = await api.get('/orders/stats');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching orders stats:', error);
    return { success: false, error: error.message };
  }
};
