import '../../utils/chartSetup';
import { Doughnut } from 'react-chartjs-2';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e'];

const StatusPieChart = ({ data, title }) => {
  const raw = data || [
    { name: 'Pending', value: 12 },
    { name: 'In Progress', value: 18 },
    { name: 'Under Review', value: 6 },
    { name: 'Completed', value: 24 },
  ];

  const total = raw.reduce((s, d) => s + d.value, 0);

  const chartData = {
    labels: raw.map((d) => d.name),
    datasets: [
      {
        data: raw.map((d) => d.value),
        backgroundColor: COLORS,
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed;
            return ` ${ctx.label}: ${v} tasks (${((v / total) * 100).toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>}
      <div style={{ height: 280 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StatusPieChart;
