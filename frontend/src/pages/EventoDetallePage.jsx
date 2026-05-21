import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar  from '../components/common/Navbar';
import Badge   from '../components/common/Badge';
import Button  from '../components/common/Button';
import Modal   from '../components/common/Modal';
import Input   from '../components/common/Input';
import Select  from '../components/common/Select';
import { SkeletonBlock } from '../components/common/Skeleton';
import { eventosApi, colaboradoresApi, tareasApi } from '../services/api';

const PRIORIDADES   = ['Alta', 'Media', 'Baja'];
const ESTADOS_TAREA = ['Pendiente', 'En Proceso', 'Completada'];
const PERMISOS      = ['Lectura', 'Edición', 'Administración'];

function fmtDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(iso));
}

function toLocalInput(iso) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

// ── Tab: Equipo ────────────────────────────────────────────────────────────
function TabEquipo({ id_evento }) {
  const [equipo,    setEquipo]    = useState([]);
  const [todos,     setTodos]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [form,       setForm]       = useState({ id_colaborador: '', permiso_nivel: 'Lectura' });
  const [saving,     setSaving]     = useState(false);
  const [asignError, setAsignError] = useState('');

  const fetchEquipo = useCallback(async () => {
    setLoading(true);
    try {
      const [eqRes, todosRes] = await Promise.all([
        eventosApi.getEquipo(id_evento),
        colaboradoresApi.getAll(),
      ]);
      setEquipo(eqRes.data.data);
      setTodos(todosRes.data.data);
    } catch (err) {
      console.error('Error al cargar equipo:', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  }, [id_evento]);

  useEffect(() => { fetchEquipo(); }, [fetchEquipo]);

  const asignados = new Set(equipo.map(e => e.id_colaborador));
  const disponibles = todos
    .filter(c => !asignados.has(c.id_colaborador))
    .map(c => ({ value: String(c.id_colaborador), label: c.nombre_completo }));

  const handleAsignar = async () => {
    if (!form.id_colaborador) return;
    setSaving(true);
    setAsignError('');
    try {
      await eventosApi.asignarColaborador(id_evento, {
        id_colaborador: Number(form.id_colaborador),
        permiso_nivel:  form.permiso_nivel,
      });
      setModalOpen(false);
      setForm({ id_colaborador: '', permiso_nivel: 'Lectura' });
      fetchEquipo();
    } catch (err) {
      setAsignError(err.response?.data?.message ?? 'Error al asignar colaborador.');
    } finally { setSaving(false); }
  };

  const handleQuitar = async (id_colab) => {
    await eventosApi.quitarColaborador(id_evento, id_colab);
    fetchEquipo();
  };

  if (loading) return (
    <div className="flex flex-col gap-3 mt-4">
      {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">
          {equipo.length} colaborador{equipo.length !== 1 ? 'es' : ''} asignado{equipo.length !== 1 ? 's' : ''}
        </p>
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" onClick={() => { setAsignError(''); setModalOpen(true); }} disabled={disponibles.length === 0}>
            + Asignar colaborador
          </Button>
          {disponibles.length === 0 && todos.length === 0 && (
            <p className="text-xs text-amber-500">No hay colaboradores en el sistema.</p>
          )}
          {disponibles.length === 0 && todos.length > 0 && (
            <p className="text-xs text-slate-400">Todos los colaboradores ya están asignados.</p>
          )}
        </div>
      </div>

      {equipo.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">Sin colaboradores asignados.</p>
          <p className="text-sm mt-1">Asigna el primer miembro del equipo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {equipo.map(e => (
            <div key={e.id_colaborador}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {e.COLABORADORES?.nombre_completo ?? `Colaborador #${e.id_colaborador}`}
                </p>
                <p className="text-xs text-slate-400">
                  {e.COLABORADORES?.correo_empresa} · Asignado el {fmtDate(e.fecha_asignacion)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge label={e.permiso_nivel} />
                <Button variant="danger" size="sm" onClick={() => handleQuitar(e.id_colaborador)}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setAsignError(''); }}
        title="Asignar colaborador al evento"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setAsignError(''); }}>Cancelar</Button>
            <Button loading={saving} onClick={handleAsignar}>Asignar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {asignError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{asignError}</p>
          )}
          <Select
            id="id_colaborador" label="Colaborador *"
            placeholder="— Selecciona un colaborador —"
            options={disponibles}
            value={form.id_colaborador}
            onChange={e => setForm(p => ({ ...p, id_colaborador: e.target.value }))}
          />
          <Select
            id="permiso_nivel" label="Nivel de permiso"
            options={PERMISOS.map(p => ({ value: p, label: p }))}
            value={form.permiso_nivel}
            onChange={e => setForm(p => ({ ...p, permiso_nivel: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}

// ── Tab: Tareas ────────────────────────────────────────────────────────────
function TabTareas({ id_evento }) {
  const [tareas,        setTareas]        = useState([]);
  const [equipo,        setEquipo]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [errors,        setErrors]        = useState({});
  const [saveError,     setSaveError]     = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving,    setEditSaving]    = useState(false);
  const [editError,     setEditError]     = useState('');
  const [editForm,      setEditForm]      = useState({ id_tarea: null, id_responsable: '', estado_tarea: '' });
  const [form, setForm] = useState({
    titulo: '', descripcion: '', id_responsable: '',
    prioridad: 'Media', estado_tarea: 'Pendiente', fecha_limite: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tareasRes, equipoRes] = await Promise.all([
        eventosApi.getTareas(id_evento),
        eventosApi.getEquipo(id_evento),
      ]);
      setTareas(tareasRes.data.data);
      setEquipo(equipoRes.data.data);
    } catch (err) {
      console.error('Error al cargar tareas:', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  }, [id_evento]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const colaboradoresOpts = equipo.map(e => ({
    value: String(e.id_colaborador),
    label: e.COLABORADORES?.nombre_completo ?? `#${e.id_colaborador}`,
  }));

  const validate = () => {
    const err = {};
    if (!form.titulo.trim())  err.titulo       = 'El título es obligatorio.';
    if (!form.fecha_limite)   err.fecha_limite  = 'La fecha límite es obligatoria.';
    return err;
  };

  const handleCrear = async () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setSaving(true);
    setSaveError('');
    try {
      await eventosApi.crearTarea(id_evento, {
        ...form,
        id_responsable: form.id_responsable ? Number(form.id_responsable) : null,
      });
      setModalOpen(false);
      setForm({ titulo: '', descripcion: '', id_responsable: '', prioridad: 'Media', estado_tarea: 'Pendiente', fecha_limite: '' });
      setErrors({});
      fetchData();
    } catch (err) {
      setSaveError(err.response?.data?.message ?? 'Error al crear la tarea. Revisa la consola del backend.');
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id_tarea) => {
    if (!window.confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')) return;
    try {
      await tareasApi.remove(id_tarea);
      fetchData();
    } catch (err) {
      console.error('Error al eliminar tarea:', err.response?.data?.message ?? err.message);
    }
  };

  const abrirEditar = (t) => {
    setEditForm({
      id_tarea:       t.id_tarea,
      id_responsable: t.id_responsable ? String(t.id_responsable) : '',
      estado_tarea:   t.estado_tarea,
    });
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditar = async () => {
    setEditSaving(true);
    setEditError('');
    try {
      await tareasApi.update(editForm.id_tarea, {
        id_responsable: editForm.id_responsable ? Number(editForm.id_responsable) : null,
        estado_tarea:   editForm.estado_tarea,
      });
      setEditModalOpen(false);
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.message ?? 'Error al actualizar la tarea.');
    } finally { setEditSaving(false); }
  };

  if (loading) return (
    <div className="flex flex-col gap-3 mt-4">
      {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-16 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{tareas.length} tarea{tareas.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setModalOpen(true)}>+ Nueva tarea</Button>
      </div>

      {tareas.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">Sin tareas registradas.</p>
          <p className="text-sm mt-1">Crea la primera tarea para este evento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                {['Tarea', 'Responsable', 'Prioridad', 'Estado', 'Fecha límite', ''].map(h => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tareas.map(t => (
                <tr key={t.id_tarea} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">
                    <p>{t.titulo}</p>
                    {t.descripcion && <p className="text-xs text-slate-400 truncate">{t.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {t.Responsable?.nombre_completo ?? <span className="italic text-slate-300">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3"><Badge label={t.prioridad} /></td>
                  <td className="px-4 py-3"><Badge label={t.estado_tarea} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{fmtDate(t.fecha_limite)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => abrirEditar(t)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => handleEliminar(t.id_tarea)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal editar tarea */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar tarea"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button loading={editSaving} onClick={handleEditar}>Guardar cambios</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {editError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{editError}</p>
          )}
          <Select
            id="edit_responsable" label="Responsable"
            placeholder="— Sin asignar —"
            options={colaboradoresOpts}
            value={editForm.id_responsable}
            onChange={e => setEditForm(p => ({ ...p, id_responsable: e.target.value }))}
          />
          <Select
            id="edit_estado" label="Estado"
            options={ESTADOS_TAREA.map(s => ({ value: s, label: s }))}
            value={editForm.estado_tarea}
            onChange={e => setEditForm(p => ({ ...p, estado_tarea: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Modal nueva tarea */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setErrors({}); setSaveError(''); }}
        title="Nueva tarea"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setErrors({}); setSaveError(''); }}>Cancelar</Button>
            <Button loading={saving} onClick={handleCrear}>Crear tarea</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {saveError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
          )}
          <Input id="titulo" label="Título *" placeholder="Ej. Montar el escenario principal"
            value={form.titulo} error={errors.titulo}
            onChange={e => { setForm(p => ({ ...p, titulo: e.target.value })); setErrors(p => ({ ...p, titulo: '' })); }} />
          <Input id="descripcion" label="Descripción" placeholder="Detalle opcional..."
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select id="id_responsable" label="Responsable"
              placeholder="— Sin asignar —"
              options={colaboradoresOpts}
              value={form.id_responsable}
              onChange={e => setForm(p => ({ ...p, id_responsable: e.target.value }))} />
            <Select id="prioridad" label="Prioridad"
              options={PRIORIDADES.map(p => ({ value: p, label: p }))}
              value={form.prioridad}
              onChange={e => setForm(p => ({ ...p, prioridad: e.target.value }))} />
          </div>
          <Input id="fecha_limite" label="Fecha límite *" type="datetime-local"
            value={form.fecha_limite} error={errors.fecha_limite}
            onChange={e => { setForm(p => ({ ...p, fecha_limite: e.target.value })); setErrors(p => ({ ...p, fecha_limite: '' })); }} />
        </div>
      </Modal>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────
const TABS = ['Equipo', 'Tareas'];

export default function EventoDetallePage() {
  const { id } = useParams();
  const [evento,  setEvento]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('Equipo');

  useEffect(() => {
    eventosApi.getById(id)
      .then(({ data }) => setEvento(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Migas de pan */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Eventos</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium truncate max-w-[300px]">
            {loading ? '...' : evento?.nombre_evento}
          </span>
        </nav>

        {/* Header del evento */}
        {loading ? (
          <div className="flex flex-col gap-3 mb-6">
            <SkeletonBlock className="h-8 w-2/3" />
            <SkeletonBlock className="h-4 w-1/3" />
          </div>
        ) : evento && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl font-bold text-slate-800">{evento.nombre_evento}</h1>
                  <Badge label={evento.estado_evento} />
                  <Badge label={evento.modalidad_evento} />
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                  <span>Tipo: <strong>{evento.TIPOS_EVENTO?.nombre ?? '—'}</strong></span>
                  <span>Inicio: <strong>{fmtDate(evento.fecha_inicio)}</strong></span>
                  <span>Término: <strong>{fmtDate(evento.fecha_termino)}</strong></span>
                  <span>Aforo: <strong>{evento.aforo_maximo}</strong></span>
                  {evento.ubicacion_texto && <span>📍 {evento.ubicacion_texto}</span>}
                </div>
              </div>
              <Link to={`/eventos/${id}/editar`}>
                <Button variant="secondary" size="sm">Editar evento</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mb-4 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Contenido del tab */}
        {!loading && evento && (
          tab === 'Equipo'
            ? <TabEquipo id_evento={id} />
            : <TabTareas id_evento={id} />
        )}
      </main>
    </div>
  );
}
