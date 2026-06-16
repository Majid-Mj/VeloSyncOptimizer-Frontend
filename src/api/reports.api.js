import apiClient from './apiClient';

const reportsApi = {
  // Main tab-based endpoint — calls sp_GetReports via QueryMultiple
  getTabReport: async ({ reportType = 'Overview', days = 30, warehouseId = null } = {}) => {
    const params = { reportType, days };
    if (warehouseId) params.warehouseId = warehouseId;
    const response = await apiClient.get('/reports', { params });
    return response.data;
  },

  // Legacy — kept so any existing calls still work
  getReportsData: async ({ warehouseId = null, days = 30 } = {}) => {
    const params = { reportType: 'Overview', days };
    if (warehouseId) params.warehouseId = warehouseId;
    const response = await apiClient.get('/reports', { params });
    return response.data;
  },
};

export default reportsApi;
