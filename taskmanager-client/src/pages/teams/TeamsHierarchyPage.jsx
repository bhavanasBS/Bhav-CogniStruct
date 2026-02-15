import { useState, useEffect } from 'react';
import { ArrowLeft, Network, Sparkles, Users, Building2, UserCheck, Mail, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { teamApi } from '../../api/teamApi';
import toast from 'react-hot-toast';

// Role colors
const roleColors = {
    Admin: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-400', shadow: 'shadow-purple-200' },
    Manager: { bg: 'from-blue-500 to-blue-600', border: 'border-blue-400', shadow: 'shadow-blue-200' },
    'HR Lead': { bg: 'from-rose-500 to-rose-600', border: 'border-rose-400', shadow: 'shadow-rose-200' },
    Developer: { bg: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400', shadow: 'shadow-emerald-200' },
    Designer: { bg: 'from-pink-500 to-pink-600', border: 'border-pink-400', shadow: 'shadow-pink-200' },
    'HR Specialist': { bg: 'from-amber-500 to-amber-600', border: 'border-amber-400', shadow: 'shadow-amber-200' },
    TeamLead: { bg: 'from-blue-500 to-blue-600', border: 'border-blue-400', shadow: 'shadow-blue-200' },
    Employee: { bg: 'from-slate-500 to-slate-600', border: 'border-slate-400', shadow: 'shadow-slate-200' },
};

// Person Card Component
const PersonCard = ({ person, isRoot = false }) => {
    const role = person.role || person.roles?.[0] || 'Employee';
    const colors = roleColors[role] || { bg: 'from-slate-500 to-slate-600', border: 'border-slate-400', shadow: 'shadow-slate-200' };
    const initials = `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`;

    return (
        <div className={`bg-white rounded-xl border-2 ${colors.border} ${colors.shadow} shadow-lg p-4 min-w-[200px] max-w-[220px] hover:scale-105 transition-all duration-200 cursor-pointer group`}>
            {/* Avatar */}
            <div className="flex justify-center mb-3">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white`}>
                    {initials}
                </div>
            </div>

            {/* Name */}
            <h3 className="text-center font-semibold text-slate-800 text-sm">
                {person.firstName} {person.lastName}
            </h3>

            {/* Role Badge */}
            <div className="flex justify-center mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colors.bg} text-white`}>
                    {role}
                </span>
            </div>

            {/* Team */}
            {person.teamName && (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-500">
                    <Briefcase className="w-3 h-3" />
                    <span>{person.teamName}</span>
                </div>
            )}

            {/* Email on hover */}
            {person.email && (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{person.email}</span>
                </div>
            )}
        </div>
    );
};

// Connector Lines Component
const VerticalLine = ({ height = 30 }) => (
    <div className="flex justify-center">
        <div className={`w-0.5 bg-gradient-to-b from-slate-300 to-slate-400`} style={{ height: `${height}px` }} />
    </div>
);

const HorizontalConnector = ({ childCount }) => {
    if (childCount <= 1) return null;
    return (
        <div className="flex justify-center">
            <div className="h-0.5 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-full"
                style={{ width: `${(childCount - 1) * 240}px` }} />
        </div>
    );
};

// Full Org Chart Component
const OrgChart = ({ data }) => {
    if (!data) return null;

    return (
        <div className="overflow-x-auto py-8 px-4">
            <div className="flex flex-col items-center min-w-max">
                {/* Level 1: CEO/Admin */}
                <div className="flex flex-col items-center">
                    <PersonCard person={data} isRoot />
                    {data.children && data.children.length > 0 && <VerticalLine height={40} />}
                </div>

                {/* Level 2: Managers */}
                {data.children && data.children.length > 0 && (
                    <>
                        <HorizontalConnector childCount={data.children.length} />
                        <div className="flex gap-16 justify-center">
                            {data.children.map((manager, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <VerticalLine height={20} />
                                    <PersonCard person={manager} />

                                    {/* Level 3: Employees under each manager */}
                                    {manager.children && manager.children.length > 0 && (
                                        <>
                                            <VerticalLine height={30} />
                                            <HorizontalConnector childCount={manager.children.length} />
                                            <div className="flex gap-6 justify-center">
                                                {manager.children.map((emp, empIdx) => (
                                                    <div key={empIdx} className="flex flex-col items-center">
                                                        <VerticalLine height={20} />
                                                        <PersonCard person={emp} />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const TeamsHierarchyPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [hierarchyData, setHierarchyData] = useState(null);

    const fetchHierarchy = async () => {
        try {
            setIsLoading(true);
            // Fetch hierarchy from API
            const response = await teamApi.getHierarchy('all');
            setHierarchyData(response.data);
        } catch (error) {
            console.error('Failed to fetch hierarchy:', error);
            toast.error('Failed to load organization hierarchy');
            setHierarchyData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHierarchy();
    }, []);

    // Calculate stats
    const countAll = (node) => {
        if (!node) return 0;
        let count = 1;
        (node.children || []).forEach(c => count += countAll(c));
        return count;
    };

    const totalMembers = hierarchyData ? countAll(hierarchyData) : 0;
    const departments = hierarchyData?.children?.length || 0;
    const managers = departments;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Organization Chart
                                <Sparkles className="w-5 h-5 text-amber-400" />
                            </h1>
                            <p className="text-white/70 text-sm mt-0.5">Classic corporate hierarchy view</p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        icon={ArrowLeft}
                        onClick={() => navigate('/teams')}
                        className="!bg-white !text-slate-700 hover:!bg-white/90"
                    >
                        Back to Teams
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalMembers}</p>
                            <p className="text-xs text-slate-500">Total Members</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{managers}</p>
                            <p className="text-xs text-slate-500">Team Leaders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{departments}</p>
                            <p className="text-xs text-slate-500">Departments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Org Chart */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                            <Network className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Corporate Hierarchy</h3>
                    </div>
                </div>
                <div className="bg-gradient-to-b from-slate-50 to-white min-h-[500px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <svg className="animate-spin h-8 w-8 text-slate-500 mb-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-sm text-slate-500">Loading organization chart...</p>
                        </div>
                    ) : hierarchyData ? (
                        <OrgChart data={hierarchyData} />
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No hierarchy data available</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TeamsHierarchyPage;
