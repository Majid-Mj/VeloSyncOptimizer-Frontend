import apiClient from './apiClient';

export const reportsApi = {
  // GET: api/reports/analytics?warehouseId=...&days=...
  getReportsData: async ({ warehouseId = null, days = 30 } = {}) => {
    const params = { days };
    if (warehouseId) params.warehouseId = warehouseId;

    const response = await apiClient.get('/reports/analytics', { params });
    return response.data; // returns ApiResponse<ReportsDataResponse>
  }
};

export default reportsApi;
