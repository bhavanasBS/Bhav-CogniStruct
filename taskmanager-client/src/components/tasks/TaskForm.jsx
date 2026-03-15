import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import CustomSelect from '../common/CustomSelect';
import DateTimePicker from '../common/DateTimePicker';
import { TASK_PRIORITY_LABELS } from '../../utils/constants';
import { User, Users2, Flag, AlertTriangle, Zap } from 'lucide-react';
import api from '../../api/axiosInstance';

const TaskForm = ({ isOpen, onClose, onSubmit, task = null, employees = [], isLoading }) => {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo || '',

    priority: task?.priority ?? 1,
    deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    estimatedHours: task?.estimatedHours || '',
  });
  const [errors, setErrors] = useState({});

  // Workload preview state
  const [assigneeWorkload, setAssigneeWorkload] = useState(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSelectChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));

    // When assignee changes, fetch their workload
    if (field === 'assignedTo' && value) {
      fetchWorkload(value);
    } else if (field === 'assignedTo' && !value) {
      setAssigneeWorkload(null);
    }
  };

  // Fetch workload for selected employee
  const fetchWorkload = async (userId) => {
    try {
      setLoadingWorkload(true);
      const res = await api.get(`/api/workload/employee/${userId}`);
      setAssigneeWorkload(res.data);
    } catch {
      setAssigneeWorkload(null);
    } finally {
      setLoadingWorkload(false);
    }
  };

  // Calculate projected workload with new task
  const getProjectedWorkload = () => {
    if (!assigneeWorkload) return null;
    const current = assigneeWorkload.estimatedWorkloadHours || 0;
    const newHours = Number(form.estimatedHours) || 0;
    const projected = current + newHours;
    const capacity = assigneeWorkload.weeklyCapacity || 40;
    const percent = capacity > 0 ? Math.round((projected / capacity) * 100) : 0;
    return { current, newHours, projected, capacity, percent };
  };

  const projected = getProjectedWorkload();

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.assignedTo) errs.assignedTo = 'Please select an assignee';
    if (!form.deadline) errs.deadline = 'Deadline is required';
    if (!form.estimatedHours || Number(form.estimatedHours) <= 0) errs.estimatedHours = 'Enter valid hours';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form, priority: Number(form.priority), estimatedHours: Number(form.estimatedHours) });
  };



  const employeeOptions = [
    { value: '', label: 'Select employee' },
    ...employees.map(e => ({ value: e.userId, label: `${e.firstName} ${e.lastName}` }))
  ];

  const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => ({
    value: Number(key),
    label
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Task Title</label>
          <input value={form.title} onChange={handleChange('title')} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="e.g. Implement user authentication" />
          {errors.title && <p className="text-xs text-danger-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={handleChange('description')} rows={3} className="input" placeholder="Describe the task details..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Assign To</label>
            <CustomSelect
              value={form.assignedTo}
              onChange={(val) => handleSelectChange('assignedTo', val)}
              options={employeeOptions}
              placeholder="Select employee"
              icon={User}
              className={errors.assignedTo ? 'ring-2 ring-danger-200 rounded-lg' : ''}
            />
            {errors.assignedTo && <p className="text-xs text-danger-500 mt-1">{errors.assignedTo}</p>}

            {/* Workload Preview */}
            {loadingWorkload && (
              <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-400 animate-pulse">Loading workload...</div>
            )}
            {assigneeWorkload && projected && !loadingWorkload && (
              <div className={`mt-2 p-3 rounded-lg border text-xs ${
                projected.percent > 100 ? 'bg-red-50 border-red-200' :
                projected.percent > 80 ? 'bg-amber-50 border-amber-200' :
                'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className={`w-3.5 h-3.5 ${projected.percent > 100 ? 'text-red-500' : projected.percent > 80 ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <span className="font-semibold text-slate-700">Workload Preview</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Current: {projected.current}h</span>
                  <span className="text-slate-500">+ {projected.newHours}h = <strong className="text-slate-700">{projected.projected}h</strong></span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${projected.percent > 100 ? 'bg-red-500' : projected.percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(projected.percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className={`font-bold ${projected.percent > 100 ? 'text-red-600' : projected.percent > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {projected.percent}% of {projected.capacity}h capacity
                  </span>
                </div>
                {projected.percent > 100 && (
                  <div className="flex items-center gap-1 mt-1.5 text-red-600 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Employee will exceed weekly capacity
                  </div>
                )}
                {projected.percent > 80 && projected.percent <= 100 && (
                  <div className="flex items-center gap-1 mt-1.5 text-amber-600 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Employee is nearing capacity
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Priority</label>
            <CustomSelect
              value={form.priority}
              onChange={(val) => handleSelectChange('priority', val)}
              options={priorityOptions}
              placeholder="Select priority"
              icon={Flag}
            />
          </div>
          <div>
            <label className="label">Deadline</label>
            <DateTimePicker value={form.deadline} onChange={(val) => { setForm(p => ({...p, deadline: val})); setErrors(p => ({...p, deadline: ''})); }} error={!!errors.deadline} placeholder="Select deadline" />
            {errors.deadline && <p className="text-xs text-danger-500 mt-1">{errors.deadline}</p>}
          </div>
          <div>
            <label className="label">Estimated Hours</label>
            <input type="number" step="0.5" min="0.5" value={form.estimatedHours} onChange={handleChange('estimatedHours')} className={`input ${errors.estimatedHours ? 'input-error' : ''}`} placeholder="e.g. 8" />
            {errors.estimatedHours && <p className="text-xs text-danger-500 mt-1">{errors.estimatedHours}</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskForm;
