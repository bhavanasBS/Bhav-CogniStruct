import { useState, useEffect } from 'react';
import { Plus, Users2, Sparkles, Users, CheckCircle, Building2 } from 'lucide-react';
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

  const handleCreateTeam = async (data) => {
    try {
      await teamApi.create(data);
      toast.success('Team created successfully');
      setShowForm(false);
      fetchTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team');
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

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Users2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Team Management
                <Sparkles className="w-5 h-5 text-amber-300" />
              </h1>
              <p className="text-white/80 text-sm mt-0.5">Organize and manage your teams effectively</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/teams/hierarchy')}
              className="!bg-white/20 !text-white hover:!bg-white/30 backdrop-blur-sm"
            >
              View Hierarchy
            </Button>
            <Button
              icon={Plus}
              onClick={() => setShowForm(true)}
              className="!bg-white !text-emerald-600 hover:!bg-white/90"
            >
              New Team
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
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
        <TeamList teams={teams} isLoading={isLoading} onSelect={(team) => navigate(`/teams/${team.teamId}`)} />
      </Card>

      <TeamForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateTeam}
      />
    </div>
  );
};

export default TeamsPage;
