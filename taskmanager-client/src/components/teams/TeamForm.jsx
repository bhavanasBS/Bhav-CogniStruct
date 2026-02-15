import { useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import CustomSelect from '../common/CustomSelect';
import { UserCheck } from 'lucide-react';

const TeamForm = ({ isOpen, onClose, onSubmit, team = null, managers = [], isLoading }) => {
  const isEdit = !!team;
  const [form, setForm] = useState({
    teamName: team?.teamName || '',
    description: team?.description || '',
    managerId: team?.managerId || '',
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
    if (!form.teamName.trim()) errs.teamName = 'Team name is required';
    if (!form.managerId) errs.managerId = 'Please select a manager';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  const managerList = managers.length > 0 ? managers : [
    { userId: 2, firstName: 'Sarah', lastName: 'Johnson' },
    { userId: 8, firstName: 'Rachel', lastName: 'Taylor' },
  ];

  // Convert to CustomSelect options format
  const managerOptions = [
    { value: '', label: 'Select a manager' },
    ...managerList.map(m => ({ value: m.userId, label: `${m.firstName} ${m.lastName}` }))
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Team' : 'Create New Team'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Team'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Team Name</label>
          <input value={form.teamName} onChange={handleChange('teamName')} className={`input ${errors.teamName ? 'input-error' : ''}`} placeholder="e.g. Engineering Team" />
          {errors.teamName && <p className="text-xs text-danger-500 mt-1">{errors.teamName}</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={handleChange('description')} rows={3} className="input" placeholder="Brief description of the team..." />
        </div>
        <div>
          <label className="label">Team Manager</label>
          <CustomSelect
            value={form.managerId}
            onChange={(val) => handleSelectChange('managerId', val)}
            options={managerOptions}
            placeholder="Select a manager"
            icon={UserCheck}
            className={errors.managerId ? 'ring-2 ring-danger-200 rounded-lg' : ''}
          />
          {errors.managerId && <p className="text-xs text-danger-500 mt-1">{errors.managerId}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default TeamForm;
