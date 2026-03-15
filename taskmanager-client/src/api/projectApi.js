import api from './axiosInstance';

export const projectApi = {
  // Get all projects for current manager
  getAll: () => api.get('/api/projects'),

  // Get project by ID
  getById: (id) => api.get(`/api/projects/${id}`),

  // Create a new project
  create: (data) => api.post('/api/projects', data),

  // Update project
  update: (id, data) => api.put(`/api/projects/${id}`, data),

  // Get project members
  getMembers: (id) => api.get(`/api/projects/${id}/members`),

  // Add members to project
  addMembers: (id, userIds) => api.post(`/api/projects/${id}/members`, { userIds }),

  // Remove member from project
  removeMember: (id, userId) => api.delete(`/api/projects/${id}/members/${userId}`),

  // Get employees not in project
  getEligibleEmployees: (id) => api.get(`/api/projects/${id}/eligible-employees`),
};
