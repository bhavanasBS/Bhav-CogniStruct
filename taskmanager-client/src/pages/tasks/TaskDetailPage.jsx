import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Clock, Calendar, User, Flag, CheckCircle2,
  AlertTriangle, Timer, FileText, Users, Sparkles, ChevronRight,
  Circle, Zap, TrendingUp
} from 'lucide-react';
import TaskStatusBadge from '../../components/tasks/TaskStatusBadge';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS_LABELS } from '../../utils/constants';
import { formatDateTime, getRelativeTime, daysUntil } from '../../utils/dateUtils';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { taskApi } from '../../api/taskApi';
import { workLogApi } from '../../api/workLogApi';
import toast from 'react-hot-toast';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workLogs, setWorkLogs] = useState([]);

  // Current user info for role-based controls
  const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const currentUserId = user.userId || user.id;
  const userRole = (user.role || user.roles?.[0] || '').toLowerCase();

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const response = await taskApi.getById(id);
      const data = response.data;
      setTask({
        taskId: data.id || data.taskId,
        assigneeId: data.assigneeId,
        title: data.title,
        description: data.description,
        assigneeName: data.assigneeName || 'Unassigned',
        assignerName: data.assignerName || 'N/A',
        teamName: data.teamName || 'N/A',
        priority: data.priority,
        status: data.status,
        deadline: data.deadline,
        estimatedHours: data.estimatedHours || 0,
        totalLoggedHours: data.totalLoggedHours || 0,
        createdDate: data.createdDate,
        updatedDate: data.updatedDate,
        completedDate: data.completedDate,
      });
    } catch (error) {
      console.error('Failed to fetch task:', error);
      toast.error('Failed to load task details');
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkLogs = async () => {
    try {
      const response = await workLogApi.getByTask(id);
      setWorkLogs(response.data || []);
    } catch {
      setWorkLogs([]);
    }
  };

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchTask();
      fetchWorkLogs();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await taskApi.updateStatus(task.taskId, newStatus);
      setTask((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Task marked as ${TASK_STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update task status');
    }
  };

  if (isLoading) return <PageLoader />;
  if (!task) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-400 text-lg font-medium">Task not found</p>
      <button onClick={() => navigate('/tasks')} className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </button>
    </div>
  );

  const days = task.deadline ? daysUntil(task.deadline) : null;
  const progressPercent = task.estimatedHours > 0
    ? Math.min(Math.round((task.totalLoggedHours / task.estimatedHours) * 100), 100)
    : 0;

  const priorityConfig = {
    0: { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    1: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
    2: { label: 'High', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
  };
  const priority = priorityConfig[task.priority] || priorityConfig[0];

  const statusConfig = {
    0: { label: 'Pending', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: Circle, gradient: 'from-slate-400 to-slate-500' },
    1: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Zap, gradient: 'from-blue-500 to-indigo-500' },
    2: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
    3: { label: 'Overdue', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle, gradient: 'from-rose-500 to-pink-500' },
  };
  const status = statusConfig[task.status] || statusConfig[0];
  const StatusIcon = status.icon;

  // Role-based permissions
  const isAssignee = currentUserId && task.assigneeId === currentUserId;
  const isAdmin = ['admin', 'manager', 'hr'].includes(userRole);
  const isTeamLead = ['teamlead', 'team lead'].includes(userRole);
  const canUpdate = isAssignee || isAdmin;
  const canOverride = isTeamLead && !isAssignee;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${status.gradient}`} />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${priority.bg} ${priority.color} ${priority.border} border`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                  {priority.label} Priority
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${status.bg} ${status.color} ${status.border} border`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{task.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-400">#</span>{task.taskId}
                </span>
                {task.teamName !== 'N/A' && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {task.teamName}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {formatDateTime(task.createdDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content — 2 cols */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Description</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          {/* Status Actions — Role-based */}
          {canUpdate && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Update Status</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => {
                  const conf = statusConfig[Number(key)] || statusConfig[0];
                  const Icon = conf.icon;
                  const isActive = task.status === Number(key);
                  return (
                    <button
                      key={key}
                      onClick={() => updateStatus(Number(key))}
                      className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${isActive
                        ? `${conf.bg} ${conf.border} ${conf.color} ring-2 ring-offset-1 ring-${conf.border.replace('border-', '')}/30 shadow-sm`
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow">
                          <span className={`w-2 h-2 rounded-full ${conf.border.replace('border-', 'bg-')}`} />
                        </span>
                      )}
                      <Icon className={`w-5 h-5 ${isActive ? conf.color : 'text-slate-400'}`} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {canOverride && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center">
                    <StatusIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Task Status</h3>
                    <p className="text-xs text-slate-400">Only the assignee can update status</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${status.bg} ${status.color} ${status.border} border`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>
              <details className="group">
                <summary className="flex items-center gap-2 text-xs text-amber-600 font-medium cursor-pointer hover:text-amber-700 select-none py-2 px-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Override Status (TeamLead)
                  <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform group-open:rotate-90" />
                </summary>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
                  {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => {
                    const conf = statusConfig[Number(key)] || statusConfig[0];
                    const isActive = task.status === Number(key);
                    return (
                      <button
                        key={key}
                        onClick={() => updateStatus(Number(key))}
                        className={`py-2.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isActive
                          ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </details>
            </div>
          )}

          {!canUpdate && !canOverride && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center">
                  <StatusIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">Task Status</h3>
                  <p className="text-xs text-slate-400">Only the assigned employee can update this</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${status.bg} ${status.color} ${status.border} border`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>
            </div>
          )}

          {/* Work Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Timer className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Work Logs</h3>
                  <p className="text-xs text-slate-400">{workLogs.length} {workLogs.length === 1 ? 'entry' : 'entries'} recorded</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                <Clock className="w-3.5 h-3.5" />
                Log Time
              </button>
            </div>
            {workLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <Timer className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium">No work logs yet</p>
                <p className="text-xs mt-1">Time entries will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {workLogs.map((log, idx) => (
                  <div key={log.id || idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {(log.userName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{log.userName || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 truncate">{log.description || 'No description'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-200">
                        <Clock className="w-3 h-3" />
                        {log.totalHours}h
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(log.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-5">
          {/* Progress Card */}
          {task.estimatedHours > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</h3>
              </div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{task.totalLoggedHours}<span className="text-lg text-slate-400">h</span></p>
                  <p className="text-xs text-slate-400">of {task.estimatedHours}h estimated</p>
                </div>
                <span className={`text-lg font-bold ${progressPercent >= 100 ? 'text-emerald-600' : progressPercent >= 75 ? 'text-amber-600' : 'text-blue-600'}`}>
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : progressPercent >= 75
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Details</h3>
            <div className="space-y-4">
              {/* Assigned To */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {task.assigneeName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Assigned To</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{task.assigneeName}</p>
                </div>
              </div>

              {/* Assigned By */}
              {task.assignerName !== 'N/A' && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {task.assignerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400">Assigned By</p>
                    <p className="text-sm font-medium text-slate-700 truncate">{task.assignerName}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 space-y-3">
                {/* Estimated Hours */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Est. Hours
                  </span>
                  <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {task.estimatedHours}h
                  </span>
                </div>

                {/* Logged Hours */}
                {task.totalLoggedHours > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-2">
                      <Timer className="w-4 h-4 text-slate-400" />
                      Logged
                    </span>
                    <span className="text-sm font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {task.totalLoggedHours}h
                    </span>
                  </div>
                )}
              </div>

              {/* Deadline */}
              {task.deadline && (
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Deadline
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {formatDateTime(task.deadline)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${days < 0
                    ? 'bg-rose-50 border-rose-200'
                    : days <= 2
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-emerald-50 border-emerald-200'
                    }`}>
                    {days < 0 ? (
                      <AlertTriangle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                    ) : days <= 2 ? (
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
                    ) : (
                      <Calendar className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-semibold ${days < 0 ? 'text-rose-700' : days <= 2 ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                      {getRelativeTime(task.deadline)}
                    </span>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Created</span>
                  <span>{formatDateTime(task.createdDate)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Updated</span>
                  <span>{formatDateTime(task.updatedDate)}</span>
                </div>
                {task.completedDate && (
                  <div className="flex items-center justify-between text-xs text-emerald-500">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>
                    <span>{formatDateTime(task.completedDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
