import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthGetter: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthGetter, setIsAuthGetter] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthGetter(true);
    console.log('Token obtenido:', token);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('token', token); 
      console.log('Token almacenado:', token); 
      setIsAuthenticated(true); 
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new Error('Error en la autenticación');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthGetter, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
