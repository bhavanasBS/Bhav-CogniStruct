import TaskStatusBadge from './TaskStatusBadge';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '../../utils/constants';
import { formatDate, getRelativeTime, daysUntil } from '../../utils/dateUtils';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { Flag, Clock, Calendar, ChevronRight, ClipboardList, Trash2 } from 'lucide-react';

const TaskList = ({ tasks, onSelect, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-3">
          <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading tasks...</p>
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="p-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
          <ClipboardList className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No tasks found</p>
        <p className="text-xs text-slate-400 mt-1">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Task</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assignee</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Deadline</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Est. Hours</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const days = daysUntil(task.deadline);
            const priorityColor = TASK_PRIORITY_COLORS[task.priority] || TASK_PRIORITY_COLORS[1];
            const avatarColor = generateAvatarColor(task.assigneeName || '');

            return (
              <tr
                key={task.id || task.taskId}
                className="group hover:bg-indigo-50/50 cursor-pointer transition-all duration-200"
                onClick={() => onSelect?.(task)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${task.status === 2 ? 'bg-emerald-500' :
                      task.status === 1 ? 'bg-blue-500' :
                        task.status === 3 ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
                        {task.title}
                      </p>
                      {task.teamName && (
                        <p className="text-xs text-slate-400 mt-0.5">{task.teamName}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl ${avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                      {getInitials({ firstName: task.assigneeName?.split(' ')[0], lastName: task.assigneeName?.split(' ')[1] })}
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{task.assigneeName || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${priorityColor.bg} ${priorityColor.text}`}>
                    <Flag className="h-3 w-3" />
                    {TASK_PRIORITY_LABELS[task.priority] || 'Medium'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-700 font-medium">{formatDate(task.deadline)}</p>
                      <p className={`text-xs font-semibold ${days < 0 ? 'text-rose-500' :
                        days <= 2 ? 'text-amber-600' :
                          'text-slate-400'
                        }`}>
                        {getRelativeTime(task.deadline)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{task.estimatedHours || 0}h</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
