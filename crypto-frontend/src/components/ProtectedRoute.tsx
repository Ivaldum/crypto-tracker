import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth'; 

interface ProtectedRouteProps {
    element: React.ReactElement;
    redirectTo: string;
  }
  
  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, redirectTo }) => {
    return isAuthenticated() ? element : <Navigate to={redirectTo} />;
  };

export default ProtectedRoute;
