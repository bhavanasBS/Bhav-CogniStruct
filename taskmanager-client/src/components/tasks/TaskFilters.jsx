import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../utils/constants';
import Button from '../common/Button';
import CustomSelect from '../common/CustomSelect';
import { Filter, X, Calendar, Flag, CheckSquare } from 'lucide-react';

const TaskFilters = ({ filters, onFilterChange, onReset }) => {
  const hasActiveFilters = filters.status !== null || filters.priority !== null || filters.dateFrom || filters.dateTo;

  // Convert labels to options format
  const statusOptions = [
    { value: '', label: 'All Status' },
    ...Object.entries(TASK_STATUS_LABELS).map(([key, label]) => ({
      value: Number(key),
      label
    }))
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    ...Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => ({
      value: Number(key),
      label
    }))
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Filter Label */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <span>Filters</span>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Status */}
        <CustomSelect
          value={filters.status ?? ''}
          onChange={(val) => onFilterChange('status', val === '' ? null : val)}
          options={statusOptions}
          placeholder="All Status"
          icon={CheckSquare}
        />

        {/* Priority */}
        <CustomSelect
          value={filters.priority ?? ''}
          onChange={(val) => onFilterChange('priority', val === '' ? null : val)}
          options={priorityOptions}
          placeholder="All Priority"
          icon={Flag}
        />

        <div className="h-6 w-px bg-slate-200" />

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="h-9 px-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all cursor-pointer hover:bg-slate-100 hover:border-slate-300"
          />
          <span className="text-xs text-slate-400 font-medium">to</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="h-9 px-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all cursor-pointer hover:bg-slate-100 hover:border-slate-300"
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-slate-200" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              icon={X}
              className="!text-rose-600 hover:!bg-rose-50"
            >
              Clear All
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
