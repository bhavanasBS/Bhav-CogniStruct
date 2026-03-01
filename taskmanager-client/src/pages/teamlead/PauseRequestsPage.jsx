import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Clock, User, AlertTriangle, Sparkles, Pause } from 'lucide-react';
import api from '../../api/axiosInstance';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

const PauseRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // {type: 'approve'|'reject', id, taskTitle}

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/pause-requests/pending');
            setRequests(res.data || []);
        } catch (err) {
            console.error('Failed to load pause requests:', err);
            toast.error('Failed to load requests');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            setProcessing(id);
            await api.patch(`/api/pause-requests/${id}/approve`);
            toast.success('Pause request approved — task paused');
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        } finally {
            setProcessing(null);
            setConfirmAction(null);
        }
    };

    const handleReject = async (id) => {
        try {
            setProcessing(id);
            await api.patch(`/api/pause-requests/${id}/reject`);
            toast.success('Pause request rejected');
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        } finally {
            setProcessing(null);
            setConfirmAction(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <ShieldAlert className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Pause Requests
                            <Sparkles className="w-5 h-5 text-yellow-200" />
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Review workload escalation requests for your team</p>
                    </div>
                    {requests.length > 0 && (
                        <div className="ml-auto bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <span className="text-2xl font-bold">{requests.length}</span>
                            <span className="text-sm text-white/80 ml-1">pending</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-slate-200 rounded w-2/3" />
                        </div>
                    ))
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-1">No Pending Requests</h3>
                        <p className="text-sm text-slate-400">All workload escalation requests have been handled.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <h4 className="font-semibold text-slate-800">{req.taskTitle}</h4>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                            Pending
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 ml-7">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            {req.employeeName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {req.reason && (
                                        <p className="text-sm text-slate-500 mt-2 ml-7 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                            {req.reason}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 ml-7 sm:ml-0">
                                    <Button
                                        onClick={() => setConfirmAction({ type: 'approve', id: req.id, taskTitle: req.taskTitle })}
                                        isLoading={processing === req.id}
                                        className="!bg-emerald-500 hover:!bg-emerald-600 !text-white !px-4 !py-2 !text-sm"
                                        icon={CheckCircle}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => setConfirmAction({ type: 'reject', id: req.id, taskTitle: req.taskTitle })}
                                        isLoading={processing === req.id}
                                        variant="secondary"
                                        className="!px-4 !py-2 !text-sm !border-red-200 !text-red-600 hover:!bg-red-50"
                                        icon={XCircle}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Approve Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmAction?.type === 'approve'}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleApprove(confirmAction?.id)}
                title="Approve Pause Request?"
                message={`The task "${confirmAction?.taskTitle}" will be paused immediately and the employee will be notified.`}
                confirmLabel="Approve & Pause"
                variant="warning"
                icon={Pause}
                isLoading={!!processing}
            />

            {/* Reject Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmAction?.type === 'reject'}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleReject(confirmAction?.id)}
                title="Reject Pause Request?"
                message={`The pause request for "${confirmAction?.taskTitle}" will be rejected. The task will remain active.`}
                confirmLabel="Reject Request"
                variant="danger"
                icon={XCircle}
                isLoading={!!processing}
            />
        </div>
    );
};

export default PauseRequestsPage;
