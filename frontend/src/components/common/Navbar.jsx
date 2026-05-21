import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-indigo-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Convexa
            </span>
            <span className="hidden sm:inline text-indigo-300 text-sm">
              / Admin
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-indigo-200">
            <Link to="/" className="hover:text-white transition-colors">
              Eventos
            </Link>
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            {admin && (
              <span className="hidden sm:block text-sm text-indigo-200">
                {admin.nombre}
              </span>
            )}
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
