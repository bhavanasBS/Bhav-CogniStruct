import Badge from '../common/Badge';
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../utils/constants';

const TaskStatusBadge = ({ status }) => {
  const config = TASK_STATUS_COLORS[status] || TASK_STATUS_COLORS[0];
  const label = TASK_STATUS_LABELS[status] || 'Unknown';
  const variantMap = { 0: 'default', 1: 'primary', 2: 'success', 3: 'danger' };

  return (
    <Badge variant={variantMap[status] || 'default'} dot>
      {label}
    </Badge>
  );
};

export default TaskStatusBadge;
