import { useState, useCallback } from 'react';
import { teamApi } from '../api/teamApi';
import toast from 'react-hot-toast';

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeams = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const { data } = await teamApi.getAll(params);
      setTeams(data.items || data || []);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTeamById = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const { data } = await teamApi.getById(id);
      setTeam(data);
      return data;
    } catch (error) {
      toast.error('Failed to load team');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHierarchy = useCallback(async (managerId) => {
    setIsLoading(true);
    try {
      const { data } = await teamApi.getHierarchy(managerId);
      setHierarchy(data);
      return data;
    } catch (error) {
      toast.error('Failed to load hierarchy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (teamData) => {
    try {
      const { data } = await teamApi.create(teamData);
      toast.success('Team created successfully');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
      throw error;
    }
  }, []);

  return {
    teams,
    team,
    hierarchy,
    isLoading,
    fetchTeams,
    fetchTeamById,
    fetchHierarchy,
    createTeam,
  };
};

export default useTeams;
