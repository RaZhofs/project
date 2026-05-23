import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar       from '../components/common/Navbar';
import Button       from '../components/common/Button';
import Modal        from '../components/common/Modal';
import EventoTable  from '../components/eventos/EventoTable';
import EventoCard   from '../components/eventos/EventoCard';
import { useEventos } from '../hooks/useEventos';
import { eventosApi } from '../services/api';

// Íconos para el toggle de vista
function IconTable() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 10h18M3 6h18M3 14h18M3 18h18" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

export default function DashboardPage() {
  const { eventos, loading, error, refetch } = useEventos();
  const [vista,    setVista]    = useState('tabla');   // 'tabla' | 'cards'
  const [toDelete, setToDelete] = useState(null);      // evento pendiente de borrado
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await eventosApi.remove(toDelete.id_evento);
      setToDelete(null);
      refetch();
    } catch {
      alert('No se pudo eliminar el evento. Inténtalo de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Encabezado de sección ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Eventos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {!loading && `${eventos.length} evento${eventos.length !== 1 ? 's' : ''} registrado${eventos.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle tabla / cards */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setVista('tabla')}
                title="Vista tabla"
                className={`p-2 rounded-md transition-colors ${
                  vista === 'tabla'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <IconTable />
              </button>
              <button
                onClick={() => setVista('cards')}
                title="Vista tarjetas"
                className={`p-2 rounded-md transition-colors ${
                  vista === 'cards'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <IconGrid />
              </button>
            </div>

            {/* Acción principal */}
            <Link to="/eventos/nuevo">
              <Button size="md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo evento
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Banner de error ── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700
                          text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd" />
            </svg>
            <span>{error}</span>
            <button
              onClick={refetch}
              className="ml-auto text-red-600 underline hover:no-underline text-xs"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Contenido principal ── */}
        {vista === 'tabla' ? (
          <EventoTable
            eventos={eventos}
            loading={loading}
            onDelete={setToDelete}
          />
        ) : (
          <EventoCard
            eventos={eventos}
            loading={loading}
            onDelete={setToDelete}
          />
        )}
      </main>

      {/* ── Modal de confirmación de borrado ── */}
      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar evento"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDeleteConfirm}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Estás seguro de que deseas eliminar el evento{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            "{toDelete?.nombre_evento}"
          </span>
          ? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
