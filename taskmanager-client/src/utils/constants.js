export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  TEAM_LEAD: 'TeamLead',
  EMPLOYEE: 'Employee',
  HR: 'HR',
};

export const TASK_STATUS = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  OVERDUE: 3,
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Pending',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.OVERDUE]: 'Overdue',
};

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.PENDING]: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  [TASK_STATUS.IN_PROGRESS]: { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500' },
  [TASK_STATUS.COMPLETED]: { bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  [TASK_STATUS.OVERDUE]: { bg: 'bg-danger-50', text: 'text-danger-700', dot: 'bg-danger-500' },
};

export const TASK_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
};

export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: { bg: 'bg-slate-100', text: 'text-slate-600' },
  [TASK_PRIORITY.MEDIUM]: { bg: 'bg-warning-100', text: 'text-warning-700' },
  [TASK_PRIORITY.HIGH]: { bg: 'bg-danger-100', text: 'text-danger-700' },
};

export const NOTIFICATION_TYPES = {
  INFO: 0,
  TASK_ASSIGNED: 1,
  DEADLINE_REMINDER: 2,
  TASK_OVERDUE: 3,
  MANAGER_ALERT: 4,
};

export const PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
