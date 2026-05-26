import apiClient from './apiClient';

export const reorderApi = {
  // GET: api/reorder/suggestions?isCriticalOnly=false&warehouseId=1
  getSuggestions: async ({ isCriticalOnly = false, warehouseId = null } = {}) => {
    const params = { isCriticalOnly };
    if (warehouseId) params.warehouseId = warehouseId;

    const response = await apiClient.get('/reorder/suggestions', { params });
    return response.data; // returns ApiResponse<List<ReorderSuggestionDto>>
  },

  // PUT: api/reorder/suggestions/{id}/action
  markActioned: async (id) => {
    const response = await apiClient.put(`/reorder/suggestions/${id}/action`);
    return response.data; // returns ApiResponse<bool>
  }
};

export default reorderApi;
