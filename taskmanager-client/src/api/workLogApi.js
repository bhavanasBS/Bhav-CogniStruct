import api from './axiosInstance';

export const workLogApi = {
  create: (data) => api.post('/api/worklogs', data),
  getByTask: (taskId) => api.get(`/api/worklogs/task/${taskId}`),
  getByEmployee: (userId, params) => api.get(`/api/worklogs/employee/${userId}`, { params }),
  getByTeam: (managerId) => api.get(`/api/worklogs/team/${managerId}`),
  getSummary: (userId, params) => api.get(`/api/worklogs/employee/${userId}/summary`, { params }),
  getWeekly: (userId) => api.get(`/api/worklogs/employee/${userId}/weekly`),
  update: (id, data) => api.put(`/api/worklogs/${id}`, data),
  delete: (id) => api.delete(`/api/worklogs/${id}`),
};
