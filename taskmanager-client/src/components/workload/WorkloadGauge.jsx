const WorkloadGauge = ({ percentage = 0, label, size = 'md' }) => {
  const getColor = (pct) => {
    if (pct < 50) return { stroke: '#22c55e', bg: 'bg-accent-50', text: 'text-accent-700', label: 'Low' };
    if (pct < 80) return { stroke: '#f59e0b', bg: 'bg-warning-50', text: 'text-warning-700', label: 'Moderate' };
    return { stroke: '#ef4444', bg: 'bg-danger-50', text: 'text-danger-700', label: 'High' };
  };

  const sizeMap = { sm: 80, md: 120, lg: 160 };
  const dim = sizeMap[size];
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getColor(percentage);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'} text-slate-800`}>
            {percentage}%
          </span>
        </div>
      </div>
      {label && <p className="text-sm font-medium text-slate-600 text-center">{label}</p>}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
        {color.label}
      </span>
    </div>
  );
};

export default WorkloadGauge;
