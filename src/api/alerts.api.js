import apiClient from './apiClient';

export const alertsApi = {
  // GET: api/alerts?warehouseId=1&unreadOnly=true
  getAlerts: async ({ warehouseId = null, unreadOnly = false } = {}) => {
    const params = {};
    if (warehouseId) params.warehouseId = warehouseId;
    params.unreadOnly = unreadOnly;

    const response = await apiClient.get('/alerts', { params });
    return response.data; // returns ApiResponse<List<StockAlertDto>>
  }
};

export default alertsApi;
