import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, Calendar, User, Flag, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import TaskStatusBadge from '../../components/tasks/TaskStatusBadge';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS, TASK_STATUS_LABELS } from '../../utils/constants';
import { formatDateTime, getRelativeTime, daysUntil } from '../../utils/dateUtils';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTask({
        taskId: Number(id),
        title: 'Implement user authentication module',
        description: 'Build JWT-based authentication with login, register, and refresh token endpoints. Include BCrypt password hashing, role-based claims, and 60-minute token expiry with 7-day refresh tokens.',
        assigneeName: 'Emily Davis',
        assignerName: 'Sarah Johnson',
        teamName: 'Engineering',
        priority: 2,
        status: 1,
        deadline: '2026-02-12T17:00:00',
        estimatedHours: 16,
        createdDate: '2026-02-01T09:00:00',
        updatedDate: '2026-02-05T14:30:00',
      });
      setIsLoading(false);
    }, 400);
  }, [id]);

  if (isLoading) return <PageLoader />;
  if (!task) return <div className="text-center py-12 text-slate-400">Task not found</div>;

  const days = daysUntil(task.deadline);
  const priorityColor = TASK_PRIORITY_COLORS[task.priority] || TASK_PRIORITY_COLORS[1];

  const updateStatus = (newStatus) => {
    setTask((prev) => ({ ...prev, status: newStatus }));
    toast.success(`Task marked as ${TASK_STATUS_LABELS[newStatus]}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tasks')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Task #{task.taskId} &middot; {task.teamName}</p>
        </div>
        <Button variant="secondary" icon={Edit2} size="sm">Edit</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
          </Card>

          {/* Status Actions */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Update Status</h3>
            <div className="flex gap-3">
              {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => updateStatus(Number(key))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    task.status === Number(key)
                      ? 'bg-primary-50 border-primary-300 text-primary-700 ring-2 ring-primary-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          {/* Work Logs */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Work Logs</h3>
              <Button variant="secondary" size="sm" icon={Clock}>Log Time</Button>
            </div>
            <div className="text-center py-6 text-sm text-slate-400">
              No work logs recorded for this task yet
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <TaskStatusBadge status={task.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Priority</span>
                <span className={`badge ${priorityColor.bg} ${priorityColor.text}`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {TASK_PRIORITY_LABELS[task.priority]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Assigned To</span>
                <span className="text-sm font-medium text-slate-800">{task.assigneeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Assigned By</span>
                <span className="text-sm text-slate-700">{task.assignerName}</span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Est. Hours</span>
                  <span className="text-sm font-medium text-slate-800">{task.estimatedHours}h</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Deadline</span>
                <span className={`text-sm font-medium ${days < 0 ? 'text-danger-500' : 'text-slate-800'}`}>
                  {formatDateTime(task.deadline)}
                </span>
              </div>
              <div className={`flex items-center gap-2 p-2.5 rounded-lg ${days < 0 ? 'bg-danger-50' : days <= 2 ? 'bg-warning-50' : 'bg-accent-50'}`}>
                {days < 0 ? (
                  <AlertTriangle className="h-4 w-4 text-danger-500" />
                ) : (
                  <Calendar className="h-4 w-4 text-accent-600" />
                )}
                <span className={`text-sm font-medium ${days < 0 ? 'text-danger-700' : days <= 2 ? 'text-warning-700' : 'text-accent-700'}`}>
                  {getRelativeTime(task.deadline)}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-400">
                <p>Created: {formatDateTime(task.createdDate)}</p>
                <p>Updated: {formatDateTime(task.updatedDate)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
