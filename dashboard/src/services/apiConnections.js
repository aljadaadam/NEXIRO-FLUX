import api from './api';

export const getApiConnections = async () => {
  try {
    // Contract: GET /api/api-connections
    const response = await api.get('/api/api-connections');
    return { success: true, data: response.data };
  } catch (error) {
    // Fallback (some backends mount under /api already)
    try {
      const response = await api.get('/api-connections');
      return { success: true, data: response.data };
    } catch (fallbackError) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch API connections',
      };
    }
  }
};

export const getApiConnectionServicesGrouped = async (connectionId) => {
  try {
    if (connectionId == null || connectionId === '') {
      return { success: true, data: { groups: [] } };
    }

    // Contract: GET /api/api-connections/{connectionId}/services
    const response = await api.get(`/api/api-connections/${connectionId}/services`);
    return { success: true, data: response.data };
  } catch (error) {
    // Fallback (some backends mount under /api already)
    try {
      const response = await api.get(`/api-connections/${connectionId}/services`);
      return { success: true, data: response.data };
    } catch (fallbackError) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch connection services',
      };
    }
  }
};
