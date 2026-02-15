import '../../utils/chartSetup';
import { Bar } from 'react-chartjs-2';

const WorkloadHeatBar = ({ data, title }) => {
  const raw = data || [
    { member: 'Priya S.', assigned: 8, completed: 6, overdue: 1 },
    { member: 'Rahul G.', assigned: 6, completed: 5, overdue: 0 },
    { member: 'Anita D.', assigned: 9, completed: 4, overdue: 2 },
    { member: 'Vikram S.', assigned: 5, completed: 5, overdue: 0 },
    { member: 'Sarah K.', assigned: 7, completed: 3, overdue: 1 },
    { member: 'Tom B.', assigned: 4, completed: 4, overdue: 0 },
  ];

  const chartData = {
    labels: raw.map((d) => d.member),
    datasets: [
      {
        label: 'Completed',
        data: raw.map((d) => d.completed),
        backgroundColor: '#22c55e',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Remaining',
        data: raw.map((d) => d.assigned - d.completed - d.overdue),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Overdue',
        data: raw.map((d) => d.overdue),
        backgroundColor: '#ef4444',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { stacked: true, grid: { display: false }, beginAtZero: true },
      y: { stacked: true, grid: { display: false } },
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

export default WorkloadHeatBar;
