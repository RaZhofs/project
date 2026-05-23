import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventosApi, rsvpApi } from '../services/api';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));
}

const DIETAS = ['Sin restricción', 'Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa', 'Halal', 'Kosher'];
const ALERGIAS_COMUNES = ['Nueces', 'Mariscos', 'Huevo', 'Leche', 'Soja', 'Trigo', 'Pescado'];

// ── Estado inicial del formulario ────────────────────────────────────────────
const FORM_INIT = {
  nombre_invitado: '',
  correo:          '',
  telefono:        '',
  codigo_acceso:   '',
  estado_invitado: 'Confirmado',
  dieta:           'Sin restricción',
  alergia:         '',
  movilidad:       false,
};

// ── Pantalla de cupos agotados ───────────────────────────────────────────────
function PantallaAgotado({ nombreEvento }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Cupos Agotados</h2>
        <p className="text-slate-500 text-sm mb-6">
          Lamentablemente no quedan cupos disponibles para <strong>{nombreEvento}</strong>.
        </p>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">Ver otros eventos</Link>
      </div>
    </div>
  );
}

// ── Formulario RSVP ──────────────────────────────────────────────────────────
export default function RsvpFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [evento,      setEvento]      = useState(null);
  const [loadEvento,  setLoadEvento]  = useState(true);
  const [eventoError, setEventoError] = useState('');

  const [form,      setForm]      = useState(FORM_INIT);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');
  const [agotado,   setAgotado]   = useState(false);

  useEffect(() => {
    eventosApi.getById(id)
      .then(({ data }) => {
        const ev          = data.data;
        const confirmados = Number(ev.confirmados_count ?? 0);
        const aforo       = Number(ev.aforo_maximo ?? 0);
        if (aforo > 0 && confirmados >= aforo) {
          setAgotado(true);
        }
        setEvento(ev);
      })
      .catch(() => setEventoError('No se pudo cargar la información del evento.'))
      .finally(() => setLoadEvento(false));
  }, [id]);

  if (agotado) {
    return <PantallaAgotado nombreEvento={evento?.nombre_evento ?? ''} />;
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');

    if (!form.nombre_invitado.trim()) return setSaveError('El nombre es requerido.');
    if (!form.correo.trim())          return setSaveError('El correo es requerido.');
    if (!/\S+@\S+\.\S+/.test(form.correo)) return setSaveError('El correo no es válido.');
    if (evento?.codigo_acceso && !form.codigo_acceso.trim()) {
      return setSaveError('Este evento requiere un código de acceso.');
    }

    const restricciones = [];
    if (form.dieta && form.dieta !== 'Sin restricción') {
      restricciones.push({ tipo: 'Dieta', descripcion: form.dieta });
    }
    if (form.alergia.trim()) {
      restricciones.push({ tipo: 'Alergia', descripcion: form.alergia.trim() });
    }
    if (form.movilidad) {
      restricciones.push({ tipo: 'Movilidad', descripcion: 'Requiere accesibilidad para movilidad reducida' });
    }

    setSaving(true);
    try {
      const { data } = await rsvpApi.registrar(id, {
        nombre_invitado: form.nombre_invitado.trim(),
        correo:          form.correo.trim(),
        telefono:        form.telefono.trim() || undefined,
        estado_invitado: form.estado_invitado,
        codigo_acceso:   form.codigo_acceso.trim() || undefined,
        restricciones,
      });
      navigate('/rsvp/confirmacion', {
        replace: true,
        state: {
          idRsvp:         data.data.id_rsvp,
          qrDataUri:      data.data.qr_data_uri,
          nombreEvento:   evento?.nombre_evento ?? '',
          nombreInvitado: form.nombre_invitado.trim(),
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('cupos')) {
        setAgotado(true);
      } else {
        setSaveError(msg || 'Error al registrar. Intenta nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadEvento) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (eventoError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{eventoError}</p>
          <Link to="/" className="text-indigo-600 hover:underline text-sm">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header minimalista */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
              C
            </div>
            <span className="text-slate-800 dark:text-slate-100 font-semibold text-sm">Convexa</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 text-sm truncate">{evento?.nombre_evento}</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        {/* Info del evento */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-8">
          <p className="text-indigo-200 text-xs uppercase tracking-wider mb-1">
            {evento?.TIPOS_EVENTO?.nombre ?? 'Evento'}
          </p>
          <h1 className="text-xl font-bold leading-snug mb-3">{evento?.nombre_evento}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
            <span>{fmtDate(evento?.fecha_inicio)}</span>
            {evento?.ubicacion_texto && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {evento.ubicacion_texto}
              </span>
            )}
            {evento?.aforo_maximo && (
              <span>Aforo: {evento.aforo_maximo} personas</span>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Formulario de inscripción</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Completa tus datos para reservar tu lugar.</p>

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Datos personales */}
            <fieldset>
              <legend className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Datos personales
              </legend>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre_invitado}
                    onChange={e => setField('nombre_invitado', e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               placeholder:text-slate-300 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.correo}
                    onChange={e => setField('correo', e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               placeholder:text-slate-300 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={e => setField('telefono', e.target.value)}
                    placeholder="+56 9 xxxx xxxx"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               placeholder:text-slate-300 dark:placeholder:text-slate-500"
                  />
                </div>

                {evento?.codigo_acceso && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Código de acceso <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.codigo_acceso}
                      onChange={e => setField('codigo_acceso', e.target.value)}
                      placeholder="Ingresa el código de acceso al evento"
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 placeholder:text-slate-300"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Este evento es privado. Solicita el código al organizador.
                    </p>
                  </div>
                )}
              </div>
            </fieldset>

            <hr className="border-slate-100" />

            {/* Estado de asistencia */}
            <fieldset>
              <legend className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Asistencia
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'Confirmado', label: 'Confirmo asistencia', color: 'indigo' },
                  { val: 'Rechazado',  label: 'No podré asistir',    color: 'slate'  },
                ].map(op => (
                  <button
                    key={op.val}
                    type="button"
                    onClick={() => setField('estado_invitado', op.val)}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      form.estado_invitado === op.val
                        ? op.val === 'Confirmado'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                          : 'bg-slate-100 border-slate-400 text-slate-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {form.estado_invitado === 'Confirmado' && (
              <>
                <hr className="border-slate-100" />

                {/* Restricciones */}
                <fieldset>
                  <legend className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Requerimientos especiales
                  </legend>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Restricción dietaria
                      </label>
                      <select
                        value={form.dieta}
                        onChange={e => setField('dieta', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        {DIETAS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Alergias
                      </label>
                      <input
                        type="text"
                        value={form.alergia}
                        onChange={e => setField('alergia', e.target.value)}
                        placeholder={`p.ej. ${ALERGIAS_COMUNES.slice(0,3).join(', ')}`}
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   placeholder:text-slate-300"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={form.movilidad}
                          onChange={e => setField('movilidad', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${
                          form.movilidad ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            form.movilidad ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 leading-tight">
                          Requiero accesibilidad para movilidad reducida
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Rampa, silla de ruedas u otro apoyo especial
                        </p>
                      </div>
                    </label>
                  </div>
                </fieldset>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
                         text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {saving ? 'Registrando...' : form.estado_invitado === 'Confirmado' ? 'Confirmar inscripción' : 'Enviar respuesta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Convexa · Sistema de Gestión de Eventos
        </p>
      </main>
    </div>
  );
}
