import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, UserPlus, UserMinus, Search, Loader2, FolderKanban, X } from 'lucide-react';
import { teamApi } from '../../api/teamApi';
import toast from 'react-hot-toast';

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [removingUserId, setRemovingUserId] = useState(null);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const res = await teamApi.getById(id);
      setTeam(res.data);
    } catch (err) {
      console.error('Failed to fetch team:', err);
      toast.error('Failed to load team');
      navigate('/teams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, [id]);

  const openAddModal = async () => {
    setShowAddModal(true);
    setUserSearch('');
    fetchAvailableUsers('');
  };

  const fetchAvailableUsers = async (search) => {
    try {
      setLoadingUsers(true);
      const res = await teamApi.getAvailableUsers(id, search || undefined);
      setAvailableUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch available users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      const timer = setTimeout(() => fetchAvailableUsers(userSearch), 300);
      return () => clearTimeout(timer);
    }
  }, [userSearch, showAddModal]);

  const handleAddMember = async (userId) => {
    try {
      setAddingUserId(userId);
      await teamApi.addMember(id, userId);
      toast.success('Member added');
      fetchTeam();
      fetchAvailableUsers(userSearch);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member';
      toast.error(msg);
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      setRemovingUserId(userId);
      await teamApi.removeMember(id, userId);
      toast.success('Member removed');
      fetchTeam();
    } catch (err) {
      toast.error('Failed to remove member');
    } finally {
      setRemovingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!team) return null;

  const members = team.members || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>
        <div className="relative z-10">
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Teams
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold">
                {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{team.teamName}</h1>
                {team.managerName && <p className="text-white/80 text-sm mt-0.5">Led by {team.managerName}</p>}
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{members.length}</p>
              <p className="text-xs text-slate-500">Team Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{team.projectCount || 0}</p>
              <p className="text-xs text-slate-500">Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 bg-gradient-to-br ${team.isActive ? 'from-emerald-500 to-emerald-600' : 'from-slate-400 to-slate-500'} rounded-xl flex items-center justify-center`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{team.isActive ? 'Active' : 'Inactive'}</p>
              <p className="text-xs text-slate-500">Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {team.description && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
          <p className="text-sm text-slate-500">{team.description}</p>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Team Members ({members.length})</h3>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No members yet</p>
            <button
              onClick={openAddModal}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const isManager = team.managerId === member.userId;
              return (
                <div key={member.userId} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {member.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{member.name}</p>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {member.role}
                    </span>
                    {isManager && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Lead
                      </span>
                    )}
                  </div>
                  {!isManager && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={removingUserId === member.userId}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      title="Remove from team"
                    >
                      {removingUserId === member.userId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserMinus className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Add Member</h2>
                  <p className="text-xs text-slate-400">Search for users to add to the team</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  autoFocus
                />
              </div>
            </div>

            {/* User List */}
            <div className="max-h-80 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No available users found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {availableUsers.map((user) => (
                    <div key={user.userId} className="flex items-center gap-3 px-6 py-3 hover:bg-indigo-50/50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {user.role}
                      </span>
                      <button
                        onClick={() => handleAddMember(user.userId)}
                        disabled={addingUserId === user.userId}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {addingUserId === user.userId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5" />
                        )}
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage;
