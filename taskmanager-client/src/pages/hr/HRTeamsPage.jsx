import { useState, useEffect } from 'react';
import {
    Users2, Sparkles, Users, CheckCircle, Building2, Search,
    Loader2, Mail, ChevronDown
} from 'lucide-react';
import { teamApi } from '../../api/teamApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const HRTeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchTeams = async () => {
        try {
            setIsLoading(true);
            const params = search ? { search } : {};
            const response = await teamApi.getAll(params);
            setTeams(response.data.items || response.data || []);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            toast.error('Failed to load teams');
            setTeams([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [search]);

    const activeTeams = teams.filter(t => t.isActive !== false).length;
    const totalMembers = teams.reduce((acc, t) => acc + (t.memberCount || 0), 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Users2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Team Directory
                            <Sparkles className="w-5 h-5 text-yellow-200" />
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">View organization teams and their members</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{teams.length}</p>
                            <p className="text-xs text-slate-500">Total Teams</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{activeTeams}</p>
                            <p className="text-xs text-slate-500">Active Teams</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalMembers}</p>
                            <p className="text-xs text-slate-500">Total Members</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
                        <Users2 className="h-4 w-4" />
                        {teams.length} teams
                    </div>
                </div>
            </div>

            {/* Team Cards */}
            {teams.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Users2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-400">No teams found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {teams.map((team) => (
                        <div
                            key={team.teamId || team.id}
                            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-pink-200 transition-all cursor-pointer"
                            onClick={() => navigate(`/teams/${team.teamId || team.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                                        {(team.teamName || team.name || 'T')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{team.teamName || team.name}</h3>
                                        <p className="text-xs text-slate-400">
                                            {team.managerName || 'No manager assigned'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${team.isActive !== false
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                    {team.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <p className="text-lg font-bold text-slate-800">{team.memberCount || 0}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Members</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <p className="text-lg font-bold text-slate-800">{team.taskCount || 0}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tasks</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HRTeamsPage;
