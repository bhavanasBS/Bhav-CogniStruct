import { classNames } from '../../utils/helpers';

const Badge = ({ children, variant = 'default', className = '', dot = false }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-accent-50 text-accent-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    info: 'bg-cyan-100 text-cyan-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-primary-500',
    success: 'bg-accent-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-cyan-500',
    purple: 'bg-purple-500',
  };

  return (
    <span className={classNames('badge', variants[variant], className)}>
      {dot && <span className={classNames('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])} />}
      {children}
    </span>
  );
};

export default Badge;
