import api from './axiosInstance';

export const teamApi = {
  // Get all teams (Admin sees all, Manager sees own)
  getAll: (search) => api.get('/api/teams', { params: { search } }),

  // Get teams the current user is a member of
  getMyTeams: () => api.get('/api/teams/my-team'),

  // Get team by ID (includes members)
  getById: (id) => api.get(`/api/teams/${id}`),

  // Create a new team
  create: (data) => api.post('/api/teams', data),

  // Update a team
  update: (id, data) => api.put(`/api/teams/${id}`, data),

  // Delete a team
  delete: (id) => api.delete(`/api/teams/${id}`),

  // Get members of a team
  getMembers: (teamId) => api.get(`/api/teams/${teamId}/members`),

  // Add a member to a team
  addMember: (teamId, userId) => api.post(`/api/teams/${teamId}/members`, { userId }),

  // Remove a member from a team
  removeMember: (teamId, userId) => api.delete(`/api/teams/${teamId}/members/${userId}`),

  // Get users available to add to a team
  getAvailableUsers: (teamId, search) => api.get(`/api/teams/${teamId}/available-users`, { params: { search } }),

  // Get organization hierarchy
  getHierarchy: () => api.get('/api/teams/hierarchy'),
};
