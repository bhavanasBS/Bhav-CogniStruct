import { Lightbulb, ArrowRight, Users, RotateCcw } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../common/Card';

const demoRecommendations = [
  {
    id: 1,
    type: 'rebalance',
    priority: 'high',
    message: 'Rahul Gupta is at 95% workload capacity. Consider reassigning 2 tasks to team members with lighter loads.',
    action: 'Review Assignments',
    icon: RotateCcw,
  },
  {
    id: 2,
    type: 'delegate',
    priority: 'medium',
    message: 'Anita Desai has 3 tasks nearing deadlines. Suggest delegating "API Documentation" to available team members.',
    action: 'Delegate Task',
    icon: Users,
  },
  {
    id: 3,
    type: 'insight',
    priority: 'low',
    message: 'Engineering team productivity increased 15% this week. The QA team has available capacity for additional workload.',
    action: 'View Details',
    icon: Lightbulb,
  },
];

const priorityColors = {
  high: 'border-l-danger-500 bg-danger-50/30',
  medium: 'border-l-warning-500 bg-warning-50/30',
  low: 'border-l-primary-500 bg-primary-50/30',
};

const RecommendationPanel = ({ recommendations = demoRecommendations }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning-500" />
          <CardTitle>AI Recommendations</CardTitle>
        </div>
      </CardHeader>
      <div className="space-y-3 p-1">
        {recommendations.map((rec) => (
          <div key={rec.id} className={`p-4 rounded-xl border-l-4 ${priorityColors[rec.priority]}`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <rec.icon className="h-4 w-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed">{rec.message}</p>
                <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer">
                  {rec.action}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecommendationPanel;
