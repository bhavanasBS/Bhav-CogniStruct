import { useState, useEffect } from 'react';
import { Heart, Send, Trophy, Users, Sparkles, Star, Award, Gift } from 'lucide-react';
import { KUDOS_DATA, KUDOS_CATEGORIES } from '../../config/mockEmployeeFeatures';
import { MOCK_USERS as AUTH_USERS } from '../../config/mockUsers';

const PeerRecognitionPage = () => {
    const [kudosList, setKudosList] = useState([]);
    const [showSendModal, setShowSendModal] = useState(false);
    const [activeTab, setActiveTab] = useState('received');
    const [newKudos, setNewKudos] = useState({
        toUserId: '',
        message: '',
        category: 'excellence',
        points: 25,
    });

    const currentUserId = 3; // Employee user

    useEffect(() => {
        setKudosList(KUDOS_DATA);
    }, []);

    const receivedKudos = kudosList.filter(k => k.toUserId === currentUserId);
    const sentKudos = kudosList.filter(k => k.fromUserId === currentUserId);
    const totalPoints = receivedKudos.reduce((acc, k) => acc + k.points, 0);

    const handleSendKudos = () => {
        const selectedUser = AUTH_USERS.find(u => u.id === parseInt(newKudos.toUserId));
        const newKudosItem = {
            id: Date.now(),
            fromUserId: currentUserId,
            fromName: 'Employee User',
            toUserId: parseInt(newKudos.toUserId),
            toName: selectedUser?.firstName + ' ' + selectedUser?.lastName,
            message: newKudos.message,
            points: newKudos.points,
            category: newKudos.category,
            createdAt: new Date().toISOString(),
        };
        setKudosList(prev => [newKudosItem, ...prev]);
        setShowSendModal(false);
        setNewKudos({ toUserId: '', message: '', category: 'excellence', points: 25 });
    };

    const getCategoryInfo = (categoryId) => {
        return KUDOS_CATEGORIES.find(c => c.id === categoryId) || KUDOS_CATEGORIES[0];
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold">Peer Recognition</h1>
                        </div>
                        <p className="text-rose-100">Celebrate your teammates' achievements</p>
                    </div>
                    <button
                        onClick={() => setShowSendModal(true)}
                        className="px-4 py-2 bg-white text-rose-600 rounded-xl font-medium hover:bg-rose-50 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <Gift className="w-5 h-5" />
                        Send Kudos
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Trophy className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Points</p>
                            <p className="text-xl font-bold text-gray-900">{totalPoints}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <Heart className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Received</p>
                            <p className="text-xl font-bold text-gray-900">{receivedKudos.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Send className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Sent</p>
                            <p className="text-xl font-bold text-gray-900">{sentKudos.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Streak</p>
                            <p className="text-xl font-bold text-gray-900">5 days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'received'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    Received ({receivedKudos.length})
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'sent'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    Sent ({sentKudos.length})
                </button>
            </div>

            {/* Kudos List */}
            <div className="space-y-4">
                {(activeTab === 'received' ? receivedKudos : sentKudos).map(kudos => {
                    const category = getCategoryInfo(kudos.category);
                    return (
                        <div key={kudos.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-amber-100">
                                    <span className="text-2xl">{category.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="text-gray-500">
                                                {activeTab === 'received' ? 'From' : 'To'}:
                                            </span>
                                            <span className="text-gray-900 font-medium ml-2">
                                                {activeTab === 'received' ? kudos.fromName : kudos.toName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1 bg-amber-100 rounded-full flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-600" />
                                                <span className="text-amber-700 font-medium">{kudos.points} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 mb-2">{kudos.message}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded font-medium">
                                            {category.name}
                                        </span>
                                        <span>{formatDate(kudos.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(activeTab === 'received' ? receivedKudos : sentKudos).length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-xl">
                        <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No kudos {activeTab} yet</p>
                    </div>
                )}
            </div>

            {/* Send Kudos Modal */}
            {showSendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-rose-500" />
                            Send Kudos
                        </h3>

                        {/* Select Team Member */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">To:</label>
                            <select
                                value={newKudos.toUserId}
                                onChange={(e) => setNewKudos(prev => ({ ...prev, toUserId: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            >
                                <option value="">Select a teammate</option>
                                {AUTH_USERS.filter(u => u.id !== currentUserId).map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">Category:</label>
                            <div className="grid grid-cols-5 gap-2">
                                {KUDOS_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setNewKudos(prev => ({ ...prev, category: cat.id }))}
                                        className={`p-3 rounded-lg text-2xl transition-all ${newKudos.category === cat.id
                                            ? 'bg-rose-500 ring-2 ring-rose-400 shadow-md'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        title={cat.name}
                                    >
                                        {cat.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Points */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">Points: {newKudos.points}</label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={newKudos.points}
                                onChange={(e) => setNewKudos(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                                className="w-full accent-rose-500"
                            />
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">Message:</label>
                            <textarea
                                value={newKudos.message}
                                onChange={(e) => setNewKudos(prev => ({ ...prev, message: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                rows={3}
                                placeholder="What did they do that was awesome?"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSendModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendKudos}
                                disabled={!newKudos.toUserId || !newKudos.message}
                                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send Kudos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeerRecognitionPage;
