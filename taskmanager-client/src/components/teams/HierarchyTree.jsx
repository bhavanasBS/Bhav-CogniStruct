import { useState } from 'react';
import { ChevronRight, ChevronDown, User, Users } from 'lucide-react';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import Badge from '../common/Badge';
import { getRoleBadgeColor } from '../../utils/roleUtils';

const TreeNode = ({ data, level = 0, isLast = false }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = data.children?.length > 0 || data.members?.length > 0;
  const avatarColor = generateAvatarColor(data.firstName || data.name || '');

  return (
    <div className={`${level > 0 ? 'ml-6' : ''}`}>
      {/* Node */}
      <div className="flex items-center gap-2 py-1.5 group">
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-6 h-6 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </span>
        )}

        {/* Avatar */}
        <div className={`w-8 h-8 rounded-lg ${avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
          {getInitials({ firstName: data.firstName, lastName: data.lastName }) || <User className="h-4 w-4" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">
              {data.firstName} {data.lastName || data.name}
            </span>
            {data.role && (
              <span className={`badge text-[10px] ${getRoleBadgeColor(data.role)}`}>
                {data.role}
              </span>
            )}
            {data.teamName && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="h-3 w-3" /> {data.teamName}
              </span>
            )}
          </div>
          {data.email && (
            <p className="text-xs text-slate-400">{data.email}</p>
          )}
        </div>

        {/* Member count */}
        {hasChildren && (
          <span className="text-xs text-slate-400 pr-2">
            {(data.children?.length || 0) + (data.members?.length || 0)} members
          </span>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="relative">
          <div className="absolute left-[11px] top-0 bottom-2 w-px bg-slate-200" />
          {(data.children || data.members || []).map((child, idx) => (
            <TreeNode
              key={child.userId || child.id || idx}
              data={child}
              level={level + 1}
              isLast={idx === (data.children || data.members).length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchyTree = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500">
        <svg className="animate-spin h-6 w-6 mx-auto text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-2 text-sm">Loading hierarchy...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p className="text-sm">No hierarchy data available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <TreeNode data={data} />
    </div>
  );
};

export default HierarchyTree;
