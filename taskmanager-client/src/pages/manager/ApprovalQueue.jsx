import { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Clock, Filter,
    Loader2, User, FileText, AlertTriangle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { workLogApi } from '../../api/workLogApi';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ApprovalQueue = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'Manager', userId: 1 };

    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingItems, setPendingItems] = useState([]);
    const [processedItems, setProcessedItems] = useState([]);

    const fetchApprovals = async () => {
        try {
            setIsLoading(true);
            // Fetch work logs for manager's team
            const res = await workLogApi.getByTeam(user.userId || user.id);
            const logs = res.data?.items || res.data || [];

            // Simulate approval status - in real app, this would come from API
            const pending = logs.filter(l => !l.isApproved).slice(0, 10);
            const processed = logs.filter(l => l.isApproved).slice(0, 10);

            setPendingItems(pending.map(l => ({
                id: l.workLogId || l.id,
                type: 'timeLog',
                title: `Time Log - ${l.totalHours || 0}h`,
                description: l.description || 'No description',
                submittedBy: l.userName || 'Team Member',
                submittedAt: l.logDate || l.createdDate,
                hours: l.totalHours || 0,
                taskName: l.taskTitle || 'Task',
                status: 'pending',
            })));

            setProcessedItems(processed.map(l => ({
                id: l.workLogId || l.id,
                type: 'timeLog',
                title: `Time Log - ${l.totalHours || 0}h`,
                description: l.description || 'No description',
                submittedBy: l.userName || 'Team Member',
                submittedAt: l.logDate || l.createdDate,
                hours: l.totalHours || 0,
                taskName: l.taskTitle || 'Task',
                status: 'approved',
            })));
        } catch (error) {
            console.error('Failed to fetch approvals:', error);
            toast.error('Failed to load approval queue');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleApprove = async (item) => {
        try {
            // In real app, this would call an approval API
            toast.success(`Approved: ${item.title}`);
            setPendingItems(prev => prev.filter(i => i.id !== item.id));
            setProcessedItems(prev => [{ ...item, status: 'approved' }, ...prev]);
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (item) => {
        try {
            toast.success(`Rejected: ${item.title}`);
            setPendingItems(prev => prev.filter(i => i.id !== item.id));
            setProcessedItems(prev => [{ ...item, status: 'rejected' }, ...prev]);
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const handleBulkApprove = () => {
        pendingItems.forEach(item => handleApprove(item));
        toast.success('All pending items approved!');
    };

    const currentItems = activeTab === 'pending' ? pendingItems : processedItems;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Approval Queue
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Review and approve team submissions</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-2xl font-bold">{pendingItems.length}</p>
                            <p className="text-white/70 text-xs">Pending</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-2xl font-bold">{processedItems.length}</p>
                            <p className="text-white/70 text-xs">Processed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Bulk Actions */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {[
                        { key: 'pending', label: 'Pending', count: pendingItems.length },
                        { key: 'processed', label: 'Processed', count: processedItems.length },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${activeTab === tab.key
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {activeTab === 'pending' && pendingItems.length > 0 && (
                    <Button
                        variant="success"
                        icon={CheckCircle}
                        onClick={handleBulkApprove}
                    >
                        Approve All
                    </Button>
                )}
            </div>

            {/* Approval Items */}
            <Card>
                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : currentItems.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>{activeTab === 'pending' ? 'No pending approvals' : 'No processed items'}</p>
                        </div>
                    ) : (
                        currentItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Type Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'timeLog'
                                            ? 'bg-amber-100 text-amber-600'
                                            : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {item.type === 'timeLog' ? (
                                            <Clock className="w-5 h-5" />
                                        ) : (
                                            <FileText className="w-5 h-5" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-800">{item.title}</p>
                                            {item.status === 'approved' && (
                                                <Badge variant="success" size="sm">Approved</Badge>
                                            )}
                                            {item.status === 'rejected' && (
                                                <Badge variant="danger" size="sm">Rejected</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {item.submittedBy}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                                            {item.taskName && (
                                                <>
                                                    <span>•</span>
                                                    <span>{item.taskName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    {item.hours && (
                                        <div className="px-3 py-1 bg-slate-100 rounded-lg">
                                            <span className="text-sm font-semibold text-slate-700">{item.hours}h</span>
                                        </div>
                                    )}

                                    {activeTab === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(item)}
                                                className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(item)}
                                                className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                                title="Reject"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ApprovalQueue;
