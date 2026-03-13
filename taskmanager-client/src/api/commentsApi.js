import api from './axiosInstance';

export const commentsApi = {
  getComments: (taskId) => api.get(`/api/tasks/${taskId}/comments`),
  createComment: (taskId, message) => api.post(`/api/tasks/${taskId}/comments`, { message }),
};
