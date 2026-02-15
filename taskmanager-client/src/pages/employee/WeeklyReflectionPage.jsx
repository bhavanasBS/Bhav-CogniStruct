import { useState, useEffect } from 'react';
import { FileText, Send, Calendar, Smile, Meh, Frown, TrendingUp, Target, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKLY_REFLECTIONS } from '../../config/mockEmployeeFeatures';

const WeeklyReflectionPage = () => {
    const [reflections, setReflections] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeekStart());
    const [newReflection, setNewReflection] = useState({
        wins: '',
        challenges: '',
        learnings: '',
        goals: '',
        mood: 3,
    });

    function getCurrentWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.setDate(diff)).toISOString().split('T')[0];
    }

    useEffect(() => {
        setReflections(WEEKLY_REFLECTIONS);
    }, []);

    const currentReflection = reflections.find(r => r.weekStart === currentWeek);
    const hasSubmittedThisWeek = currentReflection !== undefined;

    const moodOptions = [
        { value: 1, icon: Frown, label: 'Struggling', color: 'text-red-500' },
        { value: 2, icon: Frown, label: 'Challenging', color: 'text-orange-500' },
        { value: 3, icon: Meh, label: 'Okay', color: 'text-amber-500' },
        { value: 4, icon: Smile, label: 'Good', color: 'text-emerald-500' },
        { value: 5, icon: Smile, label: 'Great', color: 'text-green-500' },
    ];

    const handleSubmit = () => {
        const reflection = {
            id: Date.now(),
            userId: 3,
            weekStart: currentWeek,
            ...newReflection,
            submittedAt: new Date().toISOString(),
        };
        setReflections(prev => [reflection, ...prev]);
        setShowForm(false);
        setNewReflection({ wins: '', challenges: '', learnings: '', goals: '', mood: 3 });
    };

    const navigateWeek = (direction) => {
        const date = new Date(currentWeek);
        date.setDate(date.getDate() + (direction * 7));
        setCurrentWeek(date.toISOString().split('T')[0]);
    };

    const formatWeek = (dateStr) => {
        const start = new Date(dateStr);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const getMoodInfo = (mood) => moodOptions.find(m => m.value === mood) || moodOptions[2];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold">Weekly Reflection</h1>
                        </div>
                        <p className="text-teal-100">Reflect on your week and plan ahead</p>
                    </div>
                    {!hasSubmittedThisWeek && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-white text-teal-600 rounded-xl font-medium hover:bg-teal-50 transition-colors flex items-center gap-2 shadow-md"
                        >
                            <Send className="w-5 h-5" />
                            Submit Reflection
                        </button>
                    )}
                </div>
            </div>

            {/* Week Navigator */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => navigateWeek(-1)}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    <span className="text-gray-900 font-medium">{formatWeek(currentWeek)}</span>
                </div>
                <button
                    onClick={() => navigateWeek(1)}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    disabled={currentWeek >= getCurrentWeekStart()}
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Reflections</p>
                            <p className="text-xl font-bold text-gray-900">{reflections.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg Mood</p>
                            <p className="text-xl font-bold text-gray-900">
                                {(reflections.reduce((acc, r) => acc + r.mood, 0) / Math.max(reflections.length, 1)).toFixed(1)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Streak</p>
                            <p className="text-xl font-bold text-gray-900">{reflections.length} weeks</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 ${hasSubmittedThisWeek ? 'bg-emerald-100' : 'bg-amber-100'} rounded-lg`}>
                            {hasSubmittedThisWeek ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">This Week</p>
                            <p className={`text-sm font-medium ${hasSubmittedThisWeek ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {hasSubmittedThisWeek ? 'Submitted' : 'Pending'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Week Reflection */}
            {currentReflection ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Week of {formatWeek(currentReflection.weekStart)}</h2>
                        <div className="flex items-center gap-2">
                            {(() => {
                                const mood = getMoodInfo(currentReflection.mood);
                                const MoodIcon = mood.icon;
                                return (
                                    <div className={`flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full ${mood.color}`}>
                                        <MoodIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{mood.label}</span>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2 font-medium">
                                <span className="text-emerald-500">✓</span> Wins
                            </h3>
                            <p className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{currentReflection.wins}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2 font-medium">
                                <span className="text-amber-500">!</span> Challenges
                            </h3>
                            <p className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{currentReflection.challenges}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2 font-medium">
                                <span className="text-blue-500">💡</span> Learnings
                            </h3>
                            <p className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{currentReflection.learnings}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2 font-medium">
                                <span className="text-purple-500">🎯</span> Next Week Goals
                            </h3>
                            <p className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{currentReflection.goals}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No reflection for this week yet</p>
                    {currentWeek === getCurrentWeekStart() && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 shadow-md"
                        >
                            Submit Now
                        </button>
                    )}
                </div>
            )}

            {/* Past Reflections */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Reflections</h2>
                <div className="space-y-3">
                    {reflections.filter(r => r.weekStart !== currentWeek).map(reflection => {
                        const mood = getMoodInfo(reflection.mood);
                        const MoodIcon = mood.icon;
                        return (
                            <div key={reflection.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900 font-medium">{formatWeek(reflection.weekStart)}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${mood.color}`}>
                                        <MoodIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{mood.label}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-teal-500" />
                            Weekly Reflection - {formatWeek(currentWeek)}
                        </h3>

                        {/* Mood */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-3 font-medium">How was your week?</label>
                            <div className="flex justify-between gap-2">
                                {moodOptions.map(option => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setNewReflection(prev => ({ ...prev, mood: option.value }))}
                                            className={`flex-1 p-4 rounded-xl transition-all ${newReflection.mood === option.value
                                                ? 'bg-teal-500 ring-2 ring-teal-400 shadow-md'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 mx-auto mb-1 ${newReflection.mood === option.value ? 'text-white' : option.color}`} />
                                            <p className={`text-xs text-center ${newReflection.mood === option.value ? 'text-white' : 'text-gray-600'}`}>{option.label}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Wins */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">🎉 What went well?</label>
                            <textarea
                                value={newReflection.wins}
                                onChange={(e) => setNewReflection(prev => ({ ...prev, wins: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                rows={2}
                                placeholder="List your wins and accomplishments..."
                            />
                        </div>

                        {/* Challenges */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">⚠️ What was challenging?</label>
                            <textarea
                                value={newReflection.challenges}
                                onChange={(e) => setNewReflection(prev => ({ ...prev, challenges: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                rows={2}
                                placeholder="What obstacles did you face?"
                            />
                        </div>

                        {/* Learnings */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">💡 What did you learn?</label>
                            <textarea
                                value={newReflection.learnings}
                                onChange={(e) => setNewReflection(prev => ({ ...prev, learnings: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                rows={2}
                                placeholder="Key insights and learnings..."
                            />
                        </div>

                        {/* Goals */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">🎯 Goals for next week</label>
                            <textarea
                                value={newReflection.goals}
                                onChange={(e) => setNewReflection(prev => ({ ...prev, goals: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                rows={2}
                                placeholder="What do you want to achieve?"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!newReflection.wins || !newReflection.challenges}
                                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Submit Reflection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyReflectionPage;
