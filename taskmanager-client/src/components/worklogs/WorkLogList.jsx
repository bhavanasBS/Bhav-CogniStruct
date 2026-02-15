import { formatDateTime } from '../../utils/dateUtils';
import { Edit2, Trash2 } from 'lucide-react';

const WorkLogList = ({ logs, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading work logs...</div>;
  }

  if (!logs?.length) {
    return <div className="p-8 text-center text-sm text-slate-400">No work logs recorded yet</div>;
  }

  return (
    <div className="table-container">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">End</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => (
            <tr key={log.workLogId} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-800">{log.taskTitle || 'Unknown Task'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(log.startTime)}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(log.endTime)}</td>
              <td className="px-6 py-4">
                <span className="badge bg-primary-50 text-primary-700">{log.totalHours}h</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{log.description || '—'}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEdit?.(log)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete?.(log)} className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkLogList;
