import Card from '../common/Card';
import Badge from '../common/Badge';
import { Users, User, Calendar } from 'lucide-react';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { formatDate } from '../../utils/dateUtils';

const TeamList = ({ teams, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card card-body animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
            <div className="h-4 bg-slate-200 rounded w-full mb-2" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!teams?.length) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">No teams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {teams.map((team) => {
        const managerColor = generateAvatarColor(team.managerName || team.manager?.firstName || '');
        return (
          <Card
            key={team.teamId}
            hover
            onClick={() => onSelect?.(team)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">{team.teamName}</h3>
              <Badge variant={team.isActive ? 'success' : 'danger'} dot>
                {team.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {team.description && (
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{team.description}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${managerColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                  {getInitials(team.manager || { firstName: team.managerName?.split(' ')[0], lastName: team.managerName?.split(' ')[1] })}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">{team.managerName || `${team.manager?.firstName || ''} ${team.manager?.lastName || ''}`}</p>
                  <p className="text-[10px] text-slate-400">Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {team.memberCount || 0}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TeamList;
