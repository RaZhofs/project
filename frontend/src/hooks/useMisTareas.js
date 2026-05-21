import { useState, useEffect, useCallback } from 'react';
import { colaboradoresApi, tareasApi } from '../services/api';

export function useMisTareas(id_colaborador) {
  const [tareas,  setTareas]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchTareas = useCallback(async () => {
    if (!id_colaborador) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await colaboradoresApi.getTareas(id_colaborador);
      setTareas(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, [id_colaborador]);

  useEffect(() => { fetchTareas(); }, [fetchTareas]);

  const cambiarEstado = async (id_tarea, nuevoEstado) => {
    try {
      await tareasApi.update(id_tarea, { estado_tarea: nuevoEstado });
      // Actualiza localmente sin refetch completo
      setTareas(prev => prev.map(t =>
        t.id_tarea === id_tarea
          ? { ...t, estado_tarea: nuevoEstado,
              fecha_completado: nuevoEstado === 'Completada' ? new Date().toISOString() : null }
          : t
      ));
    } catch {
      setError('No se pudo actualizar el estado. Inténtalo de nuevo.');
    }
  };

  return { tareas, loading, error, refetch: fetchTareas, cambiarEstado };
}
