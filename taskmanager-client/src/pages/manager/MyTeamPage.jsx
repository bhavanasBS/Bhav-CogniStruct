import { useState, useEffect } from 'react';
import {
    Users, Sparkles, ClipboardList, CheckCircle, Plus,
    Mail, UserCheck, Loader2, Search, ArrowUpRight,
    FolderPlus, UserPlus, X, Trash2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { teamApi } from '../../api/teamApi';
import { userApi } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyTeamPage = () => {
    const navigate = useNavigate();

    // Teams state
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);

    // Employees (subordinates) state
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [empSearch, setEmpSearch] = useState('');

    // Create team modal
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    const [creating, setCreating] = useState(false);

    // Add to team modal
    const [addToTeamUser, setAddToTeamUser] = useState(null);
    const [addingTeamId, setAddingTeamId] = useState(null);

    // Expanded team (show members)
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [teamMembers, setTeamMembers] = useState({});
    const [loadingMembers, setLoadingMembers] = useState(null);
    const [removingMemberId, setRemovingMemberId] = useState(null);

    // Confirm remove modal
    const [confirmRemove, setConfirmRemove] = useState(null);

    const fetchTeams = async () => {
        try {
            setLoadingTeams(true);
            const res = await teamApi.getAll();
            const allTeams = res.data.items || res.data || [];
            setTeams(allTeams);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoadingTeams(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoadingEmployees(true);
            const res = await userApi.getMyEmployees();
            setEmployees(res.data || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoadingEmployees(false);
        }
    };

    const fetchTeamMembers = async (teamId) => {
        try {
            setLoadingMembers(teamId);
            const res = await teamApi.getMembers(teamId);
            setTeamMembers(prev => ({ ...prev, [teamId]: res.data || [] }));
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        } finally {
            setLoadingMembers(null);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchEmployees();
    }, []);

    // Create team
    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return toast.error('Team name is required');
        try {
            setCreating(true);
            await teamApi.create({ teamName: newTeamName, description: newTeamDesc });
            toast.success('Team created successfully!');
            setShowCreateTeam(false);
            setNewTeamName('');
            setNewTeamDesc('');
            fetchTeams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create team');
        } finally {
            setCreating(false);
        }
    };

    // Add employee to team
    const handleAddToTeam = async (teamId) => {
        if (!addToTeamUser) return;
        const userId = addToTeamUser.id || addToTeamUser.userId;
        try {
            setAddingTeamId(teamId);
            await teamApi.addMember(teamId, userId);
            toast.success(`${addToTeamUser.firstName} added to team!`);
            setAddToTeamUser(null);
            fetchTeams();
            // Refresh members if expanded
            if (teamMembers[teamId]) fetchTeamMembers(teamId);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to team');
        } finally {
            setAddingTeamId(null);
        }
    };

    // Open confirm dialog before removing
    const askRemoveMember = (teamId, userId, memberName) => {
        setConfirmRemove({ teamId, userId, memberName });
    };

    // Actually remove member after confirmation
    const handleConfirmRemove = async () => {
        if (!confirmRemove) return;
        const { teamId, userId, memberName } = confirmRemove;
        setConfirmRemove(null);
        try {
            setRemovingMemberId(userId);
            await teamApi.removeMember(teamId, userId);
            toast.success(`${memberName} removed from team`);
            fetchTeamMembers(teamId);
            fetchTeams();
        } catch (error) {
            toast.error('Failed to remove member');
        } finally {
            setRemovingMemberId(null);
        }
    };

    // Toggle expanded team
    const toggleTeam = (teamId) => {
        if (expandedTeamId === teamId) {
            setExpandedTeamId(null);
        } else {
            setExpandedTeamId(teamId);
            if (!teamMembers[teamId]) fetchTeamMembers(teamId);
        }
    };

    const filteredEmployees = employees.filter(e =>
        (e.firstName + ' ' + e.lastName).toLowerCase().includes(empSearch.toLowerCase()) ||
        e.email?.toLowerCase().includes(empSearch.toLowerCase())
    );

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
                                My Team <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Manage your teams and assigned employees</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-3xl font-bold">{teams.length}</p>
                            <p className="text-white/70 text-sm">Teams</p>
                        </div>
                        <div className="w-px h-12 bg-white/20" />
                        <div className="text-right">
                            <p className="text-3xl font-bold">{employees.length}</p>
                            <p className="text-white/70 text-sm">Employees</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── MY TEAMS SECTION ─── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-teal-600" />
                        My Teams
                    </h2>
                    <button
                        onClick={() => setShowCreateTeam(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm cursor-pointer"
                    >
                        <FolderPlus className="w-4 h-4" /> Create Team
                    </button>
                </div>

                {loadingTeams ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                ) : teams.length === 0 ? (
                    <Card>
                        <div className="text-center py-12 text-slate-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No teams yet</p>
                            <p className="text-sm mt-1">Create your first team to start organizing</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team) => {
                            const tid = team.id || team.teamId;
                            const isExpanded = expandedTeamId === tid;
                            const members = teamMembers[tid] || [];
                            return (
                                <div key={tid} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isExpanded ? 'border-teal-300 ring-1 ring-teal-100 col-span-full' : 'border-slate-200 hover:border-teal-200'}`}>
                                    {/* Team card header */}
                                    <div
                                        onClick={() => toggleTeam(tid)}
                                        className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {(team.teamName || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 truncate">{team.teamName}</p>
                                                <p className="text-xs text-slate-400 truncate">{team.description || 'No description'}</p>
                                            </div>
                                            <Badge variant="info">{team.memberCount ?? '?'} members</Badge>
                                        </div>
                                    </div>

                                    {/* Expanded members */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100">
                                            {loadingMembers === tid ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                                                </div>
                                            ) : members.length === 0 ? (
                                                <div className="text-center py-8 text-slate-400">
                                                    <p className="text-sm">No members in this team</p>
                                                    <p className="text-xs mt-1">Add employees from the section below</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-50">
                                                    {members.map((m) => (
                                                        <div key={m.userId} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                                                {m.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-700">{m.name}</p>
                                                                <p className="text-xs text-slate-400">{m.email}</p>
                                                            </div>
                                                            <Badge variant="secondary" size="sm">{m.role}</Badge>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); askRemoveMember(tid, m.userId, m.name); }}
                                                                disabled={removingMemberId === m.userId}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
                                                                title="Remove from team"
                                                            >
                                                                {removingMemberId === m.userId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                            </button>
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

            {/* ─── MY EMPLOYEES SECTION ─── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                        My Employees
                    </h2>
                    <Badge variant="info">{employees.length} assigned</Badge>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
                    <SearchBar placeholder="Search employees..." onSearch={setEmpSearch} className="max-w-md" />
                </div>

                <Card>
                    <div className="divide-y divide-slate-100">
                        {loadingEmployees ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No employees found</p>
                                <p className="text-sm mt-1">Admin needs to assign employees to you first</p>
                            </div>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <div
                                    key={emp.id || emp.userId}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                            {(emp.firstName?.[0] || '') + (emp.lastName?.[0] || '')}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{emp.firstName} {emp.lastName}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {emp.email}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <Badge variant="secondary" size="sm">{(emp.roles || [])[0] || 'Employee'}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setAddToTeamUser(emp)}
                                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-all cursor-pointer"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> Add to Team
                                        </button>
                                        <button
                                            onClick={() => navigate(`/tasks?assignee=${emp.id || emp.userId}`)}
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

            {/* ─── CREATE TEAM MODAL ─── */}
            {showCreateTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateTeam(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                                    <FolderPlus className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Create Team</h2>
                            </div>
                            <button onClick={() => setShowCreateTeam(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Team Name *</label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="e.g. CRM Development"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label>
                                <textarea
                                    value={newTeamDesc}
                                    onChange={(e) => setNewTeamDesc(e.target.value)}
                                    placeholder="Brief description of the team's purpose"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setShowCreateTeam(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer">Cancel</button>
                            <button
                                onClick={handleCreateTeam}
                                disabled={creating || !newTeamName.trim()}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-lg disabled:opacity-50 cursor-pointer"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Create Team
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ADD TO TEAM MODAL ─── */}
            {addToTeamUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddToTeamUser(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Add to Team</h2>
                                    <p className="text-xs text-slate-400">
                                        Add <span className="font-semibold text-slate-600">{addToTeamUser.firstName} {addToTeamUser.lastName}</span> to a team
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setAddToTeamUser(null)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {teams.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No teams created yet</p>
                                    <p className="text-xs mt-1">Create a team first</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {teams.map((team) => {
                                        const tid = team.id || team.teamId;
                                        return (
                                            <div key={tid} className="flex items-center gap-3 px-6 py-3 hover:bg-indigo-50/50 transition-colors">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {(team.teamName || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800">{team.teamName}</p>
                                                    <p className="text-xs text-slate-400">{team.memberCount ?? 0} members</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAddToTeam(tid)}
                                                    disabled={addingTeamId === tid}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
                                                >
                                                    {addingTeamId === tid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                                                    Add
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button onClick={() => setAddToTeamUser(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── CONFIRM REMOVE MODAL ─── */}
            {confirmRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmRemove(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200">
                                <Trash2 className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Remove Member</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to remove{' '}
                                <span className="font-semibold text-slate-700">{confirmRemove.memberName}</span>{' '}
                                from this team?
                            </p>
                            <p className="text-xs text-slate-400 mt-1">This action can be undone by re-adding them later.</p>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmRemove(null)}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRemove}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" /> Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTeamPage;
