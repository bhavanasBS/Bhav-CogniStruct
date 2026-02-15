import '../../utils/chartSetup';
import { Line } from 'react-chartjs-2';

const HoursAreaChart = ({ data, title }) => {
  const raw = data || [
    { day: 'Mon', logged: 6.5, target: 8 },
    { day: 'Tue', logged: 7.2, target: 8 },
    { day: 'Wed', logged: 8.1, target: 8 },
    { day: 'Thu', logged: 5.0, target: 8 },
    { day: 'Fri', logged: 7.8, target: 8 },
    { day: 'Sat', logged: 3.0, target: 4 },
    { day: 'Sun', logged: 1.5, target: 0 },
  ];

  const chartData = {
    labels: raw.map((d) => d.day),
    datasets: [
      {
        label: 'Hours Logged',
        data: raw.map((d) => d.logged),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#8b5cf6',
        pointHoverRadius: 6,
      },
      {
        label: 'Target Hours',
        data: raw.map((d) => d.target),
        borderColor: '#94a3b8',
        borderDash: [6, 4],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
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
      y: { beginAtZero: true, max: 12, ticks: { callback: (v) => `${v}h` } },
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

export default HoursAreaChart;
