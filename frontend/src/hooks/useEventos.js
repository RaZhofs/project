import { useState, useEffect, useCallback } from 'react';
import { eventosApi } from '../services/api';

export function useEventos() {
  const [eventos,  setEventos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await eventosApi.getAll();
      setEventos(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  return { eventos, loading, error, refetch: fetchEventos };
}
