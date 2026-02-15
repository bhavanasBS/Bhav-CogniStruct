import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import CustomSelect from '../common/CustomSelect';
import { TASK_PRIORITY_LABELS } from '../../utils/constants';
import { User, Users2, Flag } from 'lucide-react';

const TaskForm = ({ isOpen, onClose, onSubmit, task = null, employees = [], teams = [], isLoading }) => {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo || '',
    teamId: task?.teamId || '',
    priority: task?.priority ?? 1,
    deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    estimatedHours: task?.estimatedHours || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSelectChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

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

  const employeeList = employees.length > 0 ? employees : [
    { userId: 3, firstName: 'James', lastName: 'Wilson' },
    { userId: 4, firstName: 'Emily', lastName: 'Davis' },
    { userId: 7, firstName: 'David', lastName: 'Martinez' },
  ];

  const teamList = teams.length > 0 ? teams : [
    { teamId: 1, teamName: 'Engineering' },
    { teamId: 2, teamName: 'Design' },
    { teamId: 3, teamName: 'QA & Testing' },
  ];

  // Convert to CustomSelect options format
  const employeeOptions = [
    { value: '', label: 'Select employee' },
    ...employeeList.map(e => ({ value: e.userId, label: `${e.firstName} ${e.lastName}` }))
  ];

  const teamOptions = [
    { value: '', label: 'Select team' },
    ...teamList.map(t => ({ value: t.teamId, label: t.teamName }))
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

        <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div>
            <label className="label">Team</label>
            <CustomSelect
              value={form.teamId}
              onChange={(val) => handleSelectChange('teamId', val)}
              options={teamOptions}
              placeholder="Select team"
              icon={Users2}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
            <input type="datetime-local" value={form.deadline} onChange={handleChange('deadline')} className={`input ${errors.deadline ? 'input-error' : ''}`} />
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
