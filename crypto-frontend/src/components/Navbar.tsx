import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link to="/" className="text-white text-xl font-bold">
            Crypto Tracker
          </Link>
        </div>
        {isAuthenticated && (
          <div className="flex space-x-8 items-center text-lg">
            <Link to="/panel" className="text-white hover:text-gray-300">
              Panel
            </Link>
            <Link to="/favorites" className="text-white hover:text-gray-300">
              Favoritos
            </Link>
            <button
              onClick={logout}
              className="text-white hover:text-gray-300"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

