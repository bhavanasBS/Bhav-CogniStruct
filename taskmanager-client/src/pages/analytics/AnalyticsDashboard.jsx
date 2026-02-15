import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Sparkles,
  Trophy,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import TaskBarChart from '../../components/analytics/TaskBarChart';
import StatusPieChart from '../../components/analytics/StatusPieChart';
import WeeklyLineChart from '../../components/analytics/WeeklyLineChart';

/* ─── KPI data ────────────────────────────────────── */
const kpis = [
  { label: 'Total Tasks', value: '156', change: 12, icon: Target, gradient: 'from-purple-500 to-purple-600', up: true },
  { label: 'Completed', value: '98', change: 18, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', up: true },
  { label: 'Hours Logged', value: '1,248', change: 8, icon: Clock, gradient: 'from-blue-500 to-blue-600', up: true },
  { label: 'Active Members', value: '24', change: 2, icon: Users, gradient: 'from-amber-500 to-amber-600', up: true },
  { label: 'Overdue', value: '7', change: 3, icon: AlertTriangle, gradient: 'from-rose-500 to-rose-600', up: false },
  { label: 'Efficiency', value: '89%', change: 5, icon: Zap, gradient: 'from-indigo-500 to-indigo-600', up: true },
];

/* ─── Top Performers ──────────────────────────────── */
const topPerformers = [
  { name: 'Priya Sharma', tasks: 24, hours: 86, efficiency: 95 },
  { name: 'Rahul Gupta', tasks: 21, hours: 78, efficiency: 91 },
  { name: 'Anita Desai', tasks: 19, hours: 72, efficiency: 88 },
  { name: 'Vikram Singh', tasks: 18, hours: 68, efficiency: 86 },
  { name: 'Sarah Khan', tasks: 16, hours: 60, efficiency: 84 },
];

const AnalyticsDashboard = () => {
  const [period, setPeriod] = useState('week');

  return (
    <div className="space-y-6">
      {/* Header with Cognitive Styling */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Analytics Dashboard
                <Sparkles className="w-5 h-5 text-amber-300" />
              </h1>
              <p className="text-white/80 text-sm mt-0.5">Real-time insights into team productivity and performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {['week', 'month', 'quarter'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${period === p ? 'bg-white text-purple-600 shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${kpi.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row: Task Activity + Status + Weekly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <CardTitle>Task Activity</CardTitle>
            </div>
          </CardHeader>
          <TaskBarChart />
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <CardTitle>Status Distribution</CardTitle>
            </div>
          </CardHeader>
          <StatusPieChart />
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <CardTitle>Weekly Trends</CardTitle>
            </div>
          </CardHeader>
          <WeeklyLineChart />
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <CardTitle>Top Performers This Week</CardTitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasks Completed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours Logged</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topPerformers.map((p, i) => (
                <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg'
                        : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                          : i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                        {p.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-800">{p.tasks}</span>
                    <span className="text-xs text-slate-400 ml-1">tasks</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{p.hours}h</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.efficiency >= 90 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                              : p.efficiency >= 85 ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                : 'bg-gradient-to-r from-amber-400 to-amber-500'
                            }`}
                          style={{ width: `${p.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{p.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
