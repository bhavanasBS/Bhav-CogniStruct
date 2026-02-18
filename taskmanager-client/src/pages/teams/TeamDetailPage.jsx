import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Settings, Network } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import TeamMemberList from '../../components/teams/TeamMemberList';
import HierarchyTree from '../../components/teams/HierarchyTree';
import { PageLoader } from '../../components/common/LoadingSpinner';

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    setTimeout(() => {
      setTeam({
        teamId: Number(id),
        teamName: 'Engineering',
        description: 'Core engineering and development team responsible for building and maintaining the product.',
        managerName: 'Sarah Johnson',
        memberCount: 8,
        isActive: true,
        createdDate: '2025-01-15',
      });
      setMembers([
        { userId: 4, firstName: 'Emily', lastName: 'Davis', email: 'emily.d@cognistruct.com', role: 'Employee', joinedDate: '2025-04-01' },
        { userId: 7, firstName: 'David', lastName: 'Martinez', email: 'david.m@cognistruct.com', role: 'Employee', joinedDate: '2025-05-20' },
        { userId: 3, firstName: 'James', lastName: 'Wilson', email: 'james.w@cognistruct.com', role: 'TeamLead', joinedDate: '2025-03-10' },
      ]);
      setIsLoading(false);
    }, 500);
  }, [id]);

  if (isLoading) return <PageLoader />;

  const tabs = [
    { key: 'members', label: 'Members' },
    { key: 'hierarchy', label: 'Hierarchy' },
    { key: 'tasks', label: 'Tasks' },
  ];

  const hierarchyData = {
    firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@cognistruct.com', role: 'Manager',
    teamName: 'Engineering',
    children: members.map((m) => ({ ...m, children: [] })),
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/teams')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
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
          <Button variant="secondary" icon={UserPlus} size="sm">Add Member</Button>
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
          <p className="text-2xl font-bold text-slate-900 mt-1">{team.managerName}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active Tasks</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
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
          <TeamMemberList members={members} onRemove={(m) => console.log('remove', m)} />
        </Card>
      )}
      {activeTab === 'hierarchy' && (
        <Card padding={false}>
          <HierarchyTree data={hierarchyData} />
        </Card>
      )}
      {activeTab === 'tasks' && (
        <Card>
          <p className="text-sm text-slate-400 text-center py-8">Team tasks will appear here</p>
        </Card>
      )}
    </div>
  );
};

export default TeamDetailPage;
