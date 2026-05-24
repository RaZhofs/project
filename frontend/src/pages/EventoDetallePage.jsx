import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar  from '../components/common/Navbar';
import Badge   from '../components/common/Badge';
import Button  from '../components/common/Button';
import Modal   from '../components/common/Modal';
import Input   from '../components/common/Input';
import Select  from '../components/common/Select';
import { SkeletonBlock } from '../components/common/Skeleton';
import { eventosApi, colaboradoresApi, tareasApi, bitacoraApi, presupuestoApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRIORIDADES   = ['Alta', 'Media', 'Baja'];
const ESTADOS_TAREA = ['Pendiente', 'En Proceso', 'Completada'];
const PERMISOS      = ['Lectura', 'Edición', 'Administración'];
const TIPOS_ENTRADA  = ['Nota', 'Avance', 'Alerta', 'Incidencia'];
const TIPOS_PRES     = ['Ingreso', 'Egreso'];
const ESTADOS_PRES   = ['Pendiente', 'Aprobado', 'Ejecutado'];
const CATEGORIAS_PRES = ['Infraestructura', 'Marketing', 'Personal', 'Catering', 'Tecnología', 'Logística', 'Otros'];

const TIPO_COLORS = {
  Nota:       'bg-slate-100 text-slate-600',
  Avance:     'bg-green-100 text-green-700',
  Alerta:     'bg-amber-100 text-amber-700',
  Incidencia: 'bg-red-100   text-red-700',
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(iso));
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
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
              className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <tr>
                {['Tarea', 'Responsable', 'Prioridad', 'Estado', 'Fecha límite', ''].map(h => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tareas.map(t => (
                <tr key={t.id_tarea} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40">
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

// ── Tab: Bitácora ──────────────────────────────────────────────────────────
function TabBitacora({ id_evento }) {
  const { sesion } = useAuth();
  const [entradas, setEntradas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [form, setForm] = useState({ contenido: '', tipo_entrada: 'Nota' });

  const fetchEntradas = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await bitacoraApi.getEntradas(id_evento);
      setEntradas(data.data);
    } catch (err) {
      console.error('Error al cargar bitácora:', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  }, [id_evento]);

  useEffect(() => { fetchEntradas(); }, [fetchEntradas]);

  const handlePublicar = async () => {
    if (!form.contenido.trim()) return;
    setSaving(true);
    setError('');
    try {
      await bitacoraApi.crearEntrada(id_evento, {
        contenido:    form.contenido.trim(),
        tipo_entrada: form.tipo_entrada,
        autor_nombre: sesion?.nombre  ?? 'Administrador',
        autor_rol:    sesion?.rol     ?? 'Administrador',
      });
      setForm({ contenido: '', tipo_entrada: 'Nota' });
      fetchEntradas();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al publicar la entrada.');
    } finally { setSaving(false); }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">

      {/* Formulario nueva entrada */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
        <p className="text-sm font-medium text-slate-700 mb-3">Nueva entrada</p>
        <div className="flex gap-2 mb-3">
          {TIPOS_ENTRADA.map(t => (
            <button
              key={t}
              onClick={() => setForm(p => ({ ...p, tipo_entrada: t }))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                form.tipo_entrada === t
                  ? TIPO_COLORS[t] + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          placeholder="Escribe una nota, avance o incidencia..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm text-slate-700 dark:text-slate-200
                     bg-white dark:bg-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
                     resize-none"
          value={form.contenido}
          onChange={e => setForm(p => ({ ...p, contenido: e.target.value }))}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        <div className="flex justify-end mt-2">
          <Button loading={saving} onClick={handlePublicar} disabled={!form.contenido.trim()}>
            Publicar
          </Button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : entradas.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">Sin entradas en la bitácora.</p>
          <p className="text-sm mt-1">Publica la primera nota del evento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entradas.map(e => (
            <div key={e.id_entrada}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLORS[e.tipo_entrada]}`}>
                  {e.tipo_entrada}
                </span>
                <span className="text-xs text-slate-400">
                  {e.autor_nombre} · {fmtDateTime(e.fecha_entrada)}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{e.contenido}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Presupuesto ───────────────────────────────────────────────────────
function fmtMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

const EMPTY_FORM = { descripcion: '', categoria: 'Otros', tipo: 'Egreso', monto_estimado: '', monto_real: '', estado: 'Pendiente' };

function TabPresupuesto({ id_evento }) {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');
  const [form,       setForm]       = useState(EMPTY_FORM);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await presupuestoApi.getItems(id_evento);
      setItems(data.data);
    } catch (err) {
      console.error('Error al cargar presupuesto:', err.response?.data?.message ?? err.message);
    } finally { setLoading(false); }
  }, [id_evento]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const abrirNuevo = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setModalOpen(true);
  };

  const abrirEditar = (item) => {
    setEditItem(item);
    setForm({
      descripcion:    item.descripcion,
      categoria:      item.categoria,
      tipo:           item.tipo,
      monto_estimado: String(item.monto_estimado),
      monto_real:     item.monto_real != null ? String(item.monto_real) : '',
      estado:         item.estado,
    });
    setSaveError('');
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.descripcion.trim()) { setSaveError('La descripción es obligatoria.'); return; }
    if (!form.monto_estimado)     { setSaveError('El monto estimado es obligatorio.'); return; }
    setSaving(true);
    setSaveError('');
    const payload = {
      descripcion:    form.descripcion.trim(),
      categoria:      form.categoria,
      tipo:           form.tipo,
      monto_estimado: Number(form.monto_estimado),
      monto_real:     form.monto_real !== '' ? Number(form.monto_real) : null,
      estado:         form.estado,
    };
    try {
      if (editItem) {
        await presupuestoApi.updateItem(id_evento, editItem.id_item, payload);
      } else {
        await presupuestoApi.crearItem(id_evento, payload);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      setSaveError(err.response?.data?.message ?? 'Error al guardar el ítem.');
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id_item) => {
    if (!window.confirm('¿Eliminar este ítem? Esta acción no se puede deshacer.')) return;
    try {
      await presupuestoApi.deleteItem(id_evento, id_item);
      fetchItems();
    } catch (err) {
      console.error('Error al eliminar:', err.response?.data?.message ?? err.message);
    }
  };

  // Cálculos del resumen
  const ingresos  = items.filter(i => i.tipo === 'Ingreso').reduce((s, i) => s + Number(i.monto_estimado), 0);
  const egresos   = items.filter(i => i.tipo === 'Egreso' ).reduce((s, i) => s + Number(i.monto_estimado), 0);
  const ejecutado = items.filter(i => i.monto_real != null).reduce((s, i) => s + Number(i.monto_real), 0);
  const balance   = ingresos - egresos;

  if (loading) return (
    <div className="flex flex-col gap-3 mt-4">
      {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="mt-4 flex flex-col gap-4">

      {/* Panel de resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ingresos est.',  value: fmtMoney(ingresos),  color: 'text-green-600' },
          { label: 'Egresos est.',   value: fmtMoney(egresos),   color: 'text-red-500'   },
          { label: 'Balance',        value: fmtMoney(balance),   color: balance >= 0 ? 'text-green-600' : 'text-red-500' },
          { label: 'Total ejecutado',value: fmtMoney(ejecutado), color: 'text-indigo-600' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm px-4 py-3 text-center">
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Cabecera tabla */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} ítem{items.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={abrirNuevo}>+ Nuevo ítem</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">Sin ítems presupuestarios.</p>
          <p className="text-sm mt-1">Agrega el primer ingreso o egreso.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <tr>
                {['Descripción', 'Categoría', 'Tipo', 'Est.', 'Real', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id_item} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">{item.descripcion}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.categoria}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.tipo === 'Ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>{item.tipo}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{fmtMoney(item.monto_estimado)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{fmtMoney(item.monto_real)}</td>
                  <td className="px-4 py-3">
                    <Badge label={item.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost"  size="sm" onClick={() => abrirEditar(item)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => handleEliminar(item.id_item)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear / editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar ítem' : 'Nuevo ítem presupuestario'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleGuardar}>{editItem ? 'Guardar cambios' : 'Agregar ítem'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {saveError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
          )}
          <Input id="descripcion" label="Descripción *" placeholder="Ej. Alquiler de sonido"
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select id="categoria" label="Categoría"
              options={CATEGORIAS_PRES.map(c => ({ value: c, label: c }))}
              value={form.categoria}
              onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} />
            <Select id="tipo" label="Tipo"
              options={TIPOS_PRES.map(t => ({ value: t, label: t }))}
              value={form.tipo}
              onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="monto_estimado" label="Monto estimado *" type="number" min="0" step="1000"
              placeholder="0"
              value={form.monto_estimado}
              onChange={e => setForm(p => ({ ...p, monto_estimado: e.target.value }))} />
            <Input id="monto_real" label="Monto real" type="number" min="0" step="1000"
              placeholder="— (opcional)"
              value={form.monto_real}
              onChange={e => setForm(p => ({ ...p, monto_real: e.target.value }))} />
          </div>
          <Select id="estado" label="Estado"
            options={ESTADOS_PRES.map(s => ({ value: s, label: s }))}
            value={form.estado}
            onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}

// ── Tab: Invitados ─────────────────────────────────────────────────────────
const RESTRICCION_COLORS = {
  Dieta:     'bg-amber-100 text-amber-700',
  Alergia:   'bg-red-100   text-red-700',
  Movilidad: 'bg-blue-100  text-blue-700',
};

const ESTADO_INVITADO_COLORS = {
  Confirmado: 'bg-green-100 text-green-700',
  Rechazado:  'bg-red-100   text-red-600',
  Invitado:   'bg-slate-100 text-slate-600',
  Ingresado:  'bg-indigo-100 text-indigo-700',
};

function TabInvitados({ id_evento, aforo_maximo }) {
  const [invitados,  setInvitados]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [sendingId,  setSendingId]  = useState(null); // id_rsvp en curso
  const [toast,      setToast]      = useState(null);  // { msg, ok }

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInvitados = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await eventosApi.getInvitados(id_evento);
      setInvitados(data.data);
    } catch (err) {
      console.error('Error al cargar invitados:', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  }, [id_evento]);

  const handleEliminarInvitado = async (id_rsvp, nombre) => {
    if (!window.confirm(`¿Eliminar la reserva de "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eventosApi.deleteInvitado(id_evento, id_rsvp);
      fetchInvitados();
    } catch (err) {
      console.error('Error al eliminar invitado:', err.response?.data?.message ?? err.message);
    }
  };

  const handleEnviarTicket = async (id_rsvp, correo) => {
    if (sendingId !== null) return;
    setSendingId(id_rsvp);
    try {
      await eventosApi.enviarTicket(id_evento, id_rsvp);
      showToast(`Ticket enviado correctamente a ${correo}`);
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Error al enviar el ticket.', false);
    } finally {
      setSendingId(null);
    }
  };

  useEffect(() => { fetchInvitados(); }, [fetchInvitados]);

  const confirmados = invitados.filter(i => i.estado_invitado === 'Confirmado').length;
  const rechazados  = invitados.filter(i => i.estado_invitado === 'Rechazado').length;
  const cuposLibres = aforo_maximo != null ? Math.max(0, aforo_maximo - confirmados) : null;

  if (loading) return (
    <div className="flex flex-col gap-3 mt-4">
      {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="mt-4 flex flex-col gap-4">

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-sm border
          ${toast.ok
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
          }`}
        >
          {toast.ok ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Cupos reservados',
            value: aforo_maximo != null ? `${confirmados} / ${aforo_maximo}` : `${confirmados}`,
            color: 'text-indigo-600',
          },
          { label: 'Cupos libres',  value: cuposLibres != null ? cuposLibres : '∞', color: cuposLibres === 0 ? 'text-red-500' : 'text-green-600' },
          { label: 'Confirmados',   value: confirmados,  color: 'text-green-600' },
          { label: 'Rechazados',    value: rechazados,   color: 'text-red-500'   },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{invitados.length} registro{invitados.length !== 1 ? 's' : ''}</p>
        <button
          onClick={fetchInvitados}
          className="text-xs text-indigo-600 hover:underline"
        >
          Actualizar
        </button>
      </div>

      {invitados.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">Sin inscripciones aún.</p>
          <p className="text-sm mt-1">Los registros del formulario público aparecerán aquí.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <tr>
                {['Nombre', 'Correo', 'Teléfono', 'Estado', 'Alertas', 'Registro', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invitados.map(inv => (
                <tr key={inv.id_rsvp} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                    {inv.nombre_invitado}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                    {inv.correo}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {inv.telefono ?? <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      ESTADO_INVITADO_COLORS[inv.estado_invitado] ?? 'bg-slate-100 text-slate-600'
                    }`}>
                      {inv.estado_invitado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {inv.restricciones?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {inv.restricciones.map((r, i) => (
                          <span
                            key={i}
                            title={r.descripcion ?? r.tipo}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              RESTRICCION_COLORS[r.tipo] ?? 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.tipo}{r.descripcion ? `: ${r.descripcion}` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs italic">Sin alertas</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                    {fmtDate(inv.fecha_registro)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Enviar ticket */}
                      <button
                        onClick={() => handleEnviarTicket(inv.id_rsvp, inv.correo)}
                        disabled={sendingId !== null}
                        title={`Enviar ticket QR a ${inv.correo}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50
                                   dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30
                                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {sendingId === inv.id_rsvp ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => handleEliminarInvitado(inv.id_rsvp, inv.nombre_invitado)}
                        title="Eliminar reserva"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50
                                   dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-6 0h6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────
const TABS = ['Equipo', 'Tareas', 'Bitácora', 'Presupuesto', 'Invitados'];

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Migas de pan */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-6">
          <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Eventos</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[300px]">
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{evento.nombre_evento}</h1>
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
        <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm mb-4 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Contenido del tab */}
        {!loading && evento && (
          tab === 'Equipo'      ? <TabEquipo      id_evento={id} /> :
          tab === 'Tareas'      ? <TabTareas      id_evento={id} /> :
          tab === 'Bitácora'    ? <TabBitacora    id_evento={id} /> :
          tab === 'Presupuesto' ? <TabPresupuesto id_evento={id} /> :
                                  <TabInvitados   id_evento={id} aforo_maximo={evento.aforo_maximo} />
        )}
      </main>
    </div>
  );
}
