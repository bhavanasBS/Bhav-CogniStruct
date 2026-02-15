import api from './axiosInstance';

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  refreshToken: (data) => api.post('/api/auth/refresh-token', data),
  getMe: () => api.get('/api/users/me'),
};
