import apiClient from './apiClient';

export const userApi = {
  getPendingUsers: async () => {
    const response = await apiClient.get('/users/pending');
    return response.data;
  },

  approveUser: async (payload) => {
    // payload: { userId, role, warehouseId }
    const formData = new FormData();
    formData.append('userId', payload.userId);
    formData.append('role', payload.role);
    if (payload.warehouseId) {
      formData.append('warehouseId', payload.warehouseId);
    }
    const response = await apiClient.put('/users/approve', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getManagers: async () => {
    const response = await apiClient.get('/users/managers');
    return response.data;
  },

  reassignManager: async (warehouseId, managerId) => {
    const response = await apiClient.patch('/users/reassign-manager', { warehouseId, managerId });
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  toggleStatus: async (userId, isActive) => {
    const response = await apiClient.patch('/users/toggle-status', { userId, isActive });
    return response.data;
  }
};
