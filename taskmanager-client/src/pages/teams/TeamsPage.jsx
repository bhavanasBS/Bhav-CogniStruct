import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Trash2, Edit2, X, Loader2, FolderKanban, UserCheck } from 'lucide-react';
import { teamApi } from '../../api/teamApi';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const TeamsPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ teamName: '', description: '', managerId: '' });
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const res = await teamApi.getAll(search || undefined);
      setTeams(res.data || []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await userApi.getAll({ role: 'Manager' });
      const data = res.data?.items || res.data || [];
      setManagers(data);
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    }
  };

  useEffect(() => { fetchTeams(); }, [search]);

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormData({ teamName: '', description: '', managerId: '' });
    fetchManagers();
    setShowCreateModal(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setFormData({
      teamName: team.teamName,
      description: team.description || '',
      managerId: team.managerId || '',
    });
    fetchManagers();
    setShowCreateModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        teamName: formData.teamName.trim(),
        description: formData.description.trim() || null,
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
      };
      if (editingTeam) {
        await teamApi.update(editingTeam.id, payload);
        toast.success('Team updated successfully');
      } else {
        await teamApi.create(payload);
        toast.success('Team created successfully');
      }
      setShowCreateModal(false);
      fetchTeams();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save team';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`Delete team "${team.teamName}"? This cannot be undone.`)) return;
    try {
      setDeleting(team.id);
      await teamApi.delete(team.id);
      toast.success('Team deleted');
      fetchTeams();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete team';
      toast.error(msg);
    } finally {
      setDeleting(null);
    }
  };

  // Stats
  const totalMembers = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0);
  const activeTeams = teams.filter(t => t.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
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
              <h1 className="text-2xl font-bold">Team Management</h1>
              <p className="text-white/80 text-sm mt-0.5">Create and manage teams, assign members and projects</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{teams.length}</p>
              <p className="text-xs text-slate-500">Total Teams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalMembers}</p>
              <p className="text-xs text-slate-500">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{activeTeams}</p>
              <p className="text-xs text-slate-500">Active Teams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* Team Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-lg font-medium">No teams found</p>
          <p className="text-slate-400 text-sm mt-1">Create your first team to get started</p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {team.teamName}
                      </h3>
                      {team.managerName && (
                        <p className="text-xs text-slate-400 mt-0.5">Led by {team.managerName}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${team.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {team.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {team.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{team.description}</p>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{team.memberCount || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>{team.projectCount || 0} projects</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center border-t border-slate-100 divide-x divide-slate-100">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(team); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(team); }}
                  disabled={deleting === team.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting === team.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingTeam ? 'Edit Team' : 'Create Team'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingTeam ? 'Update team details' : 'Add a new team to the organization'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Team Name *</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="Enter team name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the team"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Manager / Team Lead</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer"
                >
                  <option value="">Select a manager</option>
                  {managers.map((m) => (
                    <option key={m.id || m.userId} value={m.id || m.userId}>
                      {m.firstName ? `${m.firstName} ${m.lastName}` : m.name} — {m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
