import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Sparkles, CheckCircle, Clock, AlertTriangle, BarChart3, PauseCircle } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import toast from 'react-hot-toast';

const MyProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                const res = await taskApi.getAll();
                const all = res.data.items || res.data || [];
                // Filter only parent tasks (projects) assigned to current user
                const parentTasks = all.filter(t => t.isProject && t.parentTaskId == null);
                setProjects(parentTasks);
            } catch (err) {
                console.error('Failed to load projects:', err);
                toast.error('Failed to load projects');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const getProgressColor = (completed, total) => {
        if (total === 0) return 'bg-slate-300';
        const pct = (completed / total) * 100;
        if (pct >= 100) return 'bg-emerald-500';
        if (pct >= 50) return 'bg-blue-500';
        if (pct >= 25) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const getStatusBadge = (status) => {
        const map = {
            0: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
            1: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
            2: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700' },
            3: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
            4: { label: 'Paused', color: 'bg-orange-100 text-orange-700' },
        };
        const s = map[status] || map[0];
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>;
    };

    const getPriorityBadge = (priority) => {
        const map = {
            0: { label: 'Low', color: 'text-emerald-600' },
            1: { label: 'Medium', color: 'text-blue-600' },
            2: { label: 'High', color: 'text-amber-600' },
            3: { label: 'Critical', color: 'text-red-600' },
        };
        const p = map[priority] || map[1];
        return <span className={`text-xs font-semibold ${p.color}`}>{p.label}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <FolderKanban className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            My Projects
                            <Sparkles className="w-5 h-5 text-yellow-200" />
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Manage assigned projects and create subtasks for your team</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{projects.length}</p>
                            <p className="text-xs text-slate-500">Total Projects</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{projects.filter(p => p.status !== 3).length}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{projects.filter(p => p.status === 3).length}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects List */}
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
                        <h3 className="text-lg font-semibold text-slate-600 mb-1">No Projects Assigned</h3>
                        <p className="text-sm text-slate-400">Your manager hasn't assigned any projects yet.</p>
                    </div>
                ) : (
                    projects.map(project => {
                        const progress = project.subTaskCount > 0
                            ? Math.round((project.completedSubTaskCount / project.subTaskCount) * 100)
                            : 0;

                        return (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/teamlead/projects/${project.id}`)}
                                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {project.title}
                                            </h3>
                                            {getStatusBadge(project.status)}
                                            {getPriorityBadge(project.priority)}
                                            {project.status === 4 && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                                                    <PauseCircle className="w-3 h-3" /> Paused
                                                </span>
                                            )}
                                            {project.deadline && new Date(project.deadline) < new Date() && project.status !== 3 && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Overdue
                                                </span>
                                            )}
                                        </div>
                                        {project.description && (
                                            <p className="text-sm text-slate-500 line-clamp-1">{project.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        {project.teamName && (
                                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium">{project.teamName}</span>
                                        )}
                                        {project.deadline && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(project.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(project.completedSubTaskCount, project.subTaskCount)}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 min-w-[80px] justify-end">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                        {project.completedSubTaskCount}/{project.subTaskCount} tasks
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MyProjectsPage;
