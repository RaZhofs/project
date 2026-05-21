import { useState, useEffect } from 'react';
import Input  from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { tiposEventoApi } from '../../services/api';

const ESTADOS = ['Planificación', 'Montaje', 'Ejecución', 'Finalizado', 'Cancelado'];
const MODALIDADES = ['Desde cero', 'Express'];

const INITIAL = {
  nombre_evento:    '',
  id_tipo:          '',
  modalidad_evento: 'Desde cero',
  fecha_inicio:     '',
  fecha_termino:    '',
  aforo_maximo:     '',
  estado_evento:    'Planificación',
  ubicacion_texto:  '',
};

function validate(form) {
  const errors = {};
  const nombre = form.nombre_evento?.trim();
  if (!nombre)            errors.nombre_evento = 'El nombre del evento es obligatorio.';
  else if (nombre.length < 3) errors.nombre_evento = 'El nombre debe tener al menos 3 caracteres.';

  if (!form.id_tipo)      errors.id_tipo = 'Selecciona un tipo de evento.';

  if (!form.fecha_inicio) errors.fecha_inicio = 'La fecha de inicio es obligatoria.';
  if (!form.fecha_termino) errors.fecha_termino = 'La fecha de término es obligatoria.';
  if (form.fecha_inicio && form.fecha_termino && form.fecha_termino <= form.fecha_inicio) {
    errors.fecha_termino = 'La fecha de término debe ser posterior a la de inicio.';
  }

  const aforo = Number(form.aforo_maximo);
  if (!form.aforo_maximo && form.aforo_maximo !== 0) {
    errors.aforo_maximo = 'El aforo es obligatorio.';
  } else if (!Number.isInteger(aforo) || aforo <= 0) {
    errors.aforo_maximo = 'El aforo debe ser un número entero mayor a 0.';
  }

  return errors;
}

// Formatea DATETIME de la BD a valor compatible con <input type="datetime-local">
function toLocalInput(iso) {
  if (!iso) return '';
  return iso.slice(0, 16); // "2026-05-20T10:00"
}

export default function EventoForm({ initialData = null, onSubmit, loading }) {
  const [form,   setForm]   = useState(initialData
    ? { ...INITIAL, ...initialData,
        fecha_inicio:  toLocalInput(initialData.fecha_inicio),
        fecha_termino: toLocalInput(initialData.fecha_termino),
        id_tipo:       String(initialData.id_tipo ?? ''),
      }
    : INITIAL
  );
  const [errors,  setErrors]  = useState({});
  const [tipos,   setTipos]   = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  useEffect(() => {
    tiposEventoApi.getAll()
      .then(({ data }) => setTipos(
        data.data.map(t => ({ value: String(t.id_tipo), label: t.nombre }))
      ))
      .catch(() => setTipos([]))
      .finally(() => setLoadingTipos(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      // Scroll al primer campo con error
      const first = document.querySelector('[data-error="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit({
      ...form,
      id_tipo:      Number(form.id_tipo),
      aforo_maximo: Number(form.aforo_maximo),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* ── Información principal ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Información del evento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="nombre_evento"
            name="nombre_evento"
            label="Nombre del evento *"
            placeholder="Ej. Congreso de Innovación 2026"
            value={form.nombre_evento}
            onChange={handleChange}
            error={errors.nombre_evento}
            data-error={!!errors.nombre_evento}
            className="md:col-span-2"
          />
          <Select
            id="id_tipo"
            name="id_tipo"
            label="Tipo de evento *"
            placeholder={loadingTipos ? 'Cargando tipos...' : '— Selecciona un tipo —'}
            options={tipos}
            value={form.id_tipo}
            onChange={handleChange}
            error={errors.id_tipo}
            data-error={!!errors.id_tipo}
            disabled={loadingTipos}
          />
          <Select
            id="modalidad_evento"
            name="modalidad_evento"
            label="Modalidad"
            options={MODALIDADES.map(m => ({ value: m, label: m }))}
            value={form.modalidad_evento}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* ── Fechas y capacidad ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Fechas y capacidad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="fecha_inicio"
            name="fecha_inicio"
            label="Fecha de inicio *"
            type="datetime-local"
            value={form.fecha_inicio}
            onChange={handleChange}
            error={errors.fecha_inicio}
            data-error={!!errors.fecha_inicio}
          />
          <Input
            id="fecha_termino"
            name="fecha_termino"
            label="Fecha de término *"
            type="datetime-local"
            value={form.fecha_termino}
            onChange={handleChange}
            error={errors.fecha_termino}
            data-error={!!errors.fecha_termino}
            hint="Debe ser posterior a la fecha de inicio."
          />
          <Input
            id="aforo_maximo"
            name="aforo_maximo"
            label="Aforo máximo *"
            type="number"
            min="1"
            placeholder="Ej. 200"
            value={form.aforo_maximo}
            onChange={handleChange}
            error={errors.aforo_maximo}
            data-error={!!errors.aforo_maximo}
          />
          <Select
            id="estado_evento"
            name="estado_evento"
            label="Estado del evento"
            options={ESTADOS.map(s => ({ value: s, label: s }))}
            value={form.estado_evento}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* ── Ubicación ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Ubicación
        </h2>
        <Input
          id="ubicacion_texto"
          name="ubicacion_texto"
          label="Dirección / lugar"
          placeholder="Ej. Auditorio Central, Edificio A, Piso 3"
          value={form.ubicacion_texto}
          onChange={handleChange}
        />
      </section>

      {/* ── Acciones ── */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {loading
            ? 'Guardando...'
            : initialData ? 'Guardar cambios' : 'Crear evento'
          }
        </Button>
      </div>
    </form>
  );
}
