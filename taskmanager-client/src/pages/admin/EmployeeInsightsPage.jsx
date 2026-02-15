import { useState } from 'react';
import {
    TrendingUp, Heart, FileText, AlertTriangle, Clock,
    Users, BookOpen, Target, Award, BarChart3,
    Smile, Frown, Meh, CheckCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { ANALYTICS_AGGREGATES, KUDOS_CATEGORIES } from '../../config/mockEmployeeFeatures';

/**
 * Employee Insights Analytics Page
 * Shows aggregated data from Employee enhancement features:
 * - Skill gaps & training requests
 * - Recognition/Kudos analytics
 * - Team sentiment
 * - Blocker trends
 * - Time estimation accuracy
 */
const EmployeeInsightsPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const data = ANALYTICS_AGGREGATES;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'skills', label: 'Skills', icon: TrendingUp },
        { id: 'recognition', label: 'Recognition', icon: Heart },
        { id: 'sentiment', label: 'Sentiment', icon: Smile },
        { id: 'blockers', label: 'Blockers', icon: AlertTriangle },
        { id: 'estimation', label: 'Estimation', icon: Clock },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Employee Insights</h1>
                </div>
                <p className="text-indigo-100">Analytics from employee feedback and activities</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Target className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Avg Skill Rating</p>
                                    <p className="text-xl font-bold text-white">3.6</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/20 rounded-lg">
                                    <Heart className="w-5 h-5 text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Kudos This Week</p>
                                    <p className="text-xl font-bold text-white">{data.recognition.thisWeek}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Smile className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Team Mood</p>
                                    <p className="text-xl font-bold text-white">{data.sentiment.avgMood.toFixed(1)}/5</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Active Blockers</p>
                                    <p className="text-xl font-bold text-white">{data.blockers.activeCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Estimation Accuracy</p>
                                    <p className="text-xl font-bold text-white">{data.estimation.avgAccuracy}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skill Gaps */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-violet-400" />
                                Top Skill Gaps
                            </h3>
                            <div className="space-y-3">
                                {data.skills.skillGaps.map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white">{skill.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-400 text-sm">{skill.gapCount} employees</span>
                                            <span className="text-gray-500">|</span>
                                            <span className="text-gray-400 text-sm">Avg: {skill.avgRating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Kudos Receivers */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" />
                                Top Recognition Recipients
                            </h3>
                            <div className="space-y-3">
                                {data.recognition.topReceivers.map((person, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                            <span className="text-white">{person.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-rose-400 text-sm">{person.count} kudos</span>
                                            <span className="text-gray-500">|</span>
                                            <span className="text-amber-400 text-sm">{person.points} pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Blocker Categories */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            Blocker Distribution
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(data.blockers.byCategory).map(([cat, count]) => (
                                <div key={cat} className="bg-white/5 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-white">{count}</p>
                                    <p className="text-sm text-gray-400 capitalize">{cat}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-sm text-gray-400 mb-2">Training Requests</h3>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-amber-500/20 rounded-lg p-3">
                                    <p className="text-xl font-bold text-amber-400">{data.skills.trainingRequests.pending}</p>
                                    <p className="text-xs text-gray-400">Pending</p>
                                </div>
                                <div className="bg-emerald-500/20 rounded-lg p-3">
                                    <p className="text-xl font-bold text-emerald-400">{data.skills.trainingRequests.approved}</p>
                                    <p className="text-xs text-gray-400">Approved</p>
                                </div>
                                <div className="bg-blue-500/20 rounded-lg p-3">
                                    <p className="text-xl font-bold text-blue-400">{data.skills.trainingRequests.completed}</p>
                                    <p className="text-xs text-gray-400">Completed</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 col-span-2">
                            <h3 className="text-sm text-gray-400 mb-4">Top Skills in Organization</h3>
                            <div className="space-y-3">
                                {data.skills.topSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="text-white w-32">{skill.name}</span>
                                        <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                                style={{ width: `${(skill.avgRating / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-violet-400 text-sm w-10">{skill.avgRating.toFixed(1)}</span>
                                        <span className="text-gray-400 text-sm w-20">{skill.employees} people</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">Skill Gaps - Needs Training</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {data.skills.skillGaps.map((skill, idx) => (
                                <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium">{skill.name}</span>
                                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Gap</span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {skill.gapCount} employees need improvement
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Average rating: {skill.avgRating.toFixed(1)}/5
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recognition Tab */}
            {activeTab === 'recognition' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <Heart className="w-5 h-5 text-rose-400" />
                                <span className="text-gray-400">Total Kudos</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{data.recognition.totalKudos}</p>
                            <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
                                <ArrowUp className="w-4 h-4" /> {data.recognition.thisWeek} this week
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 col-span-2">
                            <h3 className="text-sm text-gray-400 mb-3">By Category</h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(data.recognition.byCategory).map(([cat, count]) => {
                                    const catInfo = KUDOS_CATEGORIES.find(c => c.id === cat);
                                    return (
                                        <div key={cat} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                                            <span className="text-lg">{catInfo?.icon}</span>
                                            <span className="text-white">{count}</span>
                                            <span className="text-gray-400 text-sm capitalize">{cat}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-white mb-4">Top Givers</h3>
                            {data.recognition.topGivers.map((person, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-white">{person.name}</span>
                                    <span className="text-blue-400">{person.count} kudos sent</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-white mb-4">Top Receivers</h3>
                            {data.recognition.topReceivers.map((person, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-white">{person.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-rose-400">{person.count} received</span>
                                        <span className="text-amber-400 text-sm">({person.points} pts)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sentiment Tab */}
            {activeTab === 'sentiment' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-3">
                                <Smile className="w-8 h-8 text-emerald-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Average Mood</p>
                                    <p className="text-2xl font-bold text-white">{data.sentiment.avgMood.toFixed(1)}/5</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 col-span-3">
                            <h3 className="text-sm text-gray-400 mb-3">Mood Trend (Last 4 Weeks)</h3>
                            <div className="flex items-end gap-4 h-20">
                                {data.sentiment.trend.map((week, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
                                            style={{ height: `${(week.mood / 5) * 100}%` }}
                                        />
                                        <span className="text-xs text-gray-400">{week.week}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            Top Challenges Reported
                        </h3>
                        <div className="space-y-2">
                            {data.sentiment.topChallenges.map((challenge, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg">
                                    <span className="text-amber-400 font-bold">{idx + 1}.</span>
                                    <span className="text-white">{challenge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Blockers Tab */}
            {activeTab === 'blockers' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                            <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
                            <p className="text-sm text-gray-400">Active Blockers</p>
                            <p className="text-3xl font-bold text-white">{data.blockers.activeCount}</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
                            <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                            <p className="text-sm text-gray-400">Resolved This Week</p>
                            <p className="text-3xl font-bold text-white">{data.blockers.resolvedThisWeek}</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
                            <Clock className="w-6 h-6 text-blue-400 mb-2" />
                            <p className="text-sm text-gray-400">Avg Resolution Time</p>
                            <p className="text-3xl font-bold text-white">{data.blockers.avgResolutionTime}h</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">Blockers by Category</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(data.blockers.byCategory).map(([cat, count]) => (
                                <div key={cat} className="bg-white/5 rounded-lg p-4">
                                    <p className="text-3xl font-bold text-white">{count}</p>
                                    <p className="text-sm text-gray-400 capitalize mt-1">{cat}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Estimation Tab */}
            {activeTab === 'estimation' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
                            <Target className="w-6 h-6 text-emerald-400 mb-2" />
                            <p className="text-sm text-gray-400">Avg Accuracy</p>
                            <p className="text-3xl font-bold text-white">{data.estimation.avgAccuracy}%</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
                            <ArrowDown className="w-6 h-6 text-blue-400 mb-2" />
                            <p className="text-sm text-gray-400">Over-estimated</p>
                            <p className="text-3xl font-bold text-white">{data.estimation.overEstimated}</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                            <ArrowUp className="w-6 h-6 text-amber-400 mb-2" />
                            <p className="text-sm text-gray-400">Under-estimated</p>
                            <p className="text-3xl font-bold text-white">{data.estimation.underEstimated}</p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
                            <CheckCircle className="w-6 h-6 text-purple-400 mb-2" />
                            <p className="text-sm text-gray-400">Accurate (±10%)</p>
                            <p className="text-3xl font-bold text-white">{data.estimation.accurate}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">Estimation Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-gray-400 mb-2">Average Task Difficulty</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                            style={{ width: `${(data.estimation.avgDifficultyRating / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-bold">{data.estimation.avgDifficultyRating}/5</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-2">Recommendation</p>
                                <p className="text-white bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                                    💡 Consider adding 20% buffer to estimates for complex tasks.
                                    Under-estimation is more common than over-estimation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeInsightsPage;
