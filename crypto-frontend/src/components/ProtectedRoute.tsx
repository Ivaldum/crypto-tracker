import { Navigate } from 'react-router-dom';
import { getToken } from '../utils/auth'; 

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = getToken(); // Verificamos si hay un token válido

  if (!token) {
    return <Navigate to="/login" />; // Redirigimos al usuario si no está autenticado
  }

  return <>{children}</>; // Renderizamos los hijos si está autenticado
};

export default ProtectedRoute;

