import { useLocation, Link, Navigate } from 'react-router-dom';

export default function RsvpSuccessPage() {
  const { state } = useLocation();

  if (!state?.idRsvp) return <Navigate to="/" replace />;

  const { qrDataUri, idRsvp, nombreEvento, nombreInvitado } = state;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Header minimal */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
          C
        </div>
        <span className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Convexa</span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm
                      p-8 max-w-sm w-full text-center">

        {/* Check */}
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          ¡Inscripción confirmada!
        </h1>
        {nombreInvitado && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Hola <span className="font-medium text-slate-700 dark:text-slate-200">{nombreInvitado}</span>
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Tu lugar en <strong className="text-slate-700 dark:text-slate-200">{nombreEvento}</strong> está reservado.
        </p>

        {/* N° registro */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-3 mb-6">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">N° de registro</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            #{String(idRsvp).padStart(6, '0')}
          </p>
        </div>

        {/* QR */}
        {qrDataUri ? (
          <div className="mb-5">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              Presenta este código QR en la entrada del evento
            </p>
            <div className="inline-block bg-white border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-3 shadow-sm">
              <img
                src={qrDataUri}
                alt="Código QR de acceso"
                width={200}
                height={200}
                className="rounded-lg block"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Guarda esta página o toma una captura de pantalla
            </p>
          </div>
        ) : (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 text-xs text-indigo-600 dark:text-indigo-400 mb-5">
            Tu código QR de acceso llegará a tu correo en breve.
          </div>
        )}

        {/* Email hint */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          También enviamos una copia de tu ticket al correo registrado.
        </p>

        <Link
          to="/"
          className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500
                     text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Volver al inicio
        </Link>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-600 mt-6">
        Convexa · Sistema de Gestión de Eventos
      </p>
    </div>
  );
}
