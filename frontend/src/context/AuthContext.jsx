import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// sesion = { id_usuario, id_especifico, nombre, rol }
// rol: 'Administrador' | 'Colaborador'
// id_especifico: id_administrador (Admin) | id_colaborador (Colaborador)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(
    () => JSON.parse(localStorage.getItem('sesion') || 'null')
  );

  const login = (sesionData, token) => {
    localStorage.setItem('sesion', JSON.stringify(sesionData));
    localStorage.setItem('token', token);
    setSesion(sesionData);
  };

  const logout = () => {
    localStorage.removeItem('sesion');
    localStorage.removeItem('token');
    setSesion(null);
  };

  return (
    <AuthContext.Provider value={{
      sesion,
      login,
      logout,
      isAuth:         !!sesion,
      isAdmin:        sesion?.rol === 'Administrador',
      isColaborador:  sesion?.rol === 'Colaborador',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
