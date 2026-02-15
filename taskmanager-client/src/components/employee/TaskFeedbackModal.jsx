import { useState } from 'react';
import { X, Star, Clock, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { BLOCKER_CATEGORIES } from '../../config/mockEmployeeFeatures';

/**
 * Task Feedback Modal - Shown when employee completes a task
 * Collects: difficulty rating, time estimation vs actual, blockers, feedback
 */
const TaskFeedbackModal = ({ isOpen, onClose, task, onSubmit }) => {
    const [feedback, setFeedback] = useState({
        difficultyRating: 3,
        estimatedHours: task?.estimatedHours || 0,
        actualHours: 0,
        hadBlockers: false,
        blockerCategory: '',
        blockerDescription: '',
        feedback: '',
    });

    if (!isOpen || !task) return null;

    const handleSubmit = () => {
        onSubmit({
            taskId: task.id,
            taskTitle: task.title,
            ...feedback,
            submittedAt: new Date().toISOString(),
        });
        onClose();
    };

    const difficultyLabels = ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Task Completed! 🎉</h3>
                        <p className="text-sm text-gray-400 mt-1">Help us improve by sharing your feedback</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Task Info */}
                <div className="bg-white/5 rounded-lg p-3 mb-6">
                    <p className="text-sm text-gray-400">Task</p>
                    <p className="text-white font-medium">{task.title}</p>
                </div>

                {/* Difficulty Rating */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-3">How difficult was this task?</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                            <button
                                key={rating}
                                onClick={() => setFeedback(prev => ({ ...prev, difficultyRating: rating }))}
                                className={`flex-1 p-3 rounded-lg transition-all ${feedback.difficultyRating === rating
                                        ? 'bg-violet-600 ring-2 ring-violet-400'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <Star className={`w-5 h-5 mx-auto mb-1 ${rating <= feedback.difficultyRating ? 'text-amber-400 fill-amber-400' : 'text-gray-500'
                                    }`} />
                                <p className="text-xs text-center text-gray-300">{rating}</p>
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                        {difficultyLabels[feedback.difficultyRating - 1]}
                    </p>
                </div>

                {/* Time Estimation */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Estimated Hours</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                value={feedback.estimatedHours}
                                onChange={(e) => setFeedback(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white"
                                min="0"
                                step="0.5"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Actual Hours</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                value={feedback.actualHours}
                                onChange={(e) => setFeedback(prev => ({ ...prev, actualHours: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white"
                                min="0"
                                step="0.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Accuracy Indicator */}
                {feedback.estimatedHours > 0 && feedback.actualHours > 0 && (
                    <div className={`mb-6 p-3 rounded-lg ${Math.abs(feedback.estimatedHours - feedback.actualHours) / feedback.estimatedHours <= 0.1
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : feedback.actualHours > feedback.estimatedHours
                                ? 'bg-amber-500/20 border border-amber-500/30'
                                : 'bg-blue-500/20 border border-blue-500/30'
                        }`}>
                        <div className="flex items-center gap-2">
                            {Math.abs(feedback.estimatedHours - feedback.actualHours) / feedback.estimatedHours <= 0.1 ? (
                                <>
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm">Great estimation! Within 10%</span>
                                </>
                            ) : feedback.actualHours > feedback.estimatedHours ? (
                                <>
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span className="text-amber-400 text-sm">
                                        Took {((feedback.actualHours - feedback.estimatedHours) / feedback.estimatedHours * 100).toFixed(0)}% longer than estimated
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400 text-sm">
                                        Completed {((feedback.estimatedHours - feedback.actualHours) / feedback.estimatedHours * 100).toFixed(0)}% faster than estimated
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Blockers */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <input
                            type="checkbox"
                            checked={feedback.hadBlockers}
                            onChange={(e) => setFeedback(prev => ({ ...prev, hadBlockers: e.target.checked }))}
                            className="rounded bg-white/5 border-white/10"
                        />
                        Did you encounter any blockers?
                    </label>

                    {feedback.hadBlockers && (
                        <div className="space-y-3 pl-4 border-l-2 border-amber-500/30">
                            <select
                                value={feedback.blockerCategory}
                                onChange={(e) => setFeedback(prev => ({ ...prev, blockerCategory: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="">Select blocker type</option>
                                {BLOCKER_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                            <textarea
                                value={feedback.blockerDescription}
                                onChange={(e) => setFeedback(prev => ({ ...prev, blockerDescription: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                                rows={2}
                                placeholder="Describe the blocker..."
                            />
                        </div>
                    )}
                </div>

                {/* General Feedback */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Any additional feedback?</label>
                    <textarea
                        value={feedback.feedback}
                        onChange={(e) => setFeedback(prev => ({ ...prev, feedback: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                        rows={2}
                        placeholder="Optional: Share any insights about this task..."
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskFeedbackModal;
