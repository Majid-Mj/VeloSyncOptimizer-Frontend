import apiClient from './apiClient';

const dashboardApi = {
  getPayload: async () => {
    try {
      const response = await apiClient.get('/dashboard/payload');
      return response;
    } catch (error) {
      console.error('Failed to fetch dashboard payload', error);
      throw error;
    }
  }
};

export default dashboardApi;
