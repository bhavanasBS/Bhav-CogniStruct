import { useState, useEffect } from 'react';
import { Plus, Users2, Users, CheckCircle, Building2, X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import TeamList from '../../components/teams/TeamList';
import TeamForm from '../../components/teams/TeamForm';
import Card from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';
import { teamApi } from '../../api/teamApi';
import toast from 'react-hot-toast';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [managers, setManagers] = useState([]);
  const navigate = useNavigate();

  // Delete confirmation state
  const [deleteTeam, setDeleteTeam] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch managers for the dropdown
  const fetchManagers = async () => {
    try {
      const response = await teamApi.managerSearch('');
      setManagers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    }
  };

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

  const handleCreateTeam = async (data) => {
    try {
      await teamApi.create(data);
      toast.success('Team created successfully');
      setShowForm(false);
      setEditingTeam(null);
      fetchTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team');
    }
  };

  const handleUpdateTeam = async (data) => {
    if (!editingTeam) return;
    const teamId = editingTeam.id || editingTeam.teamId;
    try {
      await teamApi.update(teamId, data);
      toast.success('Team updated successfully');
      setShowForm(false);
      setEditingTeam(null);
      fetchTeams();
    } catch (error) {
      console.error('Failed to update team:', error);
      toast.error('Failed to update team');
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    fetchManagers();
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTeam) return;
    const teamId = deleteTeam.id || deleteTeam.teamId;
    try {
      setIsDeleting(true);
      await teamApi.delete(teamId);
      toast.success(`"${deleteTeam.teamName}" has been deleted`);
      setDeleteTeam(null);
      fetchTeams();
    } catch (error) {
      console.error('Failed to delete team:', error);
      const msg = error.response?.data?.message || 'Failed to delete team';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeTeams = teams.filter(t => t.isActive !== false).length;
  const totalMembers = teams.reduce((acc, t) => acc + (t.memberCount || 0), 0);

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
              <Users2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Team Management
              </h1>
              <p className="text-white/80 text-sm mt-0.5">Organize and manage your teams effectively</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              icon={Plus}
              onClick={() => { setEditingTeam(null); fetchManagers(); setShowForm(true); }}
              className="!bg-white !text-emerald-600 hover:!bg-white/90"
            >
              New Team
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
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
            <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
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
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalMembers}</p>
              <p className="text-xs text-slate-500">Total Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Search teams..." onSearch={setSearch} className="flex-1 max-w-md" />
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
            <Users2 className="h-4 w-4" />
            {teams.length} teams
          </div>
        </div>
      </div>

      {/* Team List */}
      <Card className="overflow-hidden">
        <TeamList
          teams={teams}
          isLoading={isLoading}
          onSelect={(team) => navigate(`/teams/${team.id || team.teamId}`)}
          onEdit={handleEdit}
          onDelete={(team) => setDeleteTeam(team)}
        />
      </Card>

      {/* Create / Edit Team Form Modal */}
      <TeamForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTeam(null); }}
        onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}
        team={editingTeam}
        managers={managers}
      />

      {/* Delete Confirmation Modal */}
      {deleteTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTeam(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Delete Team</h2>
                  <p className="text-xs text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => !isDeleting && setDeleteTeam(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">
                    Are you sure you want to delete "{deleteTeam.teamName}"?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This will permanently remove the team, including all member associations. Tasks assigned to this team will not be deleted but will lose their team reference.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Team:</span>
                  <span className="font-semibold text-slate-800">{deleteTeam.teamName}</span>
                </div>
                {deleteTeam.managerName && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-slate-500">Manager:</span>
                    <span className="font-medium text-slate-700">{deleteTeam.managerName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="text-slate-500">Members:</span>
                  <span className="font-medium text-slate-700">{deleteTeam.memberCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => !isDeleting && setDeleteTeam(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
