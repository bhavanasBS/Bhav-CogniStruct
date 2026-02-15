import { useState, useCallback } from 'react';
import { workloadApi } from '../api/workloadApi';
import toast from 'react-hot-toast';

export const useWorkload = () => {
  const [workload, setWorkload] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeamWorkload = useCallback(async (teamId) => {
    setIsLoading(true);
    try {
      const { data } = await workloadApi.getByTeam(teamId);
      setWorkload(data);
      return data;
    } catch (error) {
      toast.error('Failed to load workload data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecommendation = useCallback(async (teamId, hours) => {
    setIsLoading(true);
    try {
      const { data } = await workloadApi.getRecommendation(teamId, hours);
      setRecommendation(data);
      return data;
    } catch (error) {
      toast.error('Failed to get recommendation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    workload,
    recommendation,
    isLoading,
    fetchTeamWorkload,
    fetchRecommendation,
  };
};

export default useWorkload;
