import api from './axiosInstance';

export const managerApi = {
  // Search managers by name, email, department
  search: (query) => api.get('/api/managers/search', { params: { q: query } }),

  // Get dashboard for specific manager by ID
  getDashboard: (id) => api.get(`/api/managers/${id}/dashboard`),

  // Get dashboard for current authenticated user (manager)
  getMyDashboard: () => api.get('/api/managers/my-dashboard'),

  // Get hierarchy tree for manager
  getHierarchy: (id) => api.get(`/api/managers/${id}/hierarchy`),

  // Get detailed team reports for manager
  getTeamReport: (id) => api.get(`/api/managers/${id}/team-report`),

  // Get team members for current manager
  getMyTeam: () => api.get('/api/managers/my-team'),

  // Get team members by manager ID
  getTeamMembers: (id) => api.get(`/api/managers/${id}/team-members`),
};
