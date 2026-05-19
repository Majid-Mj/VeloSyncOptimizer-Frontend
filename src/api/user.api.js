import apiClient from './apiClient';

export const userApi = {
  getPendingUsers: async () => {
    const response = await apiClient.get('/users/pending');
    return response.data;
  },

  approveUser: async (payload) => {
    // payload: { userId, role, warehouseId }
    const response = await apiClient.put('/users/approve', payload);
    return response.data;
  },

  getManagers: async () => {
    const response = await apiClient.get('/users/managers');
    return response.data;
  },

  reassignManager: async (warehouseId, managerId) => {
    const response = await apiClient.patch('/users/reassign-manager', { warehouseId, managerId });
    return response.data;
  }
};
