import api from './axiosInstance';

export const activityApi = {
  getActivity: (taskId) => api.get(`/api/tasks/${taskId}/activity`),
};
