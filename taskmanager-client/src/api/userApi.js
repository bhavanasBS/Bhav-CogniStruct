import api from './axiosInstance';

export const userApi = {
  getAll: (params) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  updateStatus: (id, isActive) => api.patch(`/api/users/${id}/status`, { isActive }),
  updateRoles: (id, roleIds) => api.put(`/api/users/${id}/roles`, { roleIds }),
  getRoles: () => api.get('/api/roles'),
};
