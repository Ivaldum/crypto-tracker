import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth'; 

interface ProtectedRouteProps {
    element: React.ReactElement; // Tipo para los elementos de React
    redirectTo: string;
  }
  
  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, redirectTo }) => {
    return isAuthenticated() ? element : <Navigate to={redirectTo} />;
  };

export default ProtectedRoute;
