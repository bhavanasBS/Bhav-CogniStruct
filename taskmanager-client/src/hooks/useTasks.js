import { useState, useCallback } from 'react';
import { taskApi } from '../api/taskApi';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });

  const fetchTasks = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const { data } = await taskApi.getAll(params);
      setTasks(data.items || data || []);
      if (data.totalCount !== undefined) {
        setPagination((prev) => ({ ...prev, totalCount: data.totalCount }));
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTaskById = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const { data } = await taskApi.getById(id);
      setTask(data);
      return data;
    } catch (error) {
      toast.error('Failed to load task');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const { data } = await taskApi.create(taskData);
      toast.success('Task created successfully');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
      throw error;
    }
  }, []);

  const updateTaskStatus = useCallback(async (id, status) => {
    try {
      await taskApi.updateStatus(id, status);
      toast.success('Task status updated');
      setTasks((prev) =>
        prev.map((t) => (t.taskId === id ? { ...t, status } : t))
      );
    } catch (error) {
      toast.error('Failed to update status');
    }
  }, []);

  return {
    tasks,
    task,
    isLoading,
    pagination,
    setPagination,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTaskStatus,
  };
};

export default useTasks;
