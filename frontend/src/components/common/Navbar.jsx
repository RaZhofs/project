import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="p-2 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-indigo-900 dark:bg-slate-950 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="text-lg font-semibold tracking-tight">Convexa</span>
            <span className="hidden sm:inline text-indigo-300 text-sm">/ Admin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-indigo-200">
            <Link to="/dashboard" className="hover:text-white transition-colors">Eventos</Link>
          </nav>

          <div className="flex items-center gap-2">
            {sesion && (
              <span className="hidden sm:block text-sm text-indigo-200">{sesion.nombre}</span>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}
              className="text-indigo-200 hover:text-white hover:bg-indigo-800">
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
