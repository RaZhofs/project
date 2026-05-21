import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input  from '../components/common/Input';
import Button from '../components/common/Button';

// Credenciales demo — reemplazar por POST /api/v1/auth/login cuando exista
const DEMO_USERS = {
  'admin@convexa.com': {
    password: 'admin123',
    sesion: { id_usuario: 1, id_especifico: 1, nombre: 'Admin Demo', rol: 'Administrador' },
  },
  'colab@convexa.com': {
    password: 'colab123',
    sesion: { id_usuario: 2, id_especifico: 1, nombre: 'Colaborador Demo', rol: 'Colaborador' },
  },
};

function validate(correo, password) {
  const errors = {};
  if (!correo)                            errors.correo   = 'El correo es obligatorio.';
  else if (!/\S+@\S+\.\S+/.test(correo)) errors.correo   = 'Ingresa un correo válido.';
  if (!password)                          errors.password = 'La contraseña es obligatoria.';
  else if (password.length < 6)          errors.password = 'Mínimo 6 caracteres.';
  return errors;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,     setForm]     = useState({ correo: '', password: '' });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form.correo, form.password);
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setLoading(true);
    try {
      // TODO: reemplazar por llamada real cuando exista el endpoint
      // const { data } = await api.post('/auth/login', form);
      // login(data.sesion, data.token);

      await new Promise(r => setTimeout(r, 600));
      const match = DEMO_USERS[form.correo];

      if (match && match.password === form.password) {
        login(match.sesion, `demo-token-${match.sesion.rol}`);
        navigate(match.sesion.rol === 'Administrador' ? '/' : '/mis-tareas');
      } else {
        setApiError('Correo o contraseña incorrectos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Convexa</h1>
          <p className="text-slate-500 text-sm mt-1">Panel de Administración</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="correo" name="correo" label="Correo electrónico" type="email"
              placeholder="usuario@convexa.com" autoComplete="email"
              value={form.correo} onChange={handleChange} error={errors.correo}
            />
            <Input
              id="password" name="password" label="Contraseña" type="password"
              placeholder="••••••••" autoComplete="current-password"
              value={form.password} onChange={handleChange} error={errors.password}
            />

            {apiError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
              {loading ? 'Verificando...' : 'Entrar al panel'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-2">Cuentas de demo</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="font-medium text-slate-700">Administrador</p>
                <p>admin@convexa.com</p>
                <p>admin123</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="font-medium text-slate-700">Colaborador</p>
                <p>colab@convexa.com</p>
                <p>colab123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
