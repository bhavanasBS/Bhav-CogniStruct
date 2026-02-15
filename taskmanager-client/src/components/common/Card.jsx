import { classNames } from '../../utils/helpers';

const Card = ({ children, className = '', hover = false, onClick, padding = true }) => {
  return (
    <div
      className={classNames(
        'card',
        hover && 'hover:shadow-md hover:border-primary-200 transition-all cursor-pointer',
        padding && 'card-body',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={classNames('mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={classNames('text-lg font-semibold text-slate-900', className)}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={classNames('text-sm text-slate-500 mt-1', className)}>{children}</p>
);

export default Card;
