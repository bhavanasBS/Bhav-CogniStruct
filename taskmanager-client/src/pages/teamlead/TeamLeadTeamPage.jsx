import { useState, useEffect } from 'react';
import {
    Users, Loader2, Search, ArrowUpRight,
    ClipboardList, Mail, X, Plus
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { teamApi } from '../../api/teamApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TeamLeadTeamPage = () => {
    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState({});
    const [loadingMembers, setLoadingMembers] = useState(null);
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');

    // Assign task modal
    const [assignTaskUser, setAssignTaskUser] = useState(null);
    const [assignTaskTeamId, setAssignTaskTeamId] = useState(null);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const res = await teamApi.getMyTeam();
            const data = res.data.items || res.data || [];
            setTeams(data);
            // Auto-expand first team
            if (data.length > 0) {
                const firstId = data[0].id || data[0].teamId;
                setExpandedTeamId(firstId);
                fetchTeamMembers(firstId);
            }
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async (teamId) => {
        try {
            setLoadingMembers(teamId);
            const res = await teamApi.getMembers(teamId);
            setTeamMembers(prev => ({ ...prev, [teamId]: res.data || [] }));
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setLoadingMembers(null);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const toggleTeam = (teamId) => {
        if (expandedTeamId === teamId) {
            setExpandedTeamId(null);
        } else {
            setExpandedTeamId(teamId);
            if (!teamMembers[teamId]) fetchTeamMembers(teamId);
        }
    };

    const totalMembers = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0);

    const getFilteredMembers = (teamId) => {
        const members = teamMembers[teamId] || [];
        if (!memberSearch) return members;
        return members.filter(m =>
            m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.email?.toLowerCase().includes(memberSearch.toLowerCase())
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white relative overflow-hidden">
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
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">View your team and assign tasks to members</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-3xl font-bold">{teams.length}</p>
                            <p className="text-white/70 text-sm">{teams.length === 1 ? 'Team' : 'Teams'}</p>
                        </div>
                        <div className="w-px h-12 bg-white/20" />
                        <div className="text-right">
                            <p className="text-3xl font-bold">{totalMembers}</p>
                            <p className="text-white/70 text-sm">Members</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            ) : teams.length === 0 ? (
                <Card>
                    <div className="text-center py-16 text-slate-400">
                        <Users className="w-14 h-14 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold text-slate-500">No team assigned</p>
                        <p className="text-sm mt-2">Your manager has not assigned you to a team yet.</p>
                        <p className="text-xs mt-1 text-slate-400">Contact your manager to get added to a team.</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {teams.map((team) => {
                        const tid = team.id || team.teamId;
                        const isExpanded = expandedTeamId === tid;
                        const members = getFilteredMembers(tid);

                        return (
                            <div key={tid} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isExpanded ? 'border-purple-300 ring-1 ring-purple-100' : 'border-slate-200 hover:border-purple-200'}`}>
                                {/* Team header */}
                                <div
                                    onClick={() => toggleTeam(tid)}
                                    className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                            {(team.teamName || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-semibold text-slate-800">{team.teamName}</p>
                                            <p className="text-sm text-slate-400">{team.description || 'No description'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {team.managerName && (
                                                <span className="text-xs text-slate-400">
                                                    Manager: <span className="text-slate-600 font-medium">{team.managerName}</span>
                                                </span>
                                            )}
                                            <Badge variant="info">{team.memberCount ?? '?'} members</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded members */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100">
                                        {/* Search */}
                                        <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100">
                                            <SearchBar placeholder="Search members..." onSearch={setMemberSearch} className="max-w-sm" />
                                        </div>

                                        {loadingMembers === tid ? (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                                            </div>
                                        ) : members.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400">
                                                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">No members found</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {members.map((m) => (
                                                    <div key={m.userId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors group">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                            {m.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-slate-800">{m.name}</p>
                                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {m.email}
                                                            </p>
                                                        </div>
                                                        <Badge variant={m.role === 'TeamLead' || m.role === 'Team Lead' ? 'warning' : m.role === 'Manager' ? 'info' : 'secondary'} size="sm">
                                                            {m.role}
                                                        </Badge>
                                                        {m.role !== 'Manager' && m.role !== 'TeamLead' && m.role !== 'Team Lead' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/tasks?assignee=${m.userId}`);
                                                                }}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                                            >
                                                                <ClipboardList className="w-3.5 h-3.5" /> View Tasks
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TeamLeadTeamPage;
