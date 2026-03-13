import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Clock, Calendar, User, Flag, CheckCircle2,
  AlertTriangle, Timer, FileText, Users, ChevronRight,
  Circle, Zap, TrendingUp, Pause, Play, Upload, Trash2, Download,
  ShieldAlert, Ban, Paperclip, XCircle, MessageSquare, Activity,
  Star, Send, Award, RefreshCw
} from 'lucide-react';
import TaskStatusBadge from '../../components/tasks/TaskStatusBadge';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS_LABELS, TASK_STATUS } from '../../utils/constants';
import { formatDateTime, getRelativeTime, daysUntil } from '../../utils/dateUtils';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { taskApi } from '../../api/taskApi';
import { workLogApi } from '../../api/workLogApi';
import { attachmentApi } from '../../api/attachmentApi';
import { commentsApi } from '../../api/commentsApi';
import { activityApi } from '../../api/activityApi';
import { feedbackApi } from '../../api/feedbackApi';
import { pauseRequestApi } from '../../api/pauseRequestApi';
import ConfirmModal from '../../components/common/ConfirmModal';
import ReassignModal from '../../components/tasks/ReassignModal';
import toast from 'react-hot-toast';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workLogs, setWorkLogs] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Tab system
  const [activeTab, setActiveTab] = useState('comments');
  const [tabLoaded, setTabLoaded] = useState({});

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Activity state
  const [activities, setActivities] = useState([]);

  // Feedback state
  const [feedbackData, setFeedbackData] = useState({ workQuality: 0, timeliness: 0, communication: 0, strengths: '', improvements: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Pause request state (Employee)
  const [showPauseRequestModal, setShowPauseRequestModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [submittingPauseRequest, setSubmittingPauseRequest] = useState(false);

  // Reassign modal state
  const [showReassignModal, setShowReassignModal] = useState(false);

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
        startedAt: data.startedAt,
        slaHours: data.slaHours,
        slaBreached: data.slaBreached,
        parentTaskId: data.parentTaskId,
        isProject: data.isProject,
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

  const fetchAttachments = async () => {
    try {
      const response = await attachmentApi.getByTask(id);
      setAttachments(response.data || []);
    } catch {
      setAttachments([]);
    }
  };

  // Tab data loaders
  const fetchComments = async () => {
    try { const r = await commentsApi.getComments(id); setComments(r.data || []); } catch { setComments([]); }
  };
  const fetchActivities = async () => {
    try { const r = await activityApi.getActivity(id); setActivities(r.data || []); } catch { setActivities([]); }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSendingComment(true);
      await commentsApi.createComment(id, newComment.trim());
      setNewComment('');
      fetchComments();
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send comment');
    } finally {
      setSendingComment(false);
    }
  };

  const handleSubmitFeedback = async () => {
    const { workQuality, timeliness, communication } = feedbackData;
    if (workQuality < 1 || timeliness < 1 || communication < 1) { toast.error('Please rate all three criteria'); return; }
    try {
      setSubmittingFeedback(true);
      await feedbackApi.submit({
        taskId: Number(id),
        workQualityRating: workQuality,
        timelinessRating: timeliness,
        communicationRating: communication,
        strengths: feedbackData.strengths,
        improvements: feedbackData.improvements
      });
      toast.success('Feedback submitted!');
      setFeedbackSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchTask();
      fetchWorkLogs();
      fetchAttachments();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  // Lazy load tab data
  useEffect(() => {
    if (!id || tabLoaded[activeTab]) return;
    if (activeTab === 'comments') fetchComments();
    if (activeTab === 'activity') fetchActivities();
    setTabLoaded(prev => ({ ...prev, [activeTab]: true }));
  }, [activeTab, id]);

  const updateStatus = async (newStatus) => {
    try {
      await taskApi.updateStatus(task.taskId, newStatus);
      setTask((prev) => ({
        ...prev,
        status: newStatus,
        startedAt: newStatus === 2 && !prev.startedAt ? new Date().toISOString() : prev.startedAt,
      }));
      toast.success(`Task marked as ${TASK_STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update task status');
    }
  };

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handlePause = async () => {
    try {
      setActionLoading(true);
      const api = (await import('../../api/axiosInstance')).default;
      await api.patch(`/api/tasks/${task.taskId}/pause`, { reason: 'Paused from task detail' });
      setTask((prev) => ({ ...prev, status: 4 }));
      toast.success('Task paused successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pause task');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      const api = (await import('../../api/axiosInstance')).default;
      await api.patch(`/api/tasks/${task.taskId}/resume`);
      setTask((prev) => ({ ...prev, status: 2 }));
      toast.success('Task resumed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resume task');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await attachmentApi.upload(task.taskId, file);
      toast.success('File uploaded');
      fetchAttachments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await attachmentApi.delete(attachmentId);
      toast.success('Attachment deleted');
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
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
    3: { label: 'Critical', color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-600' },
  };
  const priority = priorityConfig[task.priority] || priorityConfig[0];

  const statusConfig = {
    0: { label: 'Pending', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: Circle, gradient: 'from-slate-400 to-slate-500' },
    1: { label: 'Assigned', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', icon: User, gradient: 'from-sky-400 to-sky-500' },
    2: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Zap, gradient: 'from-blue-500 to-indigo-500' },
    3: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
    4: { label: 'Paused', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Pause, gradient: 'from-amber-400 to-orange-500' },
    5: { label: 'Blocked', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: ShieldAlert, gradient: 'from-red-500 to-red-600' },
    6: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: XCircle, gradient: 'from-gray-400 to-gray-500' },
  };
  const status = statusConfig[task.status] || statusConfig[0];
  const StatusIcon = status.icon;

  // RBAC — Employee can only update status on own task
  const isAssignee = currentUserId && task.assigneeId === currentUserId;
  const isEmployee = userRole === 'employee';
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isTeamLead = ['teamlead', 'team lead'].includes(userRole);
  const canUpdateStatus = isEmployee && isAssignee;

  // Pause: TeamLead → subtasks, Manager → any task, Admin → all
  const canPause = (() => {
    if (task.status === 3 || task.status === 6) return false;
    if (isAdmin) return true;
    if (isTeamLead && task.parentTaskId) return true;
    if (isManager) return true;
    return false;
  })();

  // Reassign: TeamLead (subtasks), Manager, Admin — not completed/cancelled
  const canReassign = (() => {
    if (task.status === 3 || task.status === 6) return false;
    if (isAdmin) return true;
    if (isTeamLead && task.parentTaskId) return true;
    if (isManager) return true;
    return false;
  })();

  // Employee-allowed status transitions
  const allowedTransitions = [];
  if (canUpdateStatus) {
    if (task.status === 0) allowedTransitions.push(2); // Pending → InProgress
    if (task.status === 2) allowedTransitions.push(3); // InProgress → Completed
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

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
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${priority.bg} ${priority.color} ${priority.border} border`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                  {priority.label} Priority
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${status.bg} ${status.color} ${status.border} border`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                {/* SLA Breached Badge */}
                {task.slaBreached && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    SLA Breached
                  </span>
                )}
                {task.isProject && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Project
                  </span>
                )}
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

          {/* Status Actions — Employee only */}
          {canUpdateStatus && allowedTransitions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Update Status</h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                {allowedTransitions.map((targetStatus) => {
                  const conf = statusConfig[targetStatus];
                  const Icon = conf.icon;
                  return (
                    <button
                      key={targetStatus}
                      onClick={() => updateStatus(targetStatus)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${conf.bg} ${conf.border} ${conf.color} hover:shadow-sm`}
                    >
                      <Icon className="w-4 h-4" />
                      Mark as {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pause/Resume Controls — Governance-based */}
          {canPause && task.status !== 3 && task.status !== 6 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  {task.status === 4 ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Pause Controls</h3>
              </div>
              <div className="flex items-center gap-3">
                {task.status !== 4 ? (
                  <button
                    onClick={() => setConfirmAction('pause')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4" /> Pause Task
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmAction('resume')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" /> Resume Task
                  </button>
                )}
                <span className="text-xs text-slate-400">
                  {task.status === 4 ? 'Task is currently paused' : 'Pause will block work logging and completion'}
                </span>
              </div>
            </div>
          )}

          {/* Reassign Task — TeamLead/Manager/Admin */}
          {canReassign && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Reassign Task</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Reassign Task
                </button>
                <span className="text-xs text-slate-400">Transfer this task to another team member</span>
              </div>
            </div>
          )}

          {/* Employee Pause Request — Employee can request pause, NOT directly pause */}
          {userRole === 'employee' && task.assigneeId === currentUserId && task.status !== 3 && task.status !== 4 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Pause className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Pause Request</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPauseRequestModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4" /> Request Pause
                </button>
                <span className="text-xs text-slate-400">Your TeamLead will review and approve/reject the request</span>
              </div>
            </div>
          )}

          {/* Read-only status display for non-privileged users */}
          {!canUpdateStatus && !canPause && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center">
                  <StatusIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">Task Status</h3>
                  <p className="text-xs text-slate-400">Only the assigned employee can update status</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${status.bg} ${status.color} ${status.border} border`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>
            </div>
          )}

          {/* ═══ TABBED WORKSPACE PANEL ═══ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 px-2 pt-1 gap-1 overflow-x-auto">
              {[
                { key: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
                { key: 'attachments', label: 'Attachments', icon: Paperclip, count: attachments.length },
                { key: 'worklogs', label: 'Work Logs', icon: Timer, count: workLogs.length },
                { key: 'activity', label: 'Activity', icon: Activity },
                ...(task.status === 3 && isTeamLead ? [{ key: 'feedback', label: 'Feedback', icon: Star }] : []),
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count !== undefined && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px]">{tab.count}</span>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-0">

              {/* ─── COMMENTS TAB ─── */}
              {activeTab === 'comments' && (
                <div>
                  <div className="max-h-96 overflow-y-auto">
                    {comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <MessageSquare className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-sm font-medium">No comments yet</p>
                        <p className="text-xs mt-1">Start the conversation</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {comments.map(c => (
                          <div key={c.commentId} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">{c.userName?.charAt(0)?.toUpperCase() || '?'}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-slate-800">{c.userName}</span>
                                  <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{c.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                    <div className="flex gap-2">
                      <input
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none bg-white"
                      />
                      <button
                        onClick={handleSendComment}
                        disabled={sendingComment || !newComment.trim()}
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {sendingComment ? '...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── ATTACHMENTS TAB ─── */}
              {activeTab === 'attachments' && (
                <div>
                  <div className="flex items-center justify-end px-6 py-3 border-b border-slate-100">
                    <label className={`flex items-center gap-2 px-4 py-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 rounded-xl text-xs font-semibold transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? 'Uploading...' : 'Upload File'}
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {attachments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Paperclip className="w-10 h-10 text-slate-200 mb-3" />
                      <p className="text-sm font-medium">No attachments yet</p>
                      <p className="text-xs mt-1">Upload files to attach to this task</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {attachments.map(att => (
                        <div key={att.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{att.fileName}</p>
                            <p className="text-xs text-slate-400">{formatFileSize(att.fileSize)} &middot; by {att.uploadedByName}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a href={`http://localhost:5000${att.filePath}`} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                              <Download className="w-4 h-4" />
                            </a>
                            <button onClick={() => handleDeleteAttachment(att.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── WORK LOGS TAB ─── */}
              {activeTab === 'worklogs' && (
                <div>
                  {workLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Timer className="w-10 h-10 text-slate-200 mb-3" />
                      <p className="text-sm font-medium">No work logs yet</p>
                      <p className="text-xs mt-1">Time entries will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {workLogs.map((log, idx) => (
                        <div key={log.id || idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{(log.userName || 'U').charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{log.userName || 'Unknown'}</p>
                            <p className="text-xs text-slate-400 truncate">{log.description || 'No description'}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-200">
                              <Clock className="w-3 h-3" />{log.totalHours}h
                            </span>
                            <p className="text-xs text-slate-400 mt-1">{new Date(log.startTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── ACTIVITY TAB ─── */}
              {activeTab === 'activity' && (
                <div className="max-h-96 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Activity className="w-10 h-10 text-slate-200 mb-3" />
                      <p className="text-sm font-medium">No activity recorded</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {activities.map(a => {
                        const actionColors = {
                          created: 'bg-emerald-100 text-emerald-700',
                          assigned: 'bg-blue-100 text-blue-700',
                          status_changed: 'bg-indigo-100 text-indigo-700',
                          paused: 'bg-amber-100 text-amber-700',
                          resumed: 'bg-teal-100 text-teal-700',
                          completed: 'bg-emerald-100 text-emerald-700',
                        };
                        const color = actionColors[a.action] || 'bg-slate-100 text-slate-600';
                        return (
                          <div key={a.auditId} className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50/50 transition-colors">
                            <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${color}`}>
                              {a.action.replace(/_/g, ' ')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-700">{a.details || a.action}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{a.performedBy} · {new Date(a.createdDate).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── FEEDBACK TAB ─── */}
              {activeTab === 'feedback' && (
                <div className="p-6">
                  {feedbackSubmitted ? (
                    <div className="flex flex-col items-center py-8">
                      <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                        <Award className="w-7 h-7 text-emerald-600" />
                      </div>
                      <p className="text-lg font-bold text-emerald-700">Feedback Submitted!</p>
                      <p className="text-sm text-slate-500 mt-1">Thank you for your review</p>
                    </div>
                  ) : (
                    <div className="max-w-lg mx-auto">
                      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Evaluate Employee Performance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {[
                          { key: 'workQuality', label: 'Work Quality' },
                          { key: 'timeliness', label: 'Timeliness' },
                          { key: 'communication', label: 'Communication' },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setFeedbackData(prev => ({ ...prev, [key]: n }))}
                                  className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all cursor-pointer border ${
                                    feedbackData[key] === n
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 text-center">
                              {['', 'Poor', 'Needs Improvement', 'Satisfactory', 'Very Good', 'Excellent'][feedbackData[key]] || '—'}
                            </p>
                          </div>
                        ))}
                      </div>
                      {feedbackData.workQuality > 0 && feedbackData.timeliness > 0 && feedbackData.communication > 0 && (
                        <div className="mb-4 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                          <span className="text-xs text-indigo-500 font-medium">Overall Score: </span>
                          <span className="text-lg font-bold text-indigo-700">
                            {((feedbackData.workQuality + feedbackData.timeliness + feedbackData.communication) / 3).toFixed(1)}
                          </span>
                          <span className="text-xs text-indigo-400"> / 5</span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Strengths</label>
                          <textarea
                            value={feedbackData.strengths}
                            onChange={e => setFeedbackData(prev => ({ ...prev, strengths: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
                            rows={2}
                            placeholder="What did they do well?"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Areas for Improvement</label>
                          <textarea
                            value={feedbackData.improvements}
                            onChange={e => setFeedbackData(prev => ({ ...prev, improvements: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
                            rows={2}
                            placeholder="What could be improved?"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={submittingFeedback || feedbackData.workQuality < 1 || feedbackData.timeliness < 1 || feedbackData.communication < 1}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-5">
          {/* SLA Info Card */}
          {task.slaHours && (
            <div className={`rounded-2xl border shadow-sm p-5 ${task.slaBreached ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${task.slaBreached ? 'bg-red-500' : 'bg-gradient-to-br from-violet-500 to-purple-600'}`}>
                  <ShieldAlert className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Target Hours</span>
                <span className="text-sm font-bold text-slate-800">{task.slaHours}h</span>
              </div>
              {task.slaBreached && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  SLA has been breached
                </div>
              )}
            </div>
          )}

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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Est. Hours
                  </span>
                  <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {task.estimatedHours}h
                  </span>
                </div>
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
                    <span className={`text-sm font-semibold ${days < 0 ? 'text-rose-700' : days <= 2 ? 'text-amber-700' : 'text-emerald-700'}`}>
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
                {task.startedAt && (
                  <div className="flex items-center justify-between text-xs text-blue-500">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Started</span>
                    <span>{formatDateTime(task.startedAt)}</span>
                  </div>
                )}
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

      {/* Pause/Resume Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction === 'pause'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handlePause}
        title="Pause This Task?"
        message="Work logging and completion will be blocked while the task is paused. You can resume it at any time."
        confirmLabel="Pause Task"
        variant="warning"
        icon={Pause}
        isLoading={actionLoading}
      />
      <ConfirmModal
        isOpen={confirmAction === 'resume'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleResume}
        title="Resume This Task?"
        message="The task will be set back to In Progress and work logging will be re-enabled."
        confirmLabel="Resume Task"
        variant="success"
        icon={Play}
        isLoading={actionLoading}
      />

      {/* Employee Pause Request Modal */}
      {showPauseRequestModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPauseRequestModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Pause className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request Pause</h3>
                <p className="text-xs text-slate-500">Your TeamLead will review this request</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for pause</label>
              <textarea
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
                placeholder="Describe why you need this task paused..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowPauseRequestModal(false); setPauseReason(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!pauseReason.trim()) { toast.error('Please provide a reason'); return; }
                  try {
                    setSubmittingPauseRequest(true);
                    await pauseRequestApi.createRequest(task.taskId, pauseReason.trim());
                    toast.success('Pause request submitted!');
                    setShowPauseRequestModal(false);
                    setPauseReason('');
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to submit pause request');
                  } finally {
                    setSubmittingPauseRequest(false);
                  }
                }}
                disabled={submittingPauseRequest}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingPauseRequest ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      <ReassignModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        taskId={task?.taskId}
        currentAssigneeName={task?.assigneeName}
        onReassigned={() => {
          setShowReassignModal(false);
          fetchTask();
        }}
      />
    </div>
  );
};

export default TaskDetailPage;
