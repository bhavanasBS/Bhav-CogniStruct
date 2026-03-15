import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FolderKanban, CheckCircle, Clock, AlertTriangle, BarChart3,
    PauseCircle, Shield, TrendingUp, Activity, Plus, X, Users2, User, Search
} from 'lucide-react';
import { projectApi } from '../../api/projectApi';
import { teamApi } from '../../api/teamApi';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManagerProjectsPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [healthData, setHealthData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Create Project Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', leadId: '', teamId: '' });
    const [teams, setTeams] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [loadingMembers, setLoadingMembers] = useState(false);

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const res = await projectApi.getAll();
            const projectList = res.data || [];
            setProjects(projectList);

            // Fetch health for each project
            const healthMap = {};
            await Promise.all(
                projectList.map(async (p) => {
                    try {
                        const healthRes = await api.get(`/api/workload/project-health/${p.projectId}`);
                        healthMap[p.projectId] = healthRes.data;
                    } catch { /* ignore */ }
                })
            );
            setHealthData(healthMap);
        } catch (err) {
            console.error('Failed to load projects:', err);
            toast.error('Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    // Load teams when modal opens
    useEffect(() => {
        if (!showCreateModal) return;
        const loadTeams = async () => {
            try {
                const res = await teamApi.getAll();
                setTeams(res.data || []);
            } catch { /* ignore */ }
        };
        loadTeams();
    }, [showCreateModal]);

    // Load team members when team changes
    const handleTeamChange = async (teamId) => {
        setForm(p => ({ ...p, teamId, leadId: '' }));
        setSelectedMembers([]);
        setTeamMembers([]);
        if (!teamId) return;
        try {
            setLoadingMembers(true);
            const res = await teamApi.getMembers(teamId);
            setTeamMembers(res.data || []);
        } catch { /* ignore */ }
        finally { setLoadingMembers(false); }
    };

    const handleCreateProject = async () => {
        if (!form.name.trim()) {
            toast.error('Project name is required');
            return;
        }
        if (!form.teamId) {
            toast.error('Please select a team');
            return;
        }
        if (selectedMembers.length === 0) {
            toast.error('Please select at least one project member');
            return;
        }
        if (!form.leadId) {
            toast.error('Please select a Team Lead');
            return;
        }
        try {
            setCreating(true);
            await projectApi.create({
                name: form.name.trim(),
                description: form.description.trim() || null,
                leadId: Number(form.leadId),
                teamId: Number(form.teamId),
                memberUserIds: selectedMembers
            });
            toast.success('Project created successfully!');
            setShowCreateModal(false);
            setForm({ name: '', description: '', leadId: '', teamId: '' });
            setSelectedMembers([]);
            setTeamMembers([]);
            fetchProjects();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const toggleMember = (userId) => {
        setSelectedMembers(prev => {
            const next = prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId];
            // If the current lead is deselected, reset leadId
            if (!next.includes(Number(form.leadId))) {
                setForm(p => ({ ...p, leadId: '' }));
            }
            return next;
        });
    };

    const excludedRoles = ['manager', 'admin'];
    const filteredTeamMembers = teamMembers
        .filter(e => !excludedRoles.includes((e.role || '').toLowerCase()))
        .filter(e => `${e.name || ''} ${e.email || ''}`.toLowerCase().includes(employeeSearch.toLowerCase()));

    // Team Lead candidates = only selected members with TeamLead role
    const leadCandidates = teamMembers.filter(m =>
        selectedMembers.includes(m.userId) &&
        (m.role || '').toLowerCase() === 'teamlead'
    );

    const getHealthBadge = (health) => {
        const map = {
            'Healthy': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, iconColor: 'text-emerald-600' },
            'At Risk': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600' },
            'Critical': { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, iconColor: 'text-red-600' },
            'No Tasks': { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock, iconColor: 'text-slate-400' },
        };
        const h = map[health] || map['No Tasks'];
        const Icon = h.icon;
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${h.color}`}>
                <Icon className={`w-3.5 h-3.5 ${h.iconColor}`} />
                {health}
            </span>
        );
    };

    const getStatusLabel = (status) => ['Active', 'Completed', 'Archived'][status] || 'Active';
    const getStatusColor = (status) => ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-slate-100 text-slate-500'][status] || 'bg-emerald-100 text-emerald-700';

    const totalProjects = projects.length;
    const healthyCt = Object.values(healthData).filter(h => h.health === 'Healthy').length;
    const atRiskCt = Object.values(healthData).filter(h => h.health === 'At Risk').length;
    const criticalCt = Object.values(healthData).filter(h => h.health === 'Critical').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Project Overview
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Monitor and manage all your projects</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all text-sm border border-white/20 hover:border-white/40"
                    >
                        <Plus className="w-4 h-4" />
                        Create Project
                    </button>
                </div>
            </div>

            {/* Health Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalProjects}</p>
                            <p className="text-xs text-slate-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{healthyCt}</p>
                            <p className="text-xs text-slate-500">Healthy</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{atRiskCt}</p>
                            <p className="text-xs text-slate-500">At Risk</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{criticalCt}</p>
                            <p className="text-xs text-slate-500">Critical</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Cards */}
            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-slate-200 rounded w-2/3 mb-4" />
                            <div className="h-2 bg-slate-200 rounded w-full" />
                        </div>
                    ))
                ) : projects.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
                        <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-1">No Projects Yet</h3>
                        <p className="text-sm text-slate-400 mb-4">Create your first project to get started.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Project
                        </button>
                    </div>
                ) : (
                    projects.map(project => {
                        const health = healthData[project.projectId];
                        const progress = project.taskCount > 0
                            ? Math.round((project.completedTaskCount / project.taskCount) * 100)
                            : 0;

                        const progressColor = progress >= 100 ? 'bg-emerald-500'
                            : progress >= 50 ? 'bg-blue-500'
                                : progress >= 25 ? 'bg-amber-500'
                                    : 'bg-rose-500';

                        return (
                            <div key={project.projectId} onClick={() => navigate(`/manager/projects/${project.projectId}`)} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                                                {getStatusLabel(project.status)}
                                            </span>
                                            {health && getHealthBadge(health.health)}
                                        </div>
                                        {project.description && (
                                            <p className="text-sm text-slate-500 line-clamp-1">{project.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        {project.leadName && (
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                                                Lead: {project.leadName}
                                            </span>
                                        )}
                                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1">
                                            <Users2 className="w-3 h-3" />
                                            {project.memberCount} members
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 min-w-[40px] text-right">{progress}%</span>
                                </div>

                                {health && (
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-slate-700">{health.totalSubTasks}</p>
                                            <p className="text-xs text-slate-400">Total</p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-emerald-600">{health.completedSubTasks}</p>
                                            <p className="text-xs text-slate-400">Done</p>
                                        </div>
                                        <div className={`rounded-lg p-2.5 text-center ${health.overdueSubTasks > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                                            <p className={`text-lg font-bold ${health.overdueSubTasks > 0 ? 'text-red-600' : 'text-slate-400'}`}>{health.overdueSubTasks}</p>
                                            <p className="text-xs text-slate-400">Overdue</p>
                                        </div>
                                        <div className={`rounded-lg p-2.5 text-center ${health.criticalSubTasks > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}>
                                            <p className={`text-lg font-bold ${health.criticalSubTasks > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{health.criticalSubTasks}</p>
                                            <p className="text-xs text-slate-400">Critical</p>
                                        </div>
                                        <div className={`rounded-lg p-2.5 text-center ${health.pausedSubTasks > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                            <p className={`text-lg font-bold ${health.pausedSubTasks > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{health.pausedSubTasks}</p>
                                            <p className="text-xs text-slate-400">Paused</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FolderKanban className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Create New Project</h2>
                                    <p className="text-xs text-slate-500">Set up a new project for your team</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name *</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                    placeholder="e.g. CRM System Redesign"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm resize-none"
                                    placeholder="Describe the project goals and scope..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Team *</label>
                                <select
                                    value={form.teamId}
                                    onChange={(e) => handleTeamChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm bg-white"
                                >
                                    <option value="">Select a team</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.teamName} ({t.memberCount} members)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {form.teamId && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Project Members *
                                        {selectedMembers.length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                                {selectedMembers.length} of {teamMembers.length} selected
                                            </span>
                                        )}
                                    </label>
                                    <p className="text-xs text-slate-400 mb-2">Select the team members who will work on this project</p>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={employeeSearch}
                                            onChange={(e) => setEmployeeSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Search team members..."
                                        />
                                    </div>
                                    {loadingMembers ? (
                                        <div className="p-4 text-center text-sm text-slate-400 animate-pulse">Loading team members...</div>
                                    ) : (
                                        <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                                            {filteredTeamMembers.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-slate-400">No team members found</div>
                                            ) : (
                                                filteredTeamMembers.map(emp => (
                                                    <label
                                                        key={emp.userId}
                                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors ${
                                                            selectedMembers.includes(emp.userId) ? 'bg-indigo-50' : ''
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMembers.includes(emp.userId)}
                                                            onChange={() => toggleMember(emp.userId)}
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-700 truncate">{emp.name}</p>
                                                            <p className="text-xs text-slate-400">{emp.role || 'Employee'} · {emp.email}</p>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedMembers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Team Lead *</label>
                                    <p className="text-xs text-slate-400 mb-1.5">Must be a selected member with TeamLead role</p>
                                    {leadCandidates.length === 0 ? (
                                        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                            No Team Lead available in selected members. Please add a member with TeamLead role.
                                        </div>
                                    ) : (
                                        <select
                                            value={form.leadId}
                                            onChange={(e) => setForm(p => ({ ...p, leadId: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm bg-white"
                                        >
                                            <option value="">Select a Team Lead</option>
                                            {leadCandidates.map(m => (
                                                <option key={m.userId} value={m.userId}>
                                                    {m.name} ({m.email})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={creating || !form.name.trim() || !form.teamId || selectedMembers.length === 0 || !form.leadId}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Create Project
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

export default ManagerProjectsPage;
