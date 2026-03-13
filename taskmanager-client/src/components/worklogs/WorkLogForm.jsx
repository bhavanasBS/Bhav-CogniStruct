import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import CustomSelect from '../common/CustomSelect';
import DateTimePicker from '../common/DateTimePicker';
import { ClipboardList } from 'lucide-react';

const WorkLogForm = ({ isOpen, onClose, onSubmit, tasks = [], isLoading }) => {
  const [form, setForm] = useState({
    taskId: '',
    startTime: '',
    endTime: '',
    description: '',
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
    if (!form.taskId) errs.taskId = 'Select a task';
    if (!form.startTime) errs.startTime = 'Required';
    if (!form.endTime) errs.endTime = 'Required';
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime)) {
      errs.endTime = 'End time must be after start time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    const totalHours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
    onSubmit({ ...form, totalHours: Number(totalHours) });
  };

  const taskList = tasks.length > 0 ? tasks : [
    { taskId: 1, title: 'Implement user authentication module' },
    { taskId: 5, title: 'Database migration scripts' },
    { taskId: 8, title: 'Implement workload balancing' },
  ];

  // Convert to CustomSelect options format
  const taskOptions = [
    { value: '', label: 'Select a task' },
    ...taskList.map(t => ({ value: t.taskId, label: t.title }))
  ];

  const calcHours = () => {
    if (form.startTime && form.endTime) {
      const diff = (new Date(form.endTime) - new Date(form.startTime)) / (1000 * 60 * 60);
      return diff > 0 ? `${diff.toFixed(1)}h` : '';
    }
    return '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Work Hours"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>Log Time</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Task</label>
          <CustomSelect
            value={form.taskId}
            onChange={(val) => handleSelectChange('taskId', val)}
            options={taskOptions}
            placeholder="Select a task"
            icon={ClipboardList}
            className={errors.taskId ? 'ring-2 ring-danger-200 rounded-lg' : ''}
          />
          {errors.taskId && <p className="text-xs text-danger-500 mt-1">{errors.taskId}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Start Time</label>
            <DateTimePicker value={form.startTime} onChange={(val) => { setForm(p => ({...p, startTime: val})); setErrors(p => ({...p, startTime: ''})); }} error={!!errors.startTime} placeholder="Select start time" />
            {errors.startTime && <p className="text-xs text-danger-500 mt-1">{errors.startTime}</p>}
          </div>
          <div>
            <label className="label">End Time</label>
            <DateTimePicker value={form.endTime} onChange={(val) => { setForm(p => ({...p, endTime: val})); setErrors(p => ({...p, endTime: ''})); }} error={!!errors.endTime} placeholder="Select end time" />
            {errors.endTime && <p className="text-xs text-danger-500 mt-1">{errors.endTime}</p>}
          </div>
        </div>

        {calcHours() && (
          <div className="p-3 rounded-lg bg-primary-50 text-primary-700 text-sm font-medium text-center">
            Total Duration: {calcHours()}
          </div>
        )}

        <div>
          <label className="label">Description (optional)</label>
          <textarea value={form.description} onChange={handleChange('description')} rows={3} className="input" placeholder="What did you work on?" />
        </div>
      </div>
    </Modal>
  );
};

export default WorkLogForm;
