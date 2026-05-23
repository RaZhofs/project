import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import EventoFormPage     from './pages/EventoFormPage';
import MisTareasPage      from './pages/MisTareasPage';
import EventoDetallePage  from './pages/EventoDetallePage';
import RsvpFormPage       from './pages/RsvpFormPage';

// Solo administradores; colaboradores van a /mis-tareas
function AdminRoute({ children }) {
  const { isAuth, isAdmin } = useAuth();
  if (!isAuth)  return <Navigate to="/login"      replace />;
  if (!isAdmin) return <Navigate to="/mis-tareas" replace />;
  return children;
}

// Solo colaboradores; administradores van al dashboard
function ColabRoute({ children }) {
  const { isAuth, isColaborador } = useAuth();
  if (!isAuth)        return <Navigate to="/login"     replace />;
  if (!isColaborador) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/"                               element={<LandingPage />} />
          <Route path="/login"                          element={<LoginPage />} />
          <Route path="/eventos/publico/:id/rsvp"       element={<RsvpFormPage />} />

          {/* Rutas de administrador */}
          <Route path="/dashboard" element={
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
    </ThemeProvider>
  );
}
