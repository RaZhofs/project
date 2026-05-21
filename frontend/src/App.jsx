import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import EventoFormPage from './pages/EventoFormPage';

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/eventos/nuevo" element={
            <PrivateRoute><EventoFormPage /></PrivateRoute>
          } />
          <Route path="/eventos/:id/editar" element={
            <PrivateRoute><EventoFormPage /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
