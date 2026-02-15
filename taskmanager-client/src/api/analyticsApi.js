import api from './axiosInstance';

export const analyticsApi = {
  getCompletionRate: (params) => api.get('/api/analytics/completion-rate', { params }),
  getAvgCompletionTime: (params) => api.get('/api/analytics/avg-completion-time', { params }),
  getProductivityScores: (params) => api.get('/api/analytics/productivity-scores', { params }),
  getTeamComparison: () => api.get('/api/analytics/team-comparison'),
  getWeeklyProductivity: (userId) => api.get(`/api/analytics/weekly-productivity/${userId}`),
  getTaskDistribution: (params) => api.get('/api/analytics/task-distribution', { params }),
};
