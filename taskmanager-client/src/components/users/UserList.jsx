import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { getRoleBadgeColor } from '../../utils/roleUtils';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/dateUtils';
import { MoreVertical, Edit2, UserCheck, UserX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const UserList = ({ users, onEdit, onToggleStatus, isLoading }) => {
  if (isLoading) {
    return (
      <div className="table-container">
        <div className="p-10 text-center text-slate-500">
          <svg className="animate-spin h-6 w-6 mx-auto text-primary-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-2 text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="table-container p-10 text-center text-slate-400">
        <p className="text-sm">No users found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roles</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
            <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <UserRow key={user.id || user.userId} user={user} onEdit={onEdit} onToggleStatus={onToggleStatus} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserRow = ({ user, onEdit, onToggleStatus }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const avatarColor = generateAvatarColor(user.firstName || '');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
            {getInitials(user)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {(user.roles || []).map((role) => {
            const roleName = typeof role === 'string' ? role : role.roleName || role;
            return (
              <span key={roleName} className={`badge text-[10px] ${getRoleBadgeColor(roleName)}`}>
                {roleName}
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.isActive ? 'success' : 'danger'} dot>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdDate)}</td>
      <td className="px-6 py-4 text-right">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
              <button
                onClick={() => { onEdit?.(user); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => { onToggleStatus?.(user); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${user.isActive ? 'text-danger-600 hover:bg-danger-50' : 'text-accent-600 hover:bg-accent-50'
                  }`}
              >
                {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserList;
