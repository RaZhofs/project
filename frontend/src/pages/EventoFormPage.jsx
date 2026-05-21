import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar      from '../components/common/Navbar';
import EventoForm  from '../components/eventos/EventoForm';
import { eventosApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventoFormPage() {
  const { id }      = useParams();               // undefined → crear, number → editar
  const isEditing   = Boolean(id);
  const navigate    = useNavigate();
  const { admin }   = useAuth();

  const [initialData, setInitialData] = useState(null);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [loadFail,    setLoadFail]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [apiError,    setApiError]    = useState('');

  // En modo edición: precarga el evento existente
  useEffect(() => {
    if (!isEditing) return;
    eventosApi.getById(id)
      .then(({ data }) => setInitialData(data.data))
      .catch(() => setLoadFail(true))
      .finally(() => setLoadingData(false));
  }, [id, isEditing]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setApiError('');
    const payload = {
      ...formData,
      id_administrador: admin?.id_administrador ?? 1,
      creado_by:        admin?.id_administrador ?? 1,
    };
    try {
      if (isEditing) {
        await eventosApi.update(id, payload);
      } else {
        await eventosApi.create(payload);
      }
      navigate('/');
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        'Ocurrió un error al guardar el evento. Inténtalo de nuevo.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Migas de pan ── */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Eventos</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">
            {isEditing ? 'Editar evento' : 'Nuevo evento'}
          </span>
        </nav>

        {/* ── Título ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditing ? 'Editar evento' : 'Crear nuevo evento'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditing
              ? 'Modifica los datos del evento y guarda los cambios.'
              : 'Completa los campos para registrar un nuevo evento en Convexa.'}
          </p>
        </div>

        {/* ── Estado: cargando datos del evento a editar ── */}
        {loadingData && (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cargando datos del evento...
          </div>
        )}

        {/* ── Estado: error al cargar ── */}
        {loadFail && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <p className="text-base font-medium text-red-600">
              No se pudo cargar el evento.
            </p>
            <Link to="/" className="text-indigo-600 underline text-sm">
              Volver al dashboard
            </Link>
          </div>
        )}

        {/* ── Formulario ── */}
        {!loadingData && !loadFail && (
          <>
            {/* Error de API al guardar */}
            {apiError && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200
                              text-red-700 rounded-xl px-4 py-3 text-sm">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
            )}

            <EventoForm
              initialData={initialData}
              onSubmit={handleSubmit}
              loading={saving}
            />
          </>
        )}
      </main>
    </div>
  );
}
