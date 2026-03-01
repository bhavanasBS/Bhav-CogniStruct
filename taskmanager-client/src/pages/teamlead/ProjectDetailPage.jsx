import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, FolderKanban, CheckCircle, Clock, AlertTriangle,
    BarChart3, User, Users2, Flag, Sparkles, PauseCircle, ShieldAlert, Play, Pause
} from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { teamApi } from '../../api/teamApi';
import ConfirmModal from '../../components/common/ConfirmModal';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import CustomSelect from '../../components/common/CustomSelect';
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

    const fetchProject = useCallback(async () => {
        try {
            setIsLoading(true);
            const [projRes, subtaskRes] = await Promise.all([
                taskApi.getById(id),
                taskApi.getSubTasks(id),
            ]);
            setProject(projRes.data);
            setSubtasks(subtaskRes.data || []);

            // Load team members
            if (projRes.data.teamId) {
                try {
                    const membersRes = await teamApi.getMembers(projRes.data.teamId);
                    setTeamMembers(membersRes.data || []);
                } catch { /* ignore */ }
            }
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
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            setCreating(true);
            await taskApi.create({
                title: form.title,
                description: form.description,
                assigneeId: Number(form.assignedTo),
                parentTaskId: Number(id),
                priority: Number(form.priority),
                deadline: form.deadline,
                estimatedHours: Number(form.estimatedHours),
                requiredSkills: form.requiredSkills || null,
            });
            toast.success('Subtask created successfully');
            setShowCreateModal(false);
            setForm({ title: '', description: '', assignedTo: '', priority: 1, deadline: '', estimatedHours: '', requiredSkills: '' });
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create subtask');
        } finally {
            setCreating(false);
        }
    };

    // Confirmation modal state for subtask pause/resume
    const [confirmAction, setConfirmAction] = useState(null); // {type: 'pause'|'resume', taskId}
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
    const canComplete = subtasks.length > 0 && completedCount === subtasks.length && !isPaused && !isCompleted;

    const employeeOptions = [
        { value: '', label: 'Select team member' },
        ...teamMembers.map(m => ({ value: m.userId, label: m.name || `${m.firstName || ''} ${m.lastName || ''}` }))
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
                            disabled={isPaused || isCompleted}
                            title={isPaused ? 'Cannot create subtasks while project is paused' : isCompleted ? 'Project is completed' : ''}
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

            {/* Project Info */}
            {project.description && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-slate-700">{project.description}</p>
                </div>
            )}

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
                            return (
                                <div
                                    key={task.id}
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
                                        {task.status !== 3 && task.status !== 4 && (
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
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                                            {sc.label}
                                        </span>
                                    </div>
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
                                onChange={val => { setForm(p => ({ ...p, assignedTo: val })); setErrors(p => ({ ...p, assignedTo: '' })); }}
                                options={employeeOptions}
                                placeholder="Select team member"
                                icon={User}
                                className={errors.assignedTo ? 'ring-2 ring-danger-200 rounded-lg' : ''}
                            />
                            {errors.assignedTo && <p className="text-xs text-danger-500 mt-1">{errors.assignedTo}</p>}
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
                            <input
                                type="datetime-local"
                                value={form.deadline}
                                onChange={e => { setForm(p => ({ ...p, deadline: e.target.value })); setErrors(p => ({ ...p, deadline: '' })); }}
                                className={`input ${errors.deadline ? 'input-error' : ''}`}
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
                            <label className="label">Required Skills</label>
                            <input
                                value={form.requiredSkills}
                                onChange={e => setForm(p => ({ ...p, requiredSkills: e.target.value }))}
                                className="input"
                                placeholder="e.g. React,SQL"
                            />
                        </div>
                    </div>
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
        </div>
    );
};

export default ProjectDetailPage;
