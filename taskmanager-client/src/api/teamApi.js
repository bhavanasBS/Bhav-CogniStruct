import api from './axiosInstance';

export const teamApi = {
  getAll: (params) => api.get('/api/teams', { params }),
  getById: (id) => api.get(`/api/teams/${id}`),
  create: (data) => api.post('/api/teams', data),
  update: (id, data) => api.put(`/api/teams/${id}`, data),
  addMember: (teamId, userId) => api.post(`/api/teams/${teamId}/members`, { userId }),
  removeMember: (teamId, userId) => api.delete(`/api/teams/${teamId}/members/${userId}`),
  getMembers: (teamId) => api.get(`/api/teams/${teamId}/members`),
  getHierarchy: (managerId) => api.get(`/api/teams/hierarchy/${managerId}`),
  getFullHierarchy: () => api.get('/api/teams/hierarchy'),
  managerSearch: (query) => api.get('/api/teams/manager-search', { params: { q: query } }),
};
