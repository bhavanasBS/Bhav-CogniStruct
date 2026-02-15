import '../../utils/chartSetup';
import { Bar } from 'react-chartjs-2';

const TaskBarChart = ({ data, title }) => {
  const raw = data || [
    { name: 'Mon', completed: 5, inProgress: 3, pending: 2 },
    { name: 'Tue', completed: 7, inProgress: 2, pending: 1 },
    { name: 'Wed', completed: 4, inProgress: 5, pending: 3 },
    { name: 'Thu', completed: 8, inProgress: 1, pending: 2 },
    { name: 'Fri', completed: 6, inProgress: 4, pending: 1 },
  ];

  const chartData = {
    labels: raw.map((d) => d.name),
    datasets: [
      { label: 'Completed', data: raw.map((d) => d.completed), backgroundColor: '#22c55e', borderRadius: 4, borderSkipped: false },
      { label: 'In Progress', data: raw.map((d) => d.inProgress), backgroundColor: '#3b82f6', borderRadius: 4, borderSkipped: false },
      { label: 'Pending', data: raw.map((d) => d.pending), backgroundColor: '#f59e0b', borderRadius: 4, borderSkipped: false },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 2 } },
    },
  };

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>}
      <div style={{ height: 280 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TaskBarChart;
