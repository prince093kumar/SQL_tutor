import { useState, useCallback } from 'react';
import api from '../utils/api';

export type SavedQuery = {
  id: number;
  title: string;
  query: string;
  collection: string;
  notes: string;
  created_at: string;
  updated_at: string;
  challenge_id?: number;
};

export function useSavedQueries() {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/saved-queries');
      setQueries(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveQuery = async (payload: { title: string; query: string; collection?: string; notes?: string; challengeId?: number }) => {
    setIsLoading(true);
    try {
      const res = await api.post('/saved-queries', payload);
      await fetchQueries();
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuery = async (id: number, payload: { title: string; query: string; collection?: string; notes?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.put(`/saved-queries/${id}`, payload);
      await fetchQueries();
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuery = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete(`/saved-queries/${id}`);
      await fetchQueries();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { queries, isLoading, error, fetchQueries, saveQuery, updateQuery, deleteQuery };
}
