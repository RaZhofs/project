import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { rsvpApi } from '../services/api';

const SCANNER_ID = 'qr-camera-feed';

// ── Cámara: solo se monta cuando phase === 'scanning' ───────────────────────
// Al desmontar, el useEffect cleanup detiene la cámara antes de que
// html5-qrcode pueda modificar el DOM fuera del control de React.
function CameraScanner({ onScan }) {
  const instanceRef = useRef(null);
  const firedRef    = useRef(false);

  useEffect(() => {
    const qr = new Html5Qrcode(SCANNER_ID);
    instanceRef.current = qr;

    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
      (decodedText) => {
        if (firedRef.current) return;
        firedRef.current = true;
        onScan(decodedText);
      },
      () => {},
    ).catch(() => {});

    return () => {
      if (qr.isScanning) {
        qr.stop().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-square">
      <div id={SCANNER_ID} className="w-full h-full" />
      {/* Visor */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 border-2 border-white/70 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  );
}

// ── Tarjeta de resultado ─────────────────────────────────────────────────────
function ResultCard({ ok, data, motivo, onNext }) {
  const hora = new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date());

  return (
    <div className={`w-full rounded-2xl border-2 p-8 text-center shadow-lg ${
      ok
        ? 'bg-green-50 dark:bg-green-950/40 border-green-400 dark:border-green-600'
        : 'bg-red-50 dark:bg-red-950/40 border-red-400 dark:border-red-600'
    }`}>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
        ok ? 'bg-green-100 dark:bg-green-900/60' : 'bg-red-100 dark:bg-red-900/60'
      }`}>
        {ok ? (
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <p className={`text-2xl font-black tracking-wide mb-2 ${
        ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
      }`}>
        {ok ? 'ACCESO CONCEDIDO' : 'ACCESO DENEGADO'}
      </p>

      {ok ? (
        <>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">
            {data.nombre_invitado}
          </p>
          {data.nombre_evento && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{data.nombre_evento}</p>
          )}
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            Ingreso registrado a las {hora}
          </p>
        </>
      ) : (
        <p className="text-base text-slate-600 dark:text-slate-300 mt-2 mb-1 font-medium">
          {motivo}
        </p>
      )}

      <button
        onClick={onNext}
        className={`mt-8 w-full py-3.5 rounded-xl font-bold text-base transition-colors ${
          ok
            ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
            : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white'
        }`}
      >
        Escanear Siguiente
      </button>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function QrScannerPage() {
  const [phase,      setPhase]      = useState('scanning'); // 'scanning' | 'loading' | 'success' | 'denied'
  const [scannerKey, setScannerKey] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [resultMsg,  setResultMsg]  = useState('');
  const fileInputRef = useRef(null);

  const handleToken = useCallback(async (token) => {
    setPhase('loading');
    try {
      const { data } = await rsvpApi.validarAcceso(token);
      setResultData(data.data);
      setPhase('success');
    } catch (err) {
      const errData = err.response?.data;
      let msg = errData?.message || 'QR inválido o error de conexión.';
      if (errData?.fecha_ingreso) {
        const hora = new Intl.DateTimeFormat('es-CL', {
          day: '2-digit', month: 'short',
          hour: '2-digit', minute: '2-digit',
        }).format(new Date(errData.fecha_ingreso));
        msg = `${msg} el ${hora}.`;
      }
      setResultMsg(msg);
      setPhase('denied');
    }
  }, []);

  const handleReset = () => {
    setResultData(null);
    setResultMsg('');
    setScannerKey(k => k + 1);
    setPhase('scanning');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const tempId = 'qr-file-tmp';
    const div = document.createElement('div');
    div.id = tempId;
    div.style.display = 'none';
    document.body.appendChild(div);

    try {
      const qr    = new Html5Qrcode(tempId);
      const token = await qr.scanFile(file, false);
      document.body.removeChild(div);
      handleToken(token);
    } catch {
      document.body.removeChild(div);
      setResultMsg('No se encontró un código QR válido en la imagen.');
      setPhase('denied');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">C</div>
              <span className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Convexa</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Control de Accesos</span>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            phase === 'scanning' || phase === 'loading'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : phase === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              phase === 'scanning' ? 'bg-indigo-500 animate-pulse'
              : phase === 'loading' ? 'bg-indigo-400 animate-pulse'
              : phase === 'success' ? 'bg-green-500'
              : 'bg-red-500'
            }`} />
            {phase === 'scanning' ? 'En vivo' : phase === 'loading' ? 'Verificando...' : phase === 'success' ? 'Concedido' : 'Denegado'}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">

        {/* ── Resultado ── */}
        {(phase === 'success' || phase === 'denied') && (
          <ResultCard
            ok={phase === 'success'}
            data={resultData}
            motivo={resultMsg}
            onNext={handleReset}
          />
        )}

        {/* ── Escáner activo ── */}
        {phase === 'scanning' && (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3 uppercase tracking-wider font-medium">
                Apunta la cámara al código QR
              </p>
              <CameraScanner key={scannerKey} onScan={handleToken} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                ¿La cámara no funciona o el QR es una imagen?
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600
                           text-sm font-medium text-slate-700 dark:text-slate-200
                           hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                       m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Subir imagen de QR
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} />
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50
                            rounded-2xl px-5 py-4 text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
              <p className="font-semibold mb-1">Instrucciones de uso</p>
              <p>• Centra el código QR dentro del recuadro blanco.</p>
              <p>• El escaneo es automático, no hace falta pulsar nada.</p>
              <p>• Si la cámara no enciende, usa el botón "Subir imagen".</p>
            </div>
          </>
        )}

        {/* ── Verificando ── */}
        {phase === 'loading' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-16 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Verificando acceso...</p>
          </div>
        )}

      </main>
    </div>
  );
}
