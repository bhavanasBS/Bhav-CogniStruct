import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Settings, Search, X, Loader2, UserMinus } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import TeamMemberList from '../../components/teams/TeamMemberList';

import { PageLoader } from '../../components/common/LoadingSpinner';
import { teamApi } from '../../api/teamApi';
import toast from 'react-hot-toast';

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  // Add member modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [removingUserId, setRemovingUserId] = useState(null);

  const fetchTeam = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await teamApi.getById(id);
      const data = res.data;
      setTeam(data);
      // The getById endpoint returns members inside the team object
      if (data.members) {
        setMembers(data.members.map(m => ({
          userId: m.userId,
          firstName: m.name?.split(' ')[0] || '',
          lastName: m.name?.split(' ').slice(1).join(' ') || '',
          fullName: m.name,
          email: m.email,
          role: m.role,
          joinedDate: m.joinedDate,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch team:', error);
      toast.error('Failed to load team details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  // Fetch available users when modal opens or search changes
  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await teamApi.getAvailableUsers(id, searchQuery || undefined);
      setAvailableUsers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch available users:', error);
      toast.error('Failed to load available users');
    } finally {
      setLoadingUsers(false);
    }
  }, [id, searchQuery]);

  useEffect(() => {
    if (showAddModal) {
      const timer = setTimeout(() => fetchAvailableUsers(), 300);
      return () => clearTimeout(timer);
    }
  }, [showAddModal, fetchAvailableUsers]);

  const handleAddMember = async (userId) => {
    try {
      setAddingUserId(userId);
      await teamApi.addMember(id, userId);
      toast.success('Member added successfully!');
      setAvailableUsers(prev => prev.filter(u => u.userId !== userId));
      await fetchTeam();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add member';
      toast.error(msg);
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.firstName || member.fullName} ${member.lastName || ''} from this team?`)) return;
    try {
      setRemovingUserId(member.userId);
      await teamApi.removeMember(id, member.userId);
      toast.success('Member removed');
      await fetchTeam();
    } catch (error) {
      toast.error('Failed to remove member');
    } finally {
      setRemovingUserId(null);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!team) return <div className="text-center py-20 text-slate-400">Team not found</div>;

  const tabs = [
    { key: 'members', label: 'Members' },
    { key: 'tasks', label: 'Tasks' },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{team.teamName}</h1>
            <Badge variant={team.isActive ? 'success' : 'danger'} dot>
              {team.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">{team.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={UserPlus}
            size="sm"
            onClick={() => { setShowAddModal(true); setSearchQuery(''); }}
          >
            Add Member
          </Button>
          <Button variant="ghost" icon={Settings} size="sm">Settings</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Team Members</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{members.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Manager</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{team.managerName || 'Not assigned'}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active Tasks</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{team.activeTaskCount ?? 0}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && (
        <Card padding={false}>
          <TeamMemberList
            members={members}
            onRemove={handleRemoveMember}
            removingUserId={removingUserId}
          />
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card>
          <p className="text-sm text-slate-400 text-center py-8">Team tasks will appear here</p>
        </Card>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Add Member</h2>
                  <p className="text-xs text-slate-400">Select employees to add to {team.teamName}</p>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employees by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* User List */}
            <div className="max-h-80 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No available users found</p>
                  <p className="text-xs mt-1">All users may already be in this team</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {availableUsers.map((user) => (
                    <div key={user.userId} className="flex items-center gap-3 px-6 py-3 hover:bg-blue-50/50 transition-colors">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      {/* Role */}
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {user.role}
                      </span>

                      {/* Add button */}
                      <button
                        onClick={() => handleAddMember(user.userId)}
                        disabled={addingUserId === user.userId}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
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

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-400">{availableUsers.length} user(s) available</span>
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
