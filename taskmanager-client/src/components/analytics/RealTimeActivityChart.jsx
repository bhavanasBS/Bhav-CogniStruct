import '../../utils/chartSetup';
import { Line } from 'react-chartjs-2';

const RealTimeActivityChart = ({ data, title }) => {
  // Simulated last-24h activity in 2-hour buckets
  const raw = data || [
    { time: '12 AM', taskCreated: 0, taskCompleted: 0, logsAdded: 0 },
    { time: '2 AM', taskCreated: 0, taskCompleted: 0, logsAdded: 0 },
    { time: '4 AM', taskCreated: 0, taskCompleted: 0, logsAdded: 0 },
    { time: '6 AM', taskCreated: 1, taskCompleted: 0, logsAdded: 0 },
    { time: '8 AM', taskCreated: 3, taskCompleted: 1, logsAdded: 2 },
    { time: '10 AM', taskCreated: 5, taskCompleted: 4, logsAdded: 6 },
    { time: '12 PM', taskCreated: 2, taskCompleted: 3, logsAdded: 4 },
    { time: '2 PM', taskCreated: 4, taskCompleted: 5, logsAdded: 7 },
    { time: '4 PM', taskCreated: 3, taskCompleted: 6, logsAdded: 5 },
    { time: '6 PM', taskCreated: 1, taskCompleted: 2, logsAdded: 3 },
    { time: '8 PM', taskCreated: 0, taskCompleted: 1, logsAdded: 1 },
    { time: '10 PM', taskCreated: 0, taskCompleted: 0, logsAdded: 0 },
  ];

  const chartData = {
    labels: raw.map((d) => d.time),
    datasets: [
      {
        label: 'Tasks Created',
        data: raw.map((d) => d.taskCreated),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.06)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6',
      },
      {
        label: 'Tasks Completed',
        data: raw.map((d) => d.taskCompleted),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.06)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#22c55e',
      },
      {
        label: 'Time Logs',
        data: raw.map((d) => d.logsAdded),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.06)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#8b5cf6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 2 } },
    },
    animation: { duration: 600 },
  };

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>}
      <div style={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RealTimeActivityChart;
