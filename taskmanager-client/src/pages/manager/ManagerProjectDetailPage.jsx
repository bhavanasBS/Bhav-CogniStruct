import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FolderKanban, CheckCircle, Clock, AlertTriangle, Users2,
    BarChart3, User, Flag, PauseCircle, Activity, Plus, Trash2, Shield,
    X, Search, Crown, UserPlus
} from 'lucide-react';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import api from '../../api/axiosInstance';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const ManagerProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [health, setHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Add member state
    const [showAddMember, setShowAddMember] = useState(false);
    const [eligibleEmployees, setEligibleEmployees] = useState([]);
    const [selectedNewMembers, setSelectedNewMembers] = useState([]);
    const [addingMembers, setAddingMembers] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');

    const fetchProject = useCallback(async () => {
        try {
            setIsLoading(true);
            // Fetch project details
            const projRes = await projectApi.getById(id);
            setProject(projRes.data);

            // Fetch members
            try {
                const membersRes = await projectApi.getMembers(id);
                setMembers(membersRes.data || []);
            } catch { setMembers([]); }

            // Fetch tasks linked to this project
            try {
                const tasksRes = await taskApi.getAll({ projectId: id });
                setTasks(tasksRes.data?.items || tasksRes.data || []);
            } catch { setTasks([]); }

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

    // Load eligible employees when add member panel opens
    useEffect(() => {
        if (!showAddMember) return;
        const loadEligible = async () => {
            try {
                const res = await projectApi.getEligibleEmployees(id);
                setEligibleEmployees(res.data || []);
            } catch { setEligibleEmployees([]); }
        };
        loadEligible();
    }, [showAddMember, id]);

    const handleAddMembers = async () => {
        if (selectedNewMembers.length === 0) return;
        try {
            setAddingMembers(true);
            await projectApi.addMembers(id, selectedNewMembers);
            toast.success(`${selectedNewMembers.length} member(s) added`);
            setSelectedNewMembers([]);
            setShowAddMember(false);
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add members');
        } finally {
            setAddingMembers(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await projectApi.removeMember(id, userId);
            toast.success('Member removed');
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const toggleNewMember = (userId) => {
        setSelectedNewMembers(prev =>
            prev.includes(userId) ? prev.filter(i => i !== userId) : [...prev, userId]
        );
    };

    const filteredEligible = eligibleEmployees.filter(e =>
        `${e.name || ''} ${e.email || ''}`.toLowerCase().includes(memberSearch.toLowerCase())
    );

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
        };
        return map[h] || 'bg-slate-100 text-slate-500';
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center p-12">
                <p className="text-slate-500">Project not found</p>
                <Button onClick={() => navigate('/manager/projects')} className="mt-4">Back to Projects</Button>
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.status === 3).length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/manager/projects')}
                        className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{project.name}</h1>
                            {project.description && (
                                <p className="text-white/80 text-sm mt-1 max-w-2xl">{project.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                {project.leadName && (
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium flex items-center gap-1.5">
                                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                                        Lead: {project.leadName}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium flex items-center gap-1.5">
                                    <Users2 className="w-3.5 h-3.5" />
                                    {members.length} members
                                </span>
                                {health && (
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getHealthBadge(health.health)}`}>
                                        {health.health}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                    <span className="text-sm font-bold text-slate-800">{progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-blue-500' : progress >= 25 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center gap-6 mt-3 text-sm">
                    <span className="text-slate-500">{tasks.length} total tasks</span>
                    <span className="text-emerald-600 font-semibold">{completedTasks} completed</span>
                    <span className="text-amber-600 font-semibold">{tasks.length - completedTasks} remaining</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    {['overview', 'members', 'tasks'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-6 py-3.5 text-sm font-semibold capitalize transition-colors ${
                                activeTab === tab
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Health Metrics */}
                            {health && (
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-slate-700">{health.totalSubTasks || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Total Tasks</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-emerald-600">{health.completedSubTasks || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Completed</p>
                                    </div>
                                    <div className={`rounded-xl p-4 text-center ${(health.overdueSubTasks || 0) > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                                        <p className={`text-2xl font-bold ${(health.overdueSubTasks || 0) > 0 ? 'text-red-600' : 'text-slate-400'}`}>{health.overdueSubTasks || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Overdue</p>
                                    </div>
                                    <div className={`rounded-xl p-4 text-center ${(health.criticalSubTasks || 0) > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}>
                                        <p className={`text-2xl font-bold ${(health.criticalSubTasks || 0) > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{health.criticalSubTasks || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Critical</p>
                                    </div>
                                    <div className={`rounded-xl p-4 text-center ${(health.pausedSubTasks || 0) > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                        <p className={`text-2xl font-bold ${(health.pausedSubTasks || 0) > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{health.pausedSubTasks || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Paused</p>
                                    </div>
                                </div>
                            )}

                            {/* Project Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Created By</p>
                                    <p className="text-sm font-semibold text-slate-700">{project.managerName || 'Unknown'}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Created Date</p>
                                    <p className="text-sm font-semibold text-slate-700">{new Date(project.createdDate).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Team Lead</p>
                                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                        {project.leadName ? (
                                            <><Crown className="w-4 h-4 text-amber-500" />{project.leadName}</>
                                        ) : 'Not assigned'}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Status</p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {['Active', 'Completed', 'Archived'][project.status] || 'Active'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Project Members
                                    <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                        {members.length}
                                    </span>
                                </h3>
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Member
                                </button>
                            </div>

                            {members.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Users2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No members yet. Add some to get started!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {members.map(member => (
                                        <div key={member.userId} className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                    member.isLead ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                                }`}>
                                                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-700">{member.name}</p>
                                                        {member.isLead && (
                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                                <Crown className="w-3 h-3" />
                                                                Lead
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">{member.role} · {member.email}</p>
                                                </div>
                                            </div>
                                            {!member.isLead && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                Tasks
                                <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                    {tasks.length}
                                </span>
                            </h3>

                            {tasks.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No tasks yet for this project.</p>
                                </div>
                            ) : (
                                tasks.map(task => {
                                    const status = getStatusConfig(task.status);
                                    return (
                                        <div
                                            key={task.taskId || task.id}
                                            onClick={() => navigate(`/tasks/${task.taskId || task.id}`)}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 cursor-pointer transition-colors border border-transparent hover:border-indigo-200"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot}`} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {task.assigneeName && `Assigned to ${task.assigneeName}`}
                                                        {task.deadline && ` · Due ${new Date(task.deadline).toLocaleDateString()}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                                    {getPriorityLabel(task.priority)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <UserPlus className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Add Members</h2>
                            </div>
                            <button onClick={() => { setShowAddMember(false); setSelectedNewMembers([]); }} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Search employees..."
                                />
                            </div>

                            <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                                {filteredEligible.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-400">No eligible employees found</div>
                                ) : (
                                    filteredEligible.map(emp => (
                                        <label
                                            key={emp.userId}
                                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors ${
                                                selectedNewMembers.includes(emp.userId) ? 'bg-indigo-50' : ''
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedNewMembers.includes(emp.userId)}
                                                onChange={() => toggleNewMember(emp.userId)}
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">{emp.name}</p>
                                                <p className="text-xs text-slate-400">{emp.role} · {emp.email}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={() => { setShowAddMember(false); setSelectedNewMembers([]); }}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMembers}
                                disabled={addingMembers || selectedNewMembers.length === 0}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {addingMembers ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Add {selectedNewMembers.length} Member{selectedNewMembers.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerProjectDetailPage;
