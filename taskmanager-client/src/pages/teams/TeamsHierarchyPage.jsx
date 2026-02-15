import { useState, useEffect } from 'react';
import {
    ArrowLeft, Network, Sparkles, Users, Building2, UserCheck,
    Crown, Shield, Briefcase, UsersRound, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { teamApi } from '../../api/teamApi';
import toast from 'react-hot-toast';

/* ─────────────── Role Config ─────────────── */
const roleConfig = {
    Admin: { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: Crown, shadow: 'shadow-amber-200/60' },
    Organization: { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: Crown, shadow: 'shadow-amber-200/60' },
    Manager: { gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: Shield, shadow: 'shadow-blue-200/60' },
    TeamLead: { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', icon: UsersRound, shadow: 'shadow-violet-200/60' },
    Team: { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', icon: Briefcase, shadow: 'shadow-emerald-200/60' },
    Employee: { gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600', icon: Users, shadow: 'shadow-slate-200/60' },
    HR: { gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', icon: Users, shadow: 'shadow-pink-200/60' },
};

const getConfig = (role) => roleConfig[role] || roleConfig.Employee;

/* ─────────────── Node Card ─────────────── */
const NodeCard = ({ node, isRoot = false, level = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    const cfg = getConfig(node.role);
    const Icon = cfg.icon;
    const hasChildren = node.children && node.children.length > 0;
    const initials = node.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

    const sizeClasses = isRoot
        ? 'min-w-[240px] max-w-[260px]'
        : level === 1
            ? 'min-w-[220px] max-w-[240px]'
            : 'min-w-[190px] max-w-[210px]';

    const avatarSize = isRoot ? 'w-20 h-20 text-2xl' : level === 1 ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm';

    return (
        <div className="flex flex-col items-center">
            {/* Card */}
            <div
                className={`${sizeClasses} ${cfg.bg} border-2 ${cfg.border} rounded-2xl p-4 ${cfg.shadow} shadow-lg
          hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer relative group`}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                {/* Role Icon Badge */}
                <div className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br ${cfg.gradient} rounded-xl 
          flex items-center justify-center shadow-lg ring-2 ring-white`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-3">
                    <div className={`${avatarSize} rounded-2xl bg-gradient-to-br ${cfg.gradient} 
            flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-white`}>
                        {initials}
                    </div>
                </div>

                {/* Name */}
                <h3 className="text-center font-bold text-slate-800 text-sm leading-tight">
                    {node.name}
                </h3>

                {/* Role Badge */}
                <div className="flex justify-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase 
            bg-gradient-to-r ${cfg.gradient} text-white shadow-sm`}>
                        {node.role}
                    </span>
                </div>

                {/* Expand/Collapse Indicator */}
                {hasChildren && (
                    <div className="flex justify-center mt-2">
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${cfg.text} opacity-60 group-hover:opacity-100 transition-opacity`}>
                            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            {node.children.length} {node.children.length === 1 ? 'report' : 'reports'}
                        </div>
                    </div>
                )}
            </div>

            {/* Connector + Children */}
            {hasChildren && expanded && (
                <>
                    {/* Vertical line down from card */}
                    <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-slate-400" />

                    {/* Horizontal bracket + children */}
                    {node.children.length === 1 ? (
                        <NodeCard node={node.children[0]} level={level + 1} />
                    ) : (
                        <div className="relative">
                            {/* Horizontal connector bar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-full"
                                style={{ width: `${Math.min((node.children.length - 1) * 250, 900)}px` }}
                            />

                            {/* Children row */}
                            <div className="flex gap-6 justify-center pt-0">
                                {node.children.map((child, idx) => (
                                    <div key={child.id || idx} className="flex flex-col items-center">
                                        {/* Vertical line from bracket to child */}
                                        <div className="w-0.5 h-6 bg-slate-400" />
                                        <NodeCard node={child} level={level + 1} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

/* ─────────────── Main Page ─────────────── */
const TeamsHierarchyPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [hierarchyData, setHierarchyData] = useState(null);

    const fetchHierarchy = async () => {
        try {
            setIsLoading(true);
            const response = await teamApi.getFullHierarchy();
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

    // Stats
    const countNodes = (node, role) => {
        if (!node) return 0;
        let count = node.role === role ? 1 : 0;
        (node.children || []).forEach(c => count += countNodes(c, role));
        return count;
    };
    const countAll = (node) => {
        if (!node) return 0;
        let count = 1;
        (node.children || []).forEach(c => count += countAll(c));
        return count;
    };

    const totalPeople = hierarchyData ? countAll(hierarchyData) : 0;
    const managerCount = hierarchyData ? countNodes(hierarchyData, 'Manager') : 0;
    const teamCount = hierarchyData ? countNodes(hierarchyData, 'Team') : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                            <Network className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Organization Chart
                                <Sparkles className="w-5 h-5 text-amber-400" />
                            </h1>
                            <p className="text-white/60 text-sm mt-0.5">Interactive corporate hierarchy view</p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        icon={ArrowLeft}
                        onClick={() => navigate('/teams')}
                        className="!bg-white/10 !text-white hover:!bg-white/20 backdrop-blur-sm !border-white/20"
                    >
                        Back to Teams
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalPeople}</p>
                            <p className="text-xs text-slate-500">Total Members</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{managerCount}</p>
                            <p className="text-xs text-slate-500">Managers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{teamCount}</p>
                            <p className="text-xs text-slate-500">Teams</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 px-1">
                {Object.entries(roleConfig)
                    .filter(([key]) => key !== 'Organization')
                    .map(([role, cfg]) => (
                        <div key={role} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${cfg.gradient}`} />
                            <span className="text-xs font-medium text-slate-500">{role}</span>
                        </div>
                    ))}
            </div>

            {/* Org Chart */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
                            <Network className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Corporate Hierarchy</h3>
                            <p className="text-xs text-slate-400">Click a node to expand/collapse</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-b from-white via-slate-50/50 to-white min-h-[500px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse mb-4">
                                <Network className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Building organization chart...</p>
                        </div>
                    ) : hierarchyData ? (
                        <div className="overflow-x-auto py-10 px-8">
                            <div className="flex justify-center min-w-max">
                                <NodeCard node={hierarchyData} isRoot />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400">
                            <Building2 className="w-14 h-14 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No hierarchy data available</p>
                            <p className="text-xs mt-1">Create teams and assign managers to build your org chart</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TeamsHierarchyPage;
