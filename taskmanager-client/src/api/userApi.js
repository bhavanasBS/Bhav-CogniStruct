import api from './axiosInstance';

const roleProfileEndpoints = {
  Admin: '/api/admin/profile',
  Manager: '/api/manager/profile',
  TeamLead: '/api/teamlead/profile',
  'Team Lead': '/api/teamlead/profile',
  Employee: '/api/employee/profile',
};

export const userApi = {
  getMe: () => api.get('/api/users/me'),
  getProfileByRole: (role) => api.get(roleProfileEndpoints[role] || '/api/employee/profile'),
  getPublicProfile: (userId) => api.get(`/api/users/${userId}/public-profile`),
  updateProfile: (data) => api.put('/api/users/me/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: (params) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  updateStatus: (id, isActive) => api.patch(`/api/users/${id}/status`, { isActive }),
  updateRoles: (id, roleIds) => api.put(`/api/users/${id}/roles`, { roleIds }),
  getRoles: () => api.get('/api/roles'),
  assignManager: (userId, managerId) => api.put(`/api/users/${userId}/assign-manager`, { managerId }),
  getMyEmployees: () => api.get('/api/users/my-employees'),
};
