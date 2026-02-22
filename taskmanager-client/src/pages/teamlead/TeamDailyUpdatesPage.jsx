import { useState, useEffect } from 'react';
import {
    Users, CheckCircle, XCircle, Loader2, Flame,
    Calendar, Eye, Clock, Mail
} from 'lucide-react';
import Card from '../../components/common/Card';
import { dailyUpdateApi } from '../../api/dailyUpdateApi';
import toast from 'react-hot-toast';

const TeamDailyUpdatesPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [teamUpdates, setTeamUpdates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [acknowledging, setAcknowledging] = useState(null);

    const fetchTeamUpdates = async () => {
        try {
            setIsLoading(true);
            const res = await dailyUpdateApi.getTeamUpdates({ date: selectedDate });
            setTeamUpdates(res.data || []);
        } catch (error) {
            console.error('Failed to fetch team updates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTeamUpdates(); }, [selectedDate]);

    const handleAcknowledge = async (id) => {
        try {
            setAcknowledging(id);
            await dailyUpdateApi.acknowledgeUpdate(id);
            toast.success('Update acknowledged ✓');
            fetchTeamUpdates();
        } catch (error) {
            toast.error('Failed to acknowledge');
        } finally {
            setAcknowledging(null);
        }
    };

    const sentCount = teamUpdates.filter(u => u.isSentToday).length;
    const totalCount = teamUpdates.length;
    const pendingCount = totalCount - sentCount;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0078D4] via-[#106EBE] to-[#005A9E] rounded-2xl p-6 text-white relative overflow-hidden">
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
                            <h1 className="text-2xl font-bold">Team Daily Updates</h1>
                            <p className="text-white/80 text-sm mt-0.5">Track your team's daily email update status</p>
                        </div>
                    </div>

                    {/* Date Picker */}
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 text-sm outline-none cursor-pointer [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <div className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-blue-700">{totalCount}</p>
                            <p className="text-sm text-blue-500">Team Members</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                    <div className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-emerald-700">{sentCount}</p>
                            <p className="text-sm text-emerald-500">Updates Sent</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <div className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-amber-700">{pendingCount}</p>
                            <p className="text-sm text-amber-500">Pending</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Team Members Table */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0078D4] to-[#005A9E] rounded-lg flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Update Status</h3>
                    <span className="text-xs text-slate-400 ml-auto">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 text-[#0078D4] animate-spin" />
                    </div>
                ) : teamUpdates.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No team members found</p>
                        <p className="text-xs mt-1">You need to be assigned as a team manager to view team updates</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {teamUpdates.map((member) => (
                            <div key={member.userId} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${member.isSentToday
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                    }`}>
                                    {member.employeeName.split(' ').map(n => n[0]).join('')}
                                </div>

                                {/* Name and email */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">{member.employeeName}</p>
                                    <p className="text-xs text-slate-400 truncate">{member.employeeEmail}</p>
                                    {member.summary && (
                                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs italic">"{member.summary}"</p>
                                    )}
                                </div>

                                {/* Streak */}
                                {member.consecutiveDays > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-orange-500">
                                        <Flame className="w-3.5 h-3.5" />
                                        <span>{member.consecutiveDays}d</span>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="shrink-0">
                                    {member.isSentToday ? (
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                            <CheckCircle className="w-3.5 h-3.5" /> Sent
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                            <XCircle className="w-3.5 h-3.5" /> Pending
                                        </span>
                                    )}
                                </div>

                                {/* Acknowledge button */}
                                <div className="shrink-0 w-28 text-right">
                                    {member.isSentToday && member.dailyUpdateId && !member.isAcknowledged ? (
                                        <button
                                            onClick={() => handleAcknowledge(member.dailyUpdateId)}
                                            disabled={acknowledging === member.dailyUpdateId}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0078D4] bg-blue-50 hover:bg-blue-100 rounded-lg transition-all cursor-pointer"
                                        >
                                            {acknowledging === member.dailyUpdateId ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Eye className="w-3.5 h-3.5" />
                                            )}
                                            Acknowledge
                                        </button>
                                    ) : member.isAcknowledged ? (
                                        <span className="flex items-center gap-1 text-xs text-emerald-500">
                                            <Eye className="w-3.5 h-3.5" /> Ack'd
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TeamDailyUpdatesPage;
