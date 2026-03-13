import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FolderKanban, CheckCircle, Clock, AlertTriangle, Users2,
    BarChart3, User, Flag, PauseCircle, Activity, Plus, Trash2, Shield
} from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { teamApi } from '../../api/teamApi';
import api from '../../api/axiosInstance';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const ManagerProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [subtasks, setSubtasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [health, setHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Add member state
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    const fetchProject = useCallback(async () => {
        try {
            setIsLoading(true);
            const projRes = await taskApi.getById(id);
            setProject(projRes.data);

            // Fetch subtasks
            try {
                const subtaskRes = await taskApi.getSubTasks(id);
                setSubtasks(subtaskRes.data || []);
            } catch { setSubtasks([]); }

            // Load team members
            if (projRes.data.teamId) {
                try {
                    const membersRes = await teamApi.getMembers(projRes.data.teamId);
                    setTeamMembers(membersRes.data || []);
                } catch { /* ignore */ }
            }

            // Fetch project health
            try {
                const healthRes = await api.get(`/api/workload/project-health/${id}`);
                setHealth(healthRes.data);
            } catch { /* ignore */ }
        } catch (err) {
            console.error('Failed to load project:', err);
            toast.error('Failed to load project');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchProject(); }, [fetchProject]);

    // Load available users for adding to team
    useEffect(() => {
        const loadAvailableUsers = async () => {
            try {
                const res = await api.get('/api/users/my-employees');
                const employees = (res.data || []).filter(u =>
                    (u.role || '').toLowerCase() === 'employee' || (u.role || '').toLowerCase() === 'teamlead'
                );
                setAvailableUsers(employees);
            } catch { /* ignore */ }
        };
        loadAvailableUsers();
    }, []);

    const handleAddMember = async () => {
        if (!selectedUserId || !project?.teamId) return;
        try {
            setAddingMember(true);
            await api.post(`/api/teams/${project.teamId}/members`, { userId: Number(selectedUserId) });
            toast.success('Member added to team');
            setSelectedUserId('');
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!project?.teamId) return;
        try {
            await api.delete(`/api/teams/${project.teamId}/members/${userId}`);
            toast.success('Member removed');
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove member');
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

    const getHealthBadge = (h) => {
        const map = {
            'Healthy': 'bg-emerald-100 text-emerald-700',
            'At Risk': 'bg-amber-100 text-amber-700',
            'Critical': 'bg-red-100 text-red-700',
            'No Tasks': 'bg-slate-100 text-slate-500',
        };
        return map[h] || map['No Tasks'];
    };

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
                <Button onClick={() => navigate('/manager/projects')} className="mt-4">Back to Projects</Button>
            </div>
        );
    }

    const progress = project.subTaskCount > 0
        ? Math.round((project.completedSubTaskCount / project.subTaskCount) * 100)
        : 0;

    const completedCount = subtasks.filter(t => t.status === 3).length;
    const activeCount = subtasks.filter(t => [0, 1, 2].includes(t.status)).length;
    const pausedCount = subtasks.filter(t => t.status === 4).length;
    const overdueCount = subtasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 3).length;

    const progressColor = progress >= 100 ? 'bg-emerald-500'
        : progress >= 50 ? 'bg-blue-500'
            : progress >= 25 ? 'bg-amber-500' : 'bg-rose-500';

    // Filter available users to exclude already added members
    const memberIds = new Set(teamMembers.map(m => m.userId));
    const filteredAvailable = availableUsers.filter(u => !memberIds.has(u.userId));

    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'team', label: 'Team', icon: Users2 },
        { key: 'tasks', label: 'Subtasks', icon: FolderKanban },
    ];

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <button onClick={() => navigate('/manager/projects')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Back to Projects
            </button>

            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                                <h1 className="text-2xl font-bold">{project.title}</h1>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusConfig(project.status).color}`}>
                                    {getStatusConfig(project.status).label}
                                </span>
                                {health && (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getHealthBadge(health.health)}`}>
                                        {health.health}
                                    </span>
                                )}
                            </div>
                            {project.description && <p className="text-white/80 text-sm">{project.description}</p>}
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-white/80">
                            {project.assigneeName && (
                                <span className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Lead: {project.assigneeName}
                                </span>
                            )}
                            {project.teamName && (
                                <span className="flex items-center gap-1.5">
                                    <Users2 className="w-3.5 h-3.5" /> {project.teamName}
                                </span>
                            )}
                            {project.deadline && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {new Date(project.deadline).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-sm font-bold min-w-[40px] text-right">{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                    <p className="text-2xl font-bold text-slate-700">{subtasks.length}</p>
                    <p className="text-xs text-slate-400">Total</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                    <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
                    <p className="text-xs text-slate-400">Completed</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                    <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
                    <p className="text-xs text-slate-400">Active</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                    <p className="text-2xl font-bold text-orange-600">{pausedCount}</p>
                    <p className="text-xs text-slate-400">Paused</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                    <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>{overdueCount}</p>
                    <p className="text-xs text-slate-400">Overdue</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer
                                ${activeTab === tab.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Icon className="w-4 h-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" /> Project Analytics
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
                                <p className="text-3xl font-bold text-indigo-700">{progress}%</p>
                                <p className="text-sm text-indigo-600 mt-1">Completion</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                                <p className="text-3xl font-bold text-emerald-700">{completedCount}/{subtasks.length}</p>
                                <p className="text-sm text-emerald-600 mt-1">Tasks Done</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                                <p className="text-3xl font-bold text-amber-700">{teamMembers.length}</p>
                                <p className="text-sm text-amber-600 mt-1">Team Size</p>
                            </div>
                        </div>
                    </div>

                    {health && (
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" /> Health Status
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold text-emerald-600">{health.completedSubTasks}</p>
                                    <p className="text-xs text-slate-500">Done</p>
                                </div>
                                <div className={`rounded-lg p-3 text-center ${health.overdueSubTasks > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                                    <p className={`text-xl font-bold ${health.overdueSubTasks > 0 ? 'text-red-600' : 'text-slate-400'}`}>{health.overdueSubTasks}</p>
                                    <p className="text-xs text-slate-500">Overdue</p>
                                </div>
                                <div className={`rounded-lg p-3 text-center ${health.criticalSubTasks > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}>
                                    <p className={`text-xl font-bold ${health.criticalSubTasks > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{health.criticalSubTasks}</p>
                                    <p className="text-xs text-slate-500">Critical</p>
                                </div>
                                <div className={`rounded-lg p-3 text-center ${health.pausedSubTasks > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                    <p className={`text-xl font-bold ${health.pausedSubTasks > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{health.pausedSubTasks}</p>
                                    <p className="text-xs text-slate-500">Paused</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'team' && (
                <div className="space-y-4">
                    {/* Add Member */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-500" /> Add Team Member
                        </h3>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Select Employee</label>
                                <select
                                    value={selectedUserId}
                                    onChange={e => setSelectedUserId(e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="">
                                        {filteredAvailable.length > 0 ? 'Select employee to add...' : 'No available employees'}
                                    </option>
                                    {filteredAvailable.map(u => (
                                        <option key={u.userId} value={u.userId}>
                                            {u.firstName} {u.lastName} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleAddMember} disabled={!selectedUserId || addingMember} isLoading={addingMember}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </div>
                    </div>

                    {/* Team List */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Users2 className="w-5 h-5 text-indigo-500" /> Team Members ({teamMembers.length})
                        </h3>
                        {teamMembers.length === 0 ? (
                            <p className="text-center text-slate-400 py-6">No team members yet</p>
                        ) : (
                            <div className="space-y-2">
                                {teamMembers.map((m, idx) => (
                                    <div key={m.userId || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {(m.name || `${m.firstName || ''} ${m.lastName || ''}`).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{m.name || `${m.firstName || ''} ${m.lastName || ''}`}</p>
                                                <p className="text-xs text-slate-500">{m.role || 'Employee'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMember(m.userId)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                            title="Remove from team"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'tasks' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-indigo-500" /> Subtasks ({subtasks.length})
                        </h3>
                    </div>
                    {subtasks.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <FolderKanban className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                            <p>No subtasks created yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {subtasks.map(task => {
                                const sc = getStatusConfig(task.status);
                                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 3;
                                return (
                                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                         onClick={() => navigate(`/tasks/${task.id}`)}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h4 className="text-sm font-semibold text-slate-800 truncate">{task.title}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                                                <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>{getPriorityLabel(task.priority)}</span>
                                                {isOverdue && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">OVERDUE</span>}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                {task.assigneeName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assigneeName}</span>}
                                                {task.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(task.deadline).toLocaleDateString()}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManagerProjectDetailPage;
