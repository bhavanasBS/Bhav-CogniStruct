import { useState, useEffect } from 'react';
import { Star, BookOpen, TrendingUp, Award, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { SKILLS_CATALOG, USER_SKILLS, TRAINING_REQUESTS } from '../../config/mockEmployeeFeatures';

const SkillProgressPage = () => {
    const [skills, setSkills] = useState([]);
    const [trainingRequests, setTrainingRequests] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);

    useEffect(() => {
        // Merge skills catalog with user ratings
        const mergedSkills = SKILLS_CATALOG.map(skill => {
            const userRating = USER_SKILLS.find(us => us.skillId === skill.id);
            return {
                ...skill,
                rating: userRating?.rating || 0,
            };
        });
        setSkills(mergedSkills);
        setTrainingRequests(TRAINING_REQUESTS);
    }, []);

    const categories = ['all', ...new Set(SKILLS_CATALOG.map(s => s.category))];

    const filteredSkills = selectedCategory === 'all'
        ? skills
        : skills.filter(s => s.category === selectedCategory);

    const handleRating = (skillId, rating) => {
        setSkills(prev => prev.map(s =>
            s.id === skillId ? { ...s, rating } : s
        ));
    };

    const handleRequestTraining = (skill) => {
        setSelectedSkill(skill);
        setShowRequestModal(true);
    };

    const submitTrainingRequest = () => {
        const newRequest = {
            id: Date.now(),
            userId: 3,
            skillId: selectedSkill.id,
            skillName: selectedSkill.name,
            status: 'pending',
            requestedAt: new Date().toISOString().split('T')[0],
        };
        setTrainingRequests(prev => [...prev, newRequest]);
        setShowRequestModal(false);
        setSelectedSkill(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
            case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
            case 'rejected': return <AlertCircle className="w-4 h-4 text-red-600" />;
            default: return null;
        }
    };

    const avgRating = skills.filter(s => s.rating > 0).reduce((acc, s) => acc + s.rating, 0) /
        Math.max(skills.filter(s => s.rating > 0).length, 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Skill Progress</h1>
                </div>
                <p className="text-violet-100">Track your skills and request training opportunities</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <Star className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg Rating</p>
                            <p className="text-xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Skills Rated</p>
                            <p className="text-xl font-bold text-gray-900">{skills.filter(s => s.rating > 0).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Training Approved</p>
                            <p className="text-xl font-bold text-gray-900">
                                {trainingRequests.filter(t => t.status === 'approved').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Requests</p>
                            <p className="text-xl font-bold text-gray-900">
                                {trainingRequests.filter(t => t.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                            ? 'bg-violet-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {cat === 'all' ? 'All Skills' : cat}
                    </button>
                ))}
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map(skill => (
                    <div key={skill.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                                <span className="text-xs text-violet-600 font-medium">{skill.category}</span>
                            </div>
                            <button
                                onClick={() => handleRequestTraining(skill)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Request Training"
                            >
                                <BookOpen className="w-4 h-4 text-violet-600" />
                            </button>
                        </div>

                        {/* Star Rating */}
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => handleRating(skill.id, star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-6 h-6 ${star <= skill.rating
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {skill.rating > 0 && (
                            <p className="text-xs text-emerald-600 mt-2 font-medium">
                                Your rating: {skill.rating}/5
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Training Requests */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                    Training Requests
                </h2>

                {trainingRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No training requests yet</p>
                ) : (
                    <div className="space-y-3">
                        {trainingRequests.map(request => {
                            const skill = SKILLS_CATALOG.find(s => s.id === request.skillId);
                            return (
                                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">{skill?.name || request.skillName}</p>
                                        <p className="text-xs text-gray-500">Requested on {request.requestedAt}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(request.status)}
                                        <span className={`text-sm capitalize font-medium ${request.status === 'approved' ? 'text-emerald-600' :
                                            request.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                            {request.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Training Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Training</h3>
                        <p className="text-gray-600 mb-4">
                            Request training for <span className="text-violet-600 font-medium">{selectedSkill?.name}</span>
                        </p>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 mb-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            rows={3}
                            placeholder="Why do you want this training? (optional)"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitTrainingRequest}
                                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillProgressPage;
