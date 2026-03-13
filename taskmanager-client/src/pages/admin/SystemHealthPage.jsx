import { useState, useEffect } from 'react';
import {
    Server, Database, Cpu, HardDrive, Wifi,
    CheckCircle, AlertTriangle, XCircle, Activity, RefreshCw, Clock
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const SystemHealthPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Mock system health data
    const [healthData, setHealthData] = useState({
        overall: 'healthy',
        uptime: '99.98%',
        lastIncident: null,
        services: [
            { name: 'API Server', status: 'healthy', responseTime: '45ms', uptime: '99.99%' },
            { name: 'Database', status: 'healthy', responseTime: '12ms', uptime: '99.97%' },
            { name: 'Cache Server', status: 'healthy', responseTime: '3ms', uptime: '99.99%' },
            { name: 'File Storage', status: 'warning', responseTime: '120ms', uptime: '99.80%' },
            { name: 'Email Service', status: 'healthy', responseTime: '85ms', uptime: '99.95%' },
            { name: 'Background Jobs', status: 'healthy', responseTime: '25ms', uptime: '99.90%' },
        ],
        metrics: {
            cpu: 45,
            memory: 62,
            disk: 38,
            network: 25,
        },
        recentEvents: [
            { id: 1, type: 'info', message: 'System backup completed successfully', time: '10 min ago' },
            { id: 2, type: 'warning', message: 'File storage response time elevated', time: '25 min ago' },
            { id: 3, type: 'info', message: 'Database optimization completed', time: '1 hour ago' },
            { id: 4, type: 'success', message: 'All services recovered after maintenance', time: '3 hours ago' },
        ],
    });

    const refreshData = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setLastRefresh(new Date());
        toast.success('Health data refreshed');
        setIsLoading(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-rose-500" />;
            default: return <Activity className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'healthy': return 'bg-emerald-50 border-emerald-200';
            case 'warning': return 'bg-amber-50 border-amber-200';
            case 'error': return 'bg-rose-50 border-rose-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    const getMetricColor = (value) => {
        if (value < 50) return 'from-emerald-400 to-emerald-500';
        if (value < 75) return 'from-amber-400 to-amber-500';
        return 'from-rose-400 to-rose-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${healthData.overall === 'healthy'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                    : healthData.overall === 'warning'
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-500'
                }`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Server className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                System Health
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">All systems operational</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-2xl font-bold">{healthData.uptime}</p>
                            <p className="text-white/70 text-xs">Uptime</p>
                        </div>
                        <Button
                            variant="secondary"
                            icon={RefreshCw}
                            onClick={refreshData}
                            className={isLoading ? 'animate-spin' : ''}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'CPU Usage', value: healthData.metrics.cpu, icon: Cpu },
                    { label: 'Memory', value: healthData.metrics.memory, icon: Database },
                    { label: 'Disk Space', value: healthData.metrics.disk, icon: HardDrive },
                    { label: 'Network', value: healthData.metrics.network, icon: Wifi },
                ].map((metric, index) => (
                    <Card key={index}>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <metric.icon className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                                </div>
                                <span className="text-lg font-bold text-slate-800">{metric.value}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${getMetricColor(metric.value)} transition-all`}
                                    style={{ width: `${metric.value}%` }}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Services Status */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            <h3 className="font-semibold text-slate-800">Services Status</h3>
                        </div>
                        <Badge variant="success">{healthData.services.filter(s => s.status === 'healthy').length}/{healthData.services.length} Healthy</Badge>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {healthData.services.map((service, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between px-6 py-3 ${getStatusBg(service.status)} border-l-4 ${service.status === 'healthy' ? 'border-l-emerald-500' :
                                        service.status === 'warning' ? 'border-l-amber-500' : 'border-l-rose-500'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(service.status)}
                                    <span className="font-medium text-slate-800">{service.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-slate-500">{service.responseTime}</span>
                                    <span className="text-slate-400">{service.uptime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Events */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-500" />
                            <h3 className="font-semibold text-slate-800">Recent Events</h3>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {healthData.recentEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-start gap-3 px-6 py-4"
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 ${event.type === 'success' ? 'bg-emerald-500' :
                                        event.type === 'warning' ? 'bg-amber-500' :
                                            event.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
                                    }`} />
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700">{event.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{event.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Last Refresh Info */}
            <div className="text-center text-sm text-slate-400">
                Last refreshed: {lastRefresh.toLocaleTimeString()}
            </div>
        </div>
    );
};

export default SystemHealthPage;
