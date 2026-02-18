import { useState, useEffect, useRef } from 'react';
import {
    Timer, Play, Pause, RotateCcw, Coffee, Sparkles,
    CheckCircle, Clock, Target, Flame, Volume2, VolumeX
} from 'lucide-react';
import Card from '../../components/common/Card';
import { taskApi } from '../../api/taskApi';
import { workLogApi } from '../../api/workLogApi';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const FocusMode = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'Employee', userId: 1 };

    // Timer states
    const [mode, setMode] = useState('work'); // 'work' or 'break'
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Task binding
    const [selectedTask, setSelectedTask] = useState(null);
    const [myTasks, setMyTasks] = useState([]);
    const [showTaskSelector, setShowTaskSelector] = useState(false);

    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    const WORK_DURATION = 25 * 60; // 25 minutes
    const BREAK_DURATION = 5 * 60; // 5 minutes
    const LONG_BREAK_DURATION = 15 * 60; // 15 minutes

    // Fetch user's tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await taskApi.getAll({ assigneeId: user.userId });
                const tasks = res.data?.items || res.data || [];
                // Filter for in-progress or pending tasks
                const activeTasks = tasks.filter(t => t.status === 0 || t.status === 1);
                setMyTasks(activeTasks.slice(0, 10));
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            }
        };
        fetchTasks();
    }, [user.userId]);

    // Timer effect
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft]);

    const handleTimerComplete = async () => {
        setIsRunning(false);

        // Play completion sound
        if (soundEnabled) {
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRg8');
                audio.play().catch(() => { });
            } catch (e) { }
        }

        if (mode === 'work') {
            setSessionsCompleted(prev => prev + 1);
            toast.success('🎉 Focus session complete! Time for a break.');

            // Log time if task is selected
            if (selectedTask) {
                try {
                    await workLogApi.create({
                        taskId: selectedTask.taskId,
                        userId: user.userId,
                        totalHours: 0.42, // ~25 minutes
                        description: 'Pomodoro focus session',
                        logDate: new Date().toISOString(),
                    });
                    toast.success('Time logged automatically!');
                } catch (e) {
                    console.error('Failed to log time:', e);
                }
            }

            // Switch to break
            const isLongBreak = (sessionsCompleted + 1) % 4 === 0;
            setMode('break');
            setTimeLeft(isLongBreak ? LONG_BREAK_DURATION : BREAK_DURATION);
        } else {
            toast.success('Break over! Ready for another focus session?');
            setMode('work');
            setTimeLeft(WORK_DURATION);
        }
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'work' ? WORK_DURATION : BREAK_DURATION);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(newMode === 'work' ? WORK_DURATION : BREAK_DURATION);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = mode === 'work'
        ? ((WORK_DURATION - timeLeft) / WORK_DURATION) * 100
        : ((BREAK_DURATION - timeLeft) / BREAK_DURATION) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`rounded-2xl p-6 text-white relative overflow-hidden transition-all ${mode === 'work'
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                }`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            {mode === 'work' ? <Timer className="w-7 h-7" /> : <Coffee className="w-7 h-7" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {mode === 'work' ? 'Focus Mode' : 'Break Time'}
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">
                                {mode === 'work'
                                    ? 'Stay focused and avoid distractions'
                                    : 'Take a breather, you earned it!'}
                            </p>
                        </div>
                    </div>

                    {/* Sessions counter */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Flame className="w-6 h-6 text-orange-300" />
                        <div>
                            <p className="text-2xl font-bold">{sessionsCompleted}</p>
                            <p className="text-white/70 text-xs">Sessions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Timer */}
                <div className="col-span-2">
                    <Card className="p-8">
                        {/* Mode Switcher */}
                        <div className="flex justify-center gap-2 mb-8">
                            <button
                                onClick={() => switchMode('work')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all cursor-pointer ${mode === 'work'
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                Focus
                            </button>
                            <button
                                onClick={() => switchMode('break')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all cursor-pointer ${mode === 'break'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                Break
                            </button>
                        </div>

                        {/* Timer Display */}
                        <div className="relative w-64 h-64 mx-auto mb-8">
                            {/* Progress Ring */}
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="128" cy="128" r="120"
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="128" cy="128" r="120"
                                    fill="none"
                                    stroke={mode === 'work' ? '#f43f5e' : '#10b981'}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 120}
                                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-bold text-slate-800 font-mono">
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-sm text-slate-500 mt-2 uppercase tracking-wider">
                                    {mode === 'work' ? 'Focus Time' : 'Break Time'}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={resetTimer}
                                className="p-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                            >
                                <RotateCcw className="w-6 h-6" />
                            </button>
                            <button
                                onClick={toggleTimer}
                                className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all cursor-pointer ${isRunning
                                        ? 'bg-slate-800 text-white hover:bg-slate-900'
                                        : mode === 'work'
                                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    }`}
                            >
                                {isRunning ? (
                                    <>
                                        <Pause className="w-5 h-5" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Start
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`p-4 rounded-xl transition-all cursor-pointer ${soundEnabled
                                        ? 'bg-indigo-100 text-indigo-600'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Selected Task */}
                        {selectedTask && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">Working on:</p>
                                <p className="font-semibold text-slate-800">{selectedTask.title}</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Task Selector */}
                    <Card>
                        <div className="px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-indigo-500" />
                                <h3 className="font-semibold text-slate-800">Bind to Task</h3>
                            </div>
                        </div>
                        <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                            {myTasks.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No active tasks</p>
                            ) : (
                                myTasks.map((task) => (
                                    <button
                                        key={task.taskId}
                                        onClick={() => setSelectedTask(task)}
                                        className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${selectedTask?.taskId === task.taskId
                                                ? 'bg-indigo-50 border-2 border-indigo-500'
                                                : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                                            }`}
                                    >
                                        <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                                        <p className="text-xs text-slate-400">{task.teamName || 'Personal'}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Today's Stats */}
                    <Card>
                        <div className="px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <h3 className="font-semibold text-slate-800">Today's Focus</h3>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Sessions</span>
                                <span className="font-bold text-slate-800">{sessionsCompleted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Focus Time</span>
                                <span className="font-bold text-slate-800">{Math.round(sessionsCompleted * 25)} min</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Goal</span>
                                <span className="font-bold text-emerald-600">4 sessions</span>
                            </div>

                            {/* Progress to goal */}
                            <div className="pt-2">
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                        style={{ width: `${Math.min((sessionsCompleted / 4) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tips */}
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                        <div className="p-4">
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Pro Tip</p>
                            <p className="text-sm text-amber-800">
                                Take a 15-minute break after every 4 sessions to maintain peak productivity!
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FocusMode;
