import { useState, useEffect } from 'react';
import {
    Users, Sparkles, ClipboardList, CheckCircle, Clock,
    Mail, UserCheck, Loader2, Search, ArrowUpRight
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { managerApi } from '../../api/managerApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyTeamPage = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchTeam = async () => {
        try {
            setIsLoading(true);
            const response = await managerApi.getMyTeam();
            setMembers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch team:', error);
            toast.error('Failed to load team members');
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const filtered = members.filter(m =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.team?.toLowerCase().includes(search.toLowerCase())
    );

    const totalTasks = members.reduce((acc, m) => acc + (m.tasksAssigned || 0), 0);
    const completedTasks = members.reduce((acc, m) => acc + (m.tasksCompleted || 0), 0);
    const activeMembers = members.filter(m => m.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                My Team
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Manage and monitor your team members</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-3xl font-bold">{members.length}</p>
                            <p className="text-white/70 text-sm">Members</p>
                        </div>
                        <div className="w-px h-12 bg-white/20" />
                        <div className="text-right">
                            <p className="text-3xl font-bold">{activeMembers}</p>
                            <p className="text-white/70 text-sm">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{members.length}</p>
                            <p className="text-xs text-slate-500">Total Members</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalTasks}</p>
                            <p className="text-xs text-slate-500">Tasks Assigned</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{completedTasks}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{activeMembers}</p>
                            <p className="text-xs text-slate-500">Active Now</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <SearchBar
                    placeholder="Search team members..."
                    onSearch={setSearch}
                    className="max-w-md"
                />
            </div>

            {/* Team Members List */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
                        <Badge variant="info">{filtered.length} members</Badge>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No team members found</p>
                        </div>
                    ) : (
                        filtered.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                        {member.name?.split(' ').map(n => n[0]).join('') || '??'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-800">{member.name}</p>
                                            {!member.isActive && (
                                                <Badge variant="danger" size="sm">Inactive</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {member.email}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <Badge variant="secondary" size="sm">{member.role}</Badge>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-xs text-slate-500">{member.team}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-800">{member.tasksAssigned || 0}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Assigned</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-emerald-600">{member.tasksCompleted || 0}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Completed</p>
                                    </div>
                                    <div className="w-16 text-center">
                                        {member.tasksAssigned > 0 && (
                                            <>
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${Math.round((member.tasksCompleted / member.tasksAssigned) * 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {Math.round((member.tasksCompleted / member.tasksAssigned) * 100)}%
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/tasks?assignee=${member.id}`)}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all cursor-pointer"
                                        title="View Tasks"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default MyTeamPage;
