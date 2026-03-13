import api from './axiosInstance';

export const feedbackApi = {
  submit: (data) => api.post('/api/feedback/task', data),
  getByEmployee: (employeeId) => api.get(`/api/feedback/employee/${employeeId}`),
};
