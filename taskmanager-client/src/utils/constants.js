export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  TEAM_LEAD: 'TeamLead',
  EMPLOYEE: 'Employee',
};

// Backend-aligned statuses (source of truth)
export const TASK_STATUS = {
  PENDING: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  PAUSED: 4,
  BLOCKED: 5,
  CANCELLED: 6,
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Pending',
  [TASK_STATUS.ASSIGNED]: 'Assigned',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.PAUSED]: 'Paused',
  [TASK_STATUS.BLOCKED]: 'Blocked',
  [TASK_STATUS.CANCELLED]: 'Cancelled',
};

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.PENDING]: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  [TASK_STATUS.ASSIGNED]: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  [TASK_STATUS.IN_PROGRESS]: { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500' },
  [TASK_STATUS.COMPLETED]: { bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500' },
  [TASK_STATUS.PAUSED]: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  [TASK_STATUS.BLOCKED]: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  [TASK_STATUS.CANCELLED]: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

export const TASK_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
  [TASK_PRIORITY.CRITICAL]: 'Critical',
};

export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: { bg: 'bg-slate-100', text: 'text-slate-600' },
  [TASK_PRIORITY.MEDIUM]: { bg: 'bg-warning-100', text: 'text-warning-700' },
  [TASK_PRIORITY.HIGH]: { bg: 'bg-danger-100', text: 'text-danger-700' },
  [TASK_PRIORITY.CRITICAL]: { bg: 'bg-red-200', text: 'text-red-900' },
};

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_PAUSED: 'task_paused',
  TASK_RESUMED: 'task_resumed',
  TASK_CANCELLED: 'task_cancelled',
  DEADLINE_APPROACHING: 'deadline_approaching',
  OVERDUE: 'overdue',
  SLA_BREACHED: 'sla_breached',
  ATTACHMENT_UPLOADED: 'attachment_uploaded',
};

export const PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
