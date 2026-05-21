import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import EventoFormPage from './pages/EventoFormPage';
import MisTareasPage      from './pages/MisTareasPage';
import EventoDetallePage  from './pages/EventoDetallePage';

// Redirige a /login si no hay sesión activa
function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

// Solo administradores; colaboradores van a /mis-tareas
function AdminRoute({ children }) {
  const { isAuth, isAdmin } = useAuth();
  if (!isAuth)   return <Navigate to="/login"      replace />;
  if (!isAdmin)  return <Navigate to="/mis-tareas" replace />;
  return children;
}

// Solo colaboradores; administradores van al dashboard
function ColabRoute({ children }) {
  const { isAuth, isColaborador } = useAuth();
  if (!isAuth)        return <Navigate to="/login" replace />;
  if (!isColaborador) return <Navigate to="/"      replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas de administrador */}
          <Route path="/" element={
            <AdminRoute><DashboardPage /></AdminRoute>
          } />
          <Route path="/eventos/nuevo" element={
            <AdminRoute><EventoFormPage /></AdminRoute>
          } />
          <Route path="/eventos/:id" element={
            <AdminRoute><EventoDetallePage /></AdminRoute>
          } />
          <Route path="/eventos/:id/editar" element={
            <AdminRoute><EventoFormPage /></AdminRoute>
          } />

          {/* Rutas de colaborador */}
          <Route path="/mis-tareas" element={
            <ColabRoute><MisTareasPage /></ColabRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
