import api from './axiosInstance';

export const reviewApi = {
  // Manager: create a performance review
  create: (data) => api.post('/api/reviews', data),

  // Manager/Admin/TeamLead: get reviews for a specific employee
  getByEmployee: (employeeId) => api.get(`/api/reviews/employee/${employeeId}`),

  // Manager: get all reviews they've submitted
  getTeamReviews: () => api.get('/api/reviews/team'),

  // Employee: get own reviews
  getMyReviews: () => api.get('/api/reviews/mine'),
};
