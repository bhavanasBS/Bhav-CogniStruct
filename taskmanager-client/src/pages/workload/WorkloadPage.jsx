import { useState, useEffect } from 'react';
import { Scale, Sparkles, Users, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import Card from '../../components/common/Card';
import { workloadApi } from '../../api/workloadApi';
import toast from 'react-hot-toast';

const WorkloadPage = () => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWorkload = async () => {
        try {
            setIsLoading(true);
            // Fetch workload for a team (using placeholder teamId - will need context)
            const response = await workloadApi.getByTeam('all');
            setMembers(response.data.items || response.data || []);
        } catch (error) {
            console.error('Failed to fetch workload:', error);
            toast.error('Failed to load workload data');
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkload();
    }, []);

    const getLoadColor = (percent) => {
        if (percent >= 90) return 'from-rose-500 to-rose-600';
        if (percent >= 70) return 'from-amber-500 to-amber-600';
        return 'from-emerald-500 to-emerald-600';
    };

    const getLoadBg = (percent) => {
        if (percent >= 90) return 'bg-rose-100';
        if (percent >= 70) return 'bg-amber-100';
        return 'bg-emerald-100';
    };

    const overloaded = members.filter(m => {
        const percent = ((m.currentHours || m.hours || 0) / (m.capacity || 40)) * 100;
        return percent >= 80;
    }).length;

    const balanced = members.length - overloaded;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Scale className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Workload Management
                            <Sparkles className="w-5 h-5 text-amber-300" />
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Monitor and balance team workloads</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{balanced}</p>
                            <p className="text-xs text-slate-500">Balanced</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{overloaded}</p>
                            <p className="text-xs text-slate-500">Overloaded</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workload Cards */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Team Workload</h3>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">No workload data available</div>
                    ) : (
                        members.map((member) => {
                            const hours = member.currentHours || member.hours || 0;
                            const capacity = member.capacity || 40;
                            const percent = Math.round((hours / capacity) * 100);
                            const name = member.employeeName || member.name || 'Unknown';
                            return (
                                <div key={member.userId || member.id} className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLoadColor(percent)} flex items-center justify-center text-white text-sm font-bold`}>
                                                {name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{name}</p>
                                                <p className="text-xs text-slate-500">{member.teamName || 'Team'} • {member.taskCount || 0} tasks</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLoadBg(percent)} ${percent >= 90 ? 'text-rose-700' : percent >= 70 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                            {percent}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${getLoadColor(percent)}`}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1 text-xs text-slate-400">
                                        <span>{hours}h logged</span>
                                        <span>{capacity}h capacity</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>
        </div>
    );
};

export default WorkloadPage;
