import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import Card from '../common/Card';
import CustomSelect from '../common/CustomSelect';

const TimeTracker = ({ onStop, tasks = [] }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsRunning(false);
    const hours = (elapsed / 3600).toFixed(2);
    onStop?.({ taskId: selectedTask, totalHours: hours, elapsed });
    setElapsed(0);
  };

  const taskList = tasks.length > 0 ? tasks : [
    { taskId: 1, title: 'Implement user auth' },
    { taskId: 5, title: 'Database migration' },
    { taskId: 8, title: 'Workload balancing' },
  ];

  // Convert to CustomSelect options format
  const taskOptions = [
    { value: '', label: 'Select task' },
    ...taskList.map(t => ({ value: t.taskId, label: t.title }))
  ];

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isRunning ? 'bg-accent-50' : 'bg-slate-100'}`}>
            <Clock className={`h-6 w-6 ${isRunning ? 'text-accent-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Time Tracker</p>
            <p className={`text-3xl font-bold font-mono tracking-wider ${isRunning ? 'text-accent-600' : 'text-slate-800'}`}>
              {formatElapsed(elapsed)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={isRunning ? 'pointer-events-none opacity-50' : ''}>
            <CustomSelect
              value={selectedTask}
              onChange={setSelectedTask}
              options={taskOptions}
              placeholder="Select task"
              className="min-w-[180px]"
            />
          </div>

          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              disabled={!selectedTask}
              className="p-3 rounded-xl bg-accent-500 text-white hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="h-5 w-5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsRunning(false)}
                className="p-3 rounded-xl bg-warning-500 text-white hover:bg-warning-600 transition-colors cursor-pointer"
              >
                <Pause className="h-5 w-5" />
              </button>
              <button
                onClick={handleStop}
                className="p-3 rounded-xl bg-danger-500 text-white hover:bg-danger-600 transition-colors cursor-pointer"
              >
                <Square className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TimeTracker;
