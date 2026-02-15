import TaskStatusBadge from './TaskStatusBadge';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '../../utils/constants';
import { getRelativeTime, daysUntil } from '../../utils/dateUtils';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { Clock, Calendar, Flag, ArrowRight } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const days = daysUntil(task.deadline);
  const priorityColor = TASK_PRIORITY_COLORS[task.priority] || TASK_PRIORITY_COLORS[1];
  const avatarColor = generateAvatarColor(task.assigneeName || '');

  // Status colors for card border
  const statusColors = {
    0: 'border-l-amber-500',
    1: 'border-l-blue-500',
    2: 'border-l-emerald-500',
    3: 'border-l-rose-500',
  };

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`bg-white rounded-xl border border-slate-200 border-l-4 ${statusColors[task.status] || statusColors[0]} p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-2 flex-1">
          {task.title}
        </h3>
        <TaskStatusBadge status={task.status} />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Assignee & Priority */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${avatarColor} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>
            {getInitials({ firstName: task.assigneeName?.split(' ')[0], lastName: task.assigneeName?.split(' ')[1] })}
          </div>
          <span className="text-xs font-medium text-slate-600">{task.assigneeName || 'Unassigned'}</span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${priorityColor.bg} ${priorityColor.text}`}>
          <Flag className="h-2.5 w-2.5" />
          {TASK_PRIORITY_LABELS[task.priority] || 'Medium'}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">{task.estimatedHours || 0}h</span>
          </span>
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${days < 0 ? 'text-rose-500' :
              days <= 2 ? 'text-amber-600' :
                'text-slate-500'
            }`}>
            <Calendar className="h-3.5 w-3.5" />
            {getRelativeTime(task.deadline)}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export default TaskCard;
