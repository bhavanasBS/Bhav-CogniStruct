import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, CheckCircle, Clock, AlertTriangle, BarChart3, PauseCircle, Shield, TrendingUp, Activity } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManagerProjectsPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [healthData, setHealthData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                const res = await taskApi.getAll();
                const all = res.data.items || res.data || [];
                // Filter only parent tasks (projects)
                const parentTasks = all.filter(t => t.isProject && t.parentTaskId == null);
                setProjects(parentTasks);

                // Fetch health for each project
                const healthMap = {};
                await Promise.all(
                    parentTasks.map(async (p) => {
                        try {
                            const healthRes = await api.get(`/api/workload/project-health/${p.id}`);
                            healthMap[p.id] = healthRes.data;
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
        fetchProjects();
    }, []);

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

    const getStatusLabel = (status) => ['Pending', 'Assigned', 'In Progress', 'Completed', 'Paused'][status] || 'Unknown';
    const getStatusColor = (status) => ['bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700'][status] || 'bg-slate-100 text-slate-500';

    const getPriorityLabel = (p) => ['Low', 'Medium', 'High', 'Critical'][p] || 'Medium';
    const getPriorityColor = (p) => ['text-emerald-600', 'text-blue-600', 'text-amber-600', 'text-red-600'][p] || 'text-blue-600';

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
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Project Overview
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Monitor all active projects across your teams</p>
                    </div>
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
                        <p className="text-sm text-slate-400">Create your first project from the Tasks page.</p>
                    </div>
                ) : (
                    projects.map(project => {
                        const health = healthData[project.id];
                        const progress = project.subTaskCount > 0
                            ? Math.round((project.completedSubTaskCount / project.subTaskCount) * 100)
                            : 0;

                        const progressColor = progress >= 100 ? 'bg-emerald-500'
                            : progress >= 50 ? 'bg-blue-500'
                                : progress >= 25 ? 'bg-amber-500'
                                    : 'bg-rose-500';

                        return (
                            <div key={project.id} onClick={() => navigate(`/manager/projects/${project.id}`)} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                                {/* Project Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h3 className="text-lg font-semibold text-slate-800">{project.title}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                                                {getStatusLabel(project.status)}
                                            </span>
                                            <span className={`text-xs font-semibold ${getPriorityColor(project.priority)}`}>
                                                {getPriorityLabel(project.priority)}
                                            </span>
                                            {project.status === 4 && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                                                    <PauseCircle className="w-3 h-3" /> Paused
                                                </span>
                                            )}
                                            {health && getHealthBadge(health.health)}
                                        </div>
                                        {project.description && (
                                            <p className="text-sm text-slate-500 line-clamp-1">{project.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        {project.assigneeName && (
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                                                Lead: {project.assigneeName}
                                            </span>
                                        )}
                                        {project.teamName && (
                                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium">{project.teamName}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 min-w-[40px] text-right">{progress}%</span>
                                </div>

                                {/* Health Metrics */}
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
        </div>
    );
};

export default ManagerProjectsPage;
