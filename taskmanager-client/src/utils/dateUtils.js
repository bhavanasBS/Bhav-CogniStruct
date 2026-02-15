export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toInputDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().slice(0, 10);
};

export const toInputDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().slice(0, 16);
};

export const daysUntil = (dateString) => {
  if (!dateString) return null;
  const now = new Date();
  const target = new Date(dateString);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export const isOverdue = (dateString) => {
  return daysUntil(dateString) < 0;
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const days = daysUntil(dateString);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `${days} days left`;
  return `${Math.abs(days)} days overdue`;
};
