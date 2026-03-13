import { useState, useEffect } from 'react';
import { Users, RefreshCw, X, AlertTriangle } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ReassignModal = ({ isOpen, onClose, taskId, currentAssigneeName, onReassigned }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true);
      setSelectedUserId('');
      setReason('');
      api.get(`/api/tasks/${taskId}/eligible-assignees`)
        .then(res => setMembers(res.data))
        .catch(() => toast.error('Failed to load team members'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, taskId]);

  const handleReassign = async () => {
    if (!selectedUserId) {
      toast.error('Please select a new assignee');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.patch(`/api/tasks/${taskId}/reassign`, {
        newAssigneeId: parseInt(selectedUserId),
        reason: reason || undefined,
      });
      toast.success(res.data.message || 'Task reassigned successfully');
      onReassigned?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Reassign Task</h2>
              <p className="text-indigo-100 text-xs">Transfer to another team member</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Current Assignee */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Assignee</label>
            <div className="mt-1.5 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {currentAssigneeName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800">{currentAssigneeName || 'Unassigned'}</p>
            </div>
          </div>

          {/* New Assignee Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              New Assignee <span className="text-red-400">*</span>
            </label>
            {loading ? (
              <div className="mt-1.5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-sm text-slate-400 animate-pulse">
                Loading team members…
              </div>
            ) : members.length === 0 ? (
              <div className="mt-1.5 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-700">No eligible team members found</span>
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="mt-1.5 w-full bg-white rounded-xl px-4 py-3 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer"
              >
                <option value="">Select team member…</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reason <span className="text-slate-300">(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Employee overloaded / left / unavailable"
              className="mt-1.5 w-full bg-white rounded-xl px-4 py-3 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleReassign}
            disabled={!selectedUserId || submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reassigning…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Reassign Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignModal;
