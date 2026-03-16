import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, FolderKanban, CheckCircle, Clock, AlertTriangle,
    BarChart3, User, Users2, Flag, PauseCircle, ShieldAlert, Play, Pause, Ban, XCircle,
    Star, MessageSquare, Zap, Award, TrendingUp, Trash2
} from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { projectApi } from '../../api/projectApi';
import { workloadApi } from '../../api/workloadApi';
import { feedbackApi } from '../../api/feedbackApi';
import api from '../../api/axiosInstance';
import ConfirmModal from '../../components/common/ConfirmModal';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import CustomSelect from '../../components/common/CustomSelect';
import DateTimePicker from '../../components/common/DateTimePicker';
import { TASK_PRIORITY_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [subtasks, setSubtasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 1,
        deadline: '',
        estimatedHours: '',
        requiredSkills: '',
    });
    const [errors, setErrors] = useState({});

    // Workload preview state
    const [assigneeWorkload, setAssigneeWorkload] = useState(null);
    const [loadingWorkload, setLoadingWorkload] = useState(false);

    // AI Suggestion state
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Feedback state
    const [feedbackTaskId, setFeedbackTaskId] = useState(null);
    const [feedbackData, setFeedbackData] = useState({ workQuality: 0, timeliness: 0, communication: 0, strengths: '', improvements: '' });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [submittedFeedbacks, setSubmittedFeedbacks] = useState(new Set());

    const fetchProject = useCallback(async () => {
        try {
            setIsLoading(true);
            // Fetch project from Projects API (enriched response with members + tasks)
            const projRes = await projectApi.getById(id);
            const p = projRes.data;

            // Map project data to a format compatible with the existing UI
            setProject({
                id: p.projectId,
                title: p.name,
                description: p.description,
                status: p.status ?? 0,
                priority: 1,
                deadline: null,
                createdDate: p.createdDate,
                assigneeName: p.leadName,
                assignerName: p.managerName,
                teamName: p.teamName,
                isProject: true,
                subTaskCount: p.taskCount ?? 0,
                completedSubTaskCount: p.completedTaskCount ?? 0,
            });

            // Set tasks from embedded tasks list
            const tasks = (p.tasks || []).map(t => ({
                id: t.taskId,
                title: t.title,
                description: t.description,
                assigneeId: t.assigneeId,
                assigneeName: t.assigneeName,
                priority: t.priority,
                status: t.status,
                deadline: t.deadline,
                estimatedHours: t.estimatedHours,
                createdDate: t.createdDate,
                subTaskCount: t.subTaskCount ?? 0,
                completedSubTaskCount: t.completedSubTaskCount ?? 0,
            }));
            setSubtasks(tasks);

            // Set members from embedded members list (as eligible assignees)
            const members = (p.members || []).map(m => ({
                userId: m.userId,
                name: m.name,
                email: m.email,
                role: m.role,
            }));
            setTeamMembers(members);
        } catch (err) {
            console.error('Failed to load project:', err);
            toast.error('Failed to load project');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const handleCreate = async () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.assignedTo) errs.assignedTo = 'Select an assignee';
        if (!form.deadline) errs.deadline = 'Deadline is required';
        if (!form.estimatedHours || Number(form.estimatedHours) <= 0) errs.estimatedHours = 'Valid hours required';
        if (!form.requiredSkills?.trim()) errs.requiredSkills = 'At least one skill is required';
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            setCreating(true);
            await taskApi.create({
                title: form.title,
                description: form.description,
                assigneeId: Number(form.assignedTo),
                projectId: Number(id),
                priority: Number(form.priority),
                deadline: form.deadline,
                estimatedHours: Number(form.estimatedHours),
                requiredSkills: form.requiredSkills || null,
            });
            toast.success('Subtask created successfully');
            setShowCreateModal(false);
            setShowSuggestions(false);
            setSuggestions([]);
            setForm({ title: '', description: '', assignedTo: '', priority: 1, deadline: '', estimatedHours: '', requiredSkills: '' });
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create subtask');
        } finally {
            setCreating(false);
        }
    };

    // AI Suggestion handler
    const handleSuggestEmployees = async () => {
        if (!form.requiredSkills?.trim()) {
            toast.error('Enter required skills first (e.g. React,SQL)');
            return;
        }
        if (!project?.id) {
            toast.error('No project found');
            return;
        }
        try {
            setLoadingSuggestions(true);
            const res = await workloadApi.getSkillRecommendation(
                project.id,
                form.requiredSkills,
                Number(form.estimatedHours) || 8,
                Number(id) // projectId — restrict to project members only
            );
            setSuggestions(res.data || []);
            setShowSuggestions(true);
        } catch (err) {
            toast.error('Failed to get AI suggestions');
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Feedback handler
    const handleSubmitFeedback = async (taskId) => {
        const { workQuality, timeliness, communication } = feedbackData;
        if (workQuality < 1 || timeliness < 1 || communication < 1) {
            toast.error('Please rate all three criteria (1-5)');
            return;
        }
        try {
            setSubmittingFeedback(true);
            await feedbackApi.submit({
                taskId,
                workQualityRating: workQuality,
                timelinessRating: timeliness,
                communicationRating: communication,
                strengths: feedbackData.strengths,
                improvements: feedbackData.improvements
            });
            toast.success('Feedback submitted!');
            setSubmittedFeedbacks(prev => new Set([...prev, taskId]));
            setFeedbackTaskId(null);
            setFeedbackData({ workQuality: 0, timeliness: 0, communication: 0, strengths: '', improvements: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    // Confirmation modal state for subtask pause/resume
    const [confirmAction, setConfirmAction] = useState(null); // {type: 'pause'|'resume'|'delete', taskId}

    const handleDelete = async (taskId) => {
        try {
            setActionLoading(true);
            await taskApi.delete(taskId);
            toast.success('Task deleted successfully');
            setConfirmAction(null);
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete task');
        } finally {
            setActionLoading(false);
        }
    };
    const [actionLoading, setActionLoading] = useState(false);

    const handlePause = async (taskId, e) => {
        if (e) e.stopPropagation();
        try {
            setActionLoading(true);
            const api = (await import('../../api/axiosInstance')).default;
            await api.patch(`/api/tasks/${taskId}/pause`, { reason: 'Paused by TeamLead' });
            toast.success('Subtask paused successfully');
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to pause');
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
        }
    };

    const handleResume = async (taskId, e) => {
        if (e) e.stopPropagation();
        try {
            setActionLoading(true);
            const api = (await import('../../api/axiosInstance')).default;
            await api.patch(`/api/tasks/${taskId}/resume`);
            toast.success('Subtask resumed successfully');
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resume');
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
        }
    };

    const getStatusConfig = (status) => {
        const map = {
            0: { label: 'Pending', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
            1: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
            2: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
            3: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
            4: { label: 'Paused', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
            5: { label: 'Blocked', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
            6: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
        };
        return map[status] || map[0];
    };

    const getPriorityLabel = (p) => ['Low', 'Medium', 'High', 'Critical'][p] || 'Medium';
    const getPriorityColor = (p) => ['text-emerald-600', 'text-blue-600', 'text-amber-600', 'text-red-600'][p] || 'text-blue-600';

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-60 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-20">
                <h2 className="text-lg font-semibold text-slate-600">Project not found</h2>
                <Button onClick={() => navigate('/teamlead/projects')} className="mt-4">Back to Projects</Button>
            </div>
        );
    }

    const progress = project.subTaskCount > 0
        ? Math.round((project.completedSubTaskCount / project.subTaskCount) * 100)
        : 0;

    const completedCount = subtasks.filter(t => t.status === 3).length;
    const activeCount = subtasks.filter(t => t.status !== 3).length;
    const isPaused = project.status === 4;
    const isCompleted = project.status === 3;
    const isBlocked = project.status === 5;
    const isCancelled = project.status === 6;
    const canComplete = subtasks.length > 0 && completedCount === subtasks.length && !isPaused && !isCompleted && !isCancelled;

    // Only show Employees in the subtask assignment dropdown (exclude Manager, TeamLead, Admin)
    const employeeMembers = teamMembers.filter(m => (m.role || '').toLowerCase() === 'employee');
    const employeeOptions = [
        { value: '', label: employeeMembers.length > 0 ? 'Select employee' : 'No employees available' },
        ...employeeMembers.map(m => ({ value: m.userId, label: m.name || `${m.firstName || ''} ${m.lastName || ''}` }))
    ];

    const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => ({
        value: Number(key), label
    }));

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <button onClick={() => navigate('/teamlead/projects')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Back to Projects
            </button>

            <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <FolderKanban className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{project.title}</h1>
                                <p className="text-white/70 text-sm mt-0.5">{project.teamName} • Assigned by {project.assignerName}</p>
                            </div>
                        </div>
                        <Button
                            icon={Plus}
                            onClick={() => setShowCreateModal(true)}
                            className="!bg-white !text-indigo-600 hover:!bg-white/90"
                            disabled={isPaused || isCompleted || isCancelled || isBlocked}
                            title={isPaused ? 'Cannot create subtasks while project is paused' : isCompleted ? 'Project is completed' : isCancelled ? 'Project is cancelled' : isBlocked ? 'Project is blocked' : ''}
                        >
                            Create Subtask
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-white font-bold text-sm">{progress}%</span>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-white/70">
                        <span>{completedCount} completed</span>
                        <span>{activeCount} active</span>
                        <span>{subtasks.length} total</span>
                    </div>
                </div>
            </div>

            {/* Paused / Completed Banner */}
            {isPaused && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                    <PauseCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-orange-700">Project Paused</p>
                        <p className="text-xs text-orange-500">Subtask creation, completion, and work logging are blocked until the project is resumed.</p>
                    </div>
                </div>
            )}
            {canComplete && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-emerald-700">All subtasks completed!</p>
                        <p className="text-xs text-emerald-500">This project is eligible for completion.</p>
                    </div>
                </div>
            )}
            {isBlocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-red-700">Project Blocked</p>
                        <p className="text-xs text-red-500">This project is currently blocked and cannot progress.</p>
                    </div>
                </div>
            )}
            {isCancelled && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Project Cancelled</p>
                        <p className="text-xs text-gray-400">This project has been cancelled by an administrator.</p>
                    </div>
                </div>
            )}

            {/* Project Info */}
            {project.description && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-slate-700">{project.description}</p>
                </div>
            )}

            {/* Project Members */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Users2 className="w-4 h-4 text-indigo-500" />
                        Project Members ({teamMembers.length})
                    </h3>
                </div>
                {teamMembers.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-slate-500">No members assigned</h4>
                        <p className="text-xs text-slate-400 mt-1">Members will appear here once added to the project</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {teamMembers.map(member => (
                            <div key={member.userId} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{member.name}</p>
                                        <p className="text-xs text-slate-400">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        member.role === 'TeamLead' || member.role === 'Team Lead'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {member.role}
                                    </span>
                                    {member.isLead && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                            <Star className="w-3 h-3" /> Lead
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Subtasks */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        Subtasks ({subtasks.length})
                    </h3>
                </div>

                {subtasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-slate-500">No subtasks yet</h4>
                        <p className="text-xs text-slate-400 mt-1">Create subtasks to break down this project</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {subtasks.map(task => {
                            const sc = getStatusConfig(task.status);
                            const isCompleted = task.status === 3;
                            const hasFeedback = submittedFeedbacks.has(task.id);
                            return (
                                <div key={task.id}>
                                <div
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                    className="px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 mb-1">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                                            <h4 className="font-medium text-slate-800 truncate">{task.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 ml-4">
                                            {task.assigneeName && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {task.assigneeName}
                                                </span>
                                            )}
                                            {task.deadline && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span className={`font-semibold ${getPriorityColor(task.priority)}`}>
                                                {getPriorityLabel(task.priority)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {task.status !== 3 && task.status !== 4 && task.status !== 5 && task.status !== 6 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'pause', taskId: task.id }); }}
                                                className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                                title="Pause subtask"
                                            >
                                                <Pause className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {task.status === 4 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'resume', taskId: task.id }); }}
                                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                title="Resume subtask"
                                            >
                                                <Play className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {isCompleted && !hasFeedback && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFeedbackTaskId(task.id); }}
                                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                                title="Give feedback"
                                            >
                                                <Star className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {isCompleted && hasFeedback && (
                                            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600" title="Feedback submitted">
                                                <Award className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'delete', taskId: task.id }); }}
                                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                            title="Delete subtask"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                                            {sc.label}
                                        </span>
                                    </div>
                                </div>
                                {/* Inline Feedback Form */}
                                {feedbackTaskId === task.id && (
                                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-200" onClick={e => e.stopPropagation()}>
                                        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-indigo-500" />
                                            Evaluate {task.assigneeName || 'Employee'}'s performance
                                        </p>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
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
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => { setFeedbackTaskId(null); setFeedbackData({ workQuality: 0, timeliness: 0, communication: 0, strengths: '', improvements: '' }); }}
                                                className="px-4 py-2 text-slate-500 text-sm hover:text-slate-700 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSubmitFeedback(task.id)}
                                                disabled={submittingFeedback || feedbackData.workQuality < 1 || feedbackData.timeliness < 1 || feedbackData.communication < 1}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                {submittingFeedback ? 'Saving...' : 'Submit Feedback'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create SubTask Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Subtask"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button onClick={handleCreate} isLoading={creating}>Create Subtask</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Subtask Title</label>
                        <input
                            value={form.title}
                            onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: '' })); }}
                            className={`input ${errors.title ? 'input-error' : ''}`}
                            placeholder="e.g. Implement login API"
                        />
                        {errors.title && <p className="text-xs text-danger-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="label">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                            className="input"
                            placeholder="Describe the subtask..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Assign To</label>
                            <CustomSelect
                                value={form.assignedTo}
                                onChange={val => {
                                    setForm(p => ({ ...p, assignedTo: val }));
                                    setErrors(p => ({ ...p, assignedTo: '' }));
                                    // Fetch workload for selected employee
                                    if (val) {
                                        setLoadingWorkload(true);
                                        api.get(`/api/workload/employee/${val}`)
                                            .then(res => setAssigneeWorkload(res.data))
                                            .catch(() => setAssigneeWorkload(null))
                                            .finally(() => setLoadingWorkload(false));
                                    } else {
                                        setAssigneeWorkload(null);
                                    }
                                }}
                                options={employeeOptions}
                                placeholder="Select team member"
                                icon={User}
                                className={errors.assignedTo ? 'ring-2 ring-danger-200 rounded-lg' : ''}
                            />
                            {errors.assignedTo && <p className="text-xs text-danger-500 mt-1">{errors.assignedTo}</p>}

                            {/* Workload Preview */}
                            {loadingWorkload && (
                                <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-400 animate-pulse">Loading workload...</div>
                            )}
                            {assigneeWorkload && !loadingWorkload && (() => {
                                const current = assigneeWorkload.estimatedWorkloadHours || 0;
                                const newHours = Number(form.estimatedHours) || 0;
                                const projected = current + newHours;
                                const capacity = assigneeWorkload.weeklyCapacity || 40;
                                const percent = capacity > 0 ? Math.round((projected / capacity) * 100) : 0;
                                return (
                                    <div className={`mt-2 p-3 rounded-lg border text-xs ${
                                        percent > 100 ? 'bg-red-50 border-red-200' :
                                        percent > 80 ? 'bg-amber-50 border-amber-200' :
                                        'bg-emerald-50 border-emerald-200'
                                    }`}>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Zap className={`w-3.5 h-3.5 ${percent > 100 ? 'text-red-500' : percent > 80 ? 'text-amber-500' : 'text-emerald-500'}`} />
                                            <span className="font-semibold text-slate-700">Workload Preview</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-500">Current: {current}h</span>
                                            <span className="text-slate-500">+ {newHours}h = <strong className="text-slate-700">{projected}h</strong></span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden mb-1.5">
                                            <div className={`h-full rounded-full transition-all ${percent > 100 ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`font-bold ${percent > 100 ? 'text-red-600' : percent > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {percent}% of {capacity}h capacity
                                            </span>
                                        </div>
                                        {percent > 100 && (
                                            <div className="flex items-center gap-1 mt-1.5 text-red-600 font-semibold">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Employee will exceed weekly capacity
                                            </div>
                                        )}
                                        {percent > 80 && percent <= 100 && (
                                            <div className="flex items-center gap-1 mt-1.5 text-amber-600 font-semibold">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Employee is nearing capacity
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                        <div>
                            <label className="label">Priority</label>
                            <CustomSelect
                                value={form.priority}
                                onChange={val => setForm(p => ({ ...p, priority: val }))}
                                options={priorityOptions}
                                placeholder="Select priority"
                                icon={Flag}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Deadline</label>
                            <DateTimePicker
                                value={form.deadline}
                                onChange={val => { setForm(p => ({ ...p, deadline: val })); setErrors(p => ({ ...p, deadline: '' })); }}
                                error={!!errors.deadline}
                                placeholder="Select deadline"
                            />
                            {errors.deadline && <p className="text-xs text-danger-500 mt-1">{errors.deadline}</p>}
                        </div>
                        <div>
                            <label className="label">Estimated Hours</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={form.estimatedHours}
                                onChange={e => { setForm(p => ({ ...p, estimatedHours: e.target.value })); setErrors(p => ({ ...p, estimatedHours: '' })); }}
                                className={`input ${errors.estimatedHours ? 'input-error' : ''}`}
                                placeholder="e.g. 8"
                            />
                            {errors.estimatedHours && <p className="text-xs text-danger-500 mt-1">{errors.estimatedHours}</p>}
                        </div>
                        <div>
                            <label className="label">Required Skills <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    value={form.requiredSkills}
                                    onChange={e => { setForm(p => ({ ...p, requiredSkills: e.target.value })); setErrors(p => ({ ...p, requiredSkills: '' })); }}
                                    className={`input flex-1 ${errors.requiredSkills ? 'input-error' : ''}`}
                                    placeholder="e.g. React,SQL"
                                />
                                <button
                                    type="button"
                                    onClick={handleSuggestEmployees}
                                    disabled={loadingSuggestions}
                                    className="px-3 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-semibold rounded-lg hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                                >
                                    {loadingSuggestions ? 'Loading...' : 'Suggest'}
                                </button>
                            </div>
                            {errors.requiredSkills && <p className="text-xs text-danger-500 mt-1">{errors.requiredSkills}</p>}
                            <p className="text-[10px] text-slate-400 mt-1">Skills are used for AI assignment and skill tracking</p>
                        </div>
                    </div>

                    {/* AI Suggestion Panel */}
                    {showSuggestions && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200">
                            <h4 className="text-sm font-bold text-violet-800 mb-3 flex items-center gap-2">
                                AI Recommended Assignees
                                <span className="text-xs font-normal text-violet-500 ml-auto">Click to assign</span>
                            </h4>
                            {suggestions.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No matching employees found. Try different skills or check team composition.</p>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={s.userId}
                                            onClick={() => {
                                                setForm(p => ({ ...p, assignedTo: s.userId }));
                                                setErrors(p => ({ ...p, assignedTo: '' }));
                                                // Trigger workload fetch
                                                setLoadingWorkload(true);
                                                api.get(`/api/workload/employee/${s.userId}`)
                                                    .then(res => setAssigneeWorkload(res.data))
                                                    .catch(() => setAssigneeWorkload(null))
                                                    .finally(() => setLoadingWorkload(false));
                                                toast.success(`Selected ${s.name}`);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                                                Number(form.assignedTo) === s.userId
                                                    ? 'bg-white border-violet-400 ring-2 ring-violet-200 shadow-sm'
                                                    : 'bg-white/70 border-violet-100 hover:border-violet-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                        idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-slate-800">{s.name}</p>
                                                        <p className="text-xs text-slate-500">{s.reason}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    {s.warning && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                                            s.warning === 'Overloaded' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            <AlertTriangle className="w-3 h-3" />
                                                            {s.warning}
                                                        </span>
                                                    )}
                                                    <div>
                                                        <p className="text-lg font-bold text-violet-700">{s.assignmentScore}</p>
                                                        <p className="text-[10px] text-slate-400">Score</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Workload bar */}
                                            <div className="mb-2">
                                                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                                                    <span>Workload: {s.estimatedWorkloadHours || 0}h / {s.weeklyCapacity || 40}h</span>
                                                    <span className={`font-bold ${s.workload > 100 ? 'text-red-600' : s.workload > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>{s.workload}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${
                                                        s.workload > 100 ? 'bg-red-500' : s.workload > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`} style={{ width: `${Math.min(s.workload, 100)}%` }} />
                                                </div>
                                            </div>

                                            <div className="flex gap-1.5 flex-wrap">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full">Skill {s.skillMatchPercentage}%</span>
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full">Avail {s.availabilityScore}</span>
                                                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded-full">Perf {s.performanceScore}</span>
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-semibold rounded-full">Feedback {s.feedbackScore}</span>
                                                <span className="px-2 py-0.5 bg-pink-50 text-pink-600 text-[10px] font-semibold rounded-full">Review {s.managerScore}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <p className="text-[10px] text-violet-400 mt-3 text-center italic">AI suggests candidates only — you choose who to assign</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Subtask Pause/Resume Confirmation Modals */}
            <ConfirmModal
                isOpen={confirmAction?.type === 'pause'}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handlePause(confirmAction?.taskId)}
                title="Pause This Subtask?"
                message="Work logging and completion will be blocked while the subtask is paused."
                confirmLabel="Pause Subtask"
                variant="warning"
                icon={Pause}
                isLoading={actionLoading}
            />
            <ConfirmModal
                isOpen={confirmAction?.type === 'resume'}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleResume(confirmAction?.taskId)}
                title="Resume This Subtask?"
                message="The subtask will be set back to active and work logging will be re-enabled."
                confirmLabel="Resume Subtask"
                variant="success"
                icon={Play}
                isLoading={actionLoading}
            />
            <ConfirmModal
                isOpen={confirmAction?.type === 'delete'}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleDelete(confirmAction?.taskId)}
                title="Delete This Task?"
                message="This action is permanent. The task and all its related data (work logs, feedback, notifications) will be removed."
                confirmLabel="Delete Task"
                variant="danger"
                icon={Trash2}
                isLoading={actionLoading}
            />
        </div>
    );
};

export default ProjectDetailPage;
