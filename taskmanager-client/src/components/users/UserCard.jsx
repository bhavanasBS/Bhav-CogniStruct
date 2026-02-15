import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { getRoleBadgeColor } from '../../utils/roleUtils';
import Badge from '../common/Badge';

const UserCard = ({ user, onClick }) => {
  const avatarColor = generateAvatarColor(user?.firstName || user?.fullName || '');
  const roles = user?.roles || [];

  return (
    <div
      onClick={() => onClick?.(user)}
      className="card card-body hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${avatarColor} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
          {getInitials(user)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-900 truncate">
            {user?.firstName} {user?.lastName}
          </h4>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {roles.map((role) => (
              <span key={role} className={`badge text-[10px] ${getRoleBadgeColor(role)}`}>
                {role}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0">
          <Badge variant={user?.isActive ? 'success' : 'danger'} dot>
            {user?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
