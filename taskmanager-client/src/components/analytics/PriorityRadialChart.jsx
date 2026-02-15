import '../../utils/chartSetup';
import { Doughnut } from 'react-chartjs-2';

const PriorityRadialChart = ({ data, title }) => {
  const raw = data || [
    { name: 'Critical', value: 8, color: '#ef4444' },
    { name: 'High', value: 22, color: '#f59e0b' },
    { name: 'Medium', value: 35, color: '#3b82f6' },
    { name: 'Low', value: 18, color: '#22c55e' },
  ];

  const total = raw.reduce((s, d) => s + d.value, 0);

  const chartData = {
    labels: raw.map((d) => d.name),
    datasets: [
      {
        data: raw.map((d) => d.value),
        backgroundColor: raw.map((d) => d.color),
        borderWidth: 0,
        hoverOffset: 8,
        spacing: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed;
            return ` ${ctx.label}: ${v} tasks (${((v / total) * 100).toFixed(0)}%)`;
          },
        },
      },
    },
  };

  // Center text plugin rendered via absolute positioning
  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>}
      <div className="relative" style={{ height: 280 }}>
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ bottom: 40 }}>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{total}</p>
            <p className="text-[11px] text-slate-500">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityRadialChart;
