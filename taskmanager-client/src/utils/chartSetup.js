import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register all Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Shared defaults
ChartJS.defaults.font.family = 'Inter, system-ui, -apple-system, sans-serif';
ChartJS.defaults.color = '#64748b';
ChartJS.defaults.plugins.tooltip.backgroundColor = '#1e293b';
ChartJS.defaults.plugins.tooltip.titleFont = { size: 13, weight: '600' };
ChartJS.defaults.plugins.tooltip.bodyFont = { size: 12 };
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.boxPadding = 4;
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.pointStyle = 'circle';
ChartJS.defaults.plugins.legend.labels.padding = 16;
ChartJS.defaults.plugins.legend.labels.font = { size: 12 };
ChartJS.defaults.scale.grid = { color: '#f1f5f9' };
ChartJS.defaults.scale.border = { dash: [4, 4] };

export default ChartJS;
