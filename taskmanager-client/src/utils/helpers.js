export const getFullName = (user) => {
  if (!user) return '';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

export const getInitials = (user) => {
  if (!user) return '??';
  const first = user.firstName?.charAt(0) || '';
  const last = user.lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase() || '??';
};

export const truncate = (str, maxLen = 50) => {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen) + '…';
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

export const formatHours = (hours) => {
  if (!hours) return '0h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const debounce = (fn, ms = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

export const generateAvatarColor = (name) => {
  const colors = [
    'bg-primary-500', 'bg-accent-500', 'bg-warning-500', 'bg-danger-500',
    'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
