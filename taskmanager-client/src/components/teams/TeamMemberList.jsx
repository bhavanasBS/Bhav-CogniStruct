import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { getRoleBadgeColor } from '../../utils/roleUtils';
import { formatDate } from '../../utils/dateUtils';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { UserMinus } from 'lucide-react';

const TeamMemberList = ({ members, onRemove, isLoading }) => {
  if (isLoading) {
    return <div className="p-6 text-center text-sm text-slate-400">Loading members...</div>;
  }

  if (!members?.length) {
    return <div className="p-6 text-center text-sm text-slate-400">No members in this team</div>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {members.map((member) => {
        const avatarColor = generateAvatarColor(member.firstName || member.fullName || '');
        return (
          <div key={member.userId} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                {getInitials(member)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{member.firstName || member.fullName} {member.lastName || ''}</p>
                <p className="text-xs text-slate-400">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {member.role && (
                <span className={`badge text-[10px] ${getRoleBadgeColor(member.role)}`}>{member.role}</span>
              )}
              <span className="text-xs text-slate-400">{formatDate(member.joinedDate)}</span>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(member)}
                  className="text-danger-500 hover:text-danger-700 hover:bg-danger-50"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamMemberList;
