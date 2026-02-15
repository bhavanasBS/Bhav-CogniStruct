import '../../utils/chartSetup';
import { Bar } from 'react-chartjs-2';

const TeamComparisonChart = ({ data, title }) => {
  const raw = data || [
    { name: 'Engineering', tasks: 42, efficiency: 88 },
    { name: 'Design', tasks: 28, efficiency: 92 },
    { name: 'QA', tasks: 35, efficiency: 85 },
    { name: 'DevOps', tasks: 20, efficiency: 90 },
  ];

  const chartData = {
    labels: raw.map((d) => d.name),
    datasets: [
      { label: 'Tasks Completed', data: raw.map((d) => d.tasks), backgroundColor: '#3b82f6', borderRadius: 4, borderSkipped: false },
      { label: 'Efficiency %', data: raw.map((d) => d.efficiency), backgroundColor: '#8b5cf6', borderRadius: 4, borderSkipped: false },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
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

export default TeamComparisonChart;
