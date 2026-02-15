import '../../utils/chartSetup';
import { Line } from 'react-chartjs-2';

const WeeklyLineChart = ({ data, title }) => {
  const raw = data || [
    { name: 'Week 1', tasks: 18, hours: 36 },
    { name: 'Week 2', tasks: 22, hours: 42 },
    { name: 'Week 3', tasks: 15, hours: 30 },
    { name: 'Week 4', tasks: 28, hours: 48 },
    { name: 'Week 5', tasks: 24, hours: 40 },
    { name: 'Week 6', tasks: 30, hours: 52 },
  ];

  const chartData = {
    labels: raw.map((d) => d.name),
    datasets: [
      {
        label: 'Tasks Completed',
        data: raw.map((d) => d.tasks),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointHoverRadius: 6,
      },
      {
        label: 'Hours Logged',
        data: raw.map((d) => d.hours),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#22c55e',
        pointHoverRadius: 6,
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
      y: { beginAtZero: true },
    },
  };

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>}
      <div style={{ height: 280 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WeeklyLineChart;
