import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link to="/" className="text-white text-2xl font-bold hover:text-gray-200 transition duration-300">
            Crypto Tracker
          </Link>
        </div>
        {isAuthenticated && (
          <div className="flex space-x-8 items-center text-lg">
            <NavLink to="/panel" label="Panel" activePath={location.pathname} />
            <NavLink to="/favorites" label="Favoritos" activePath={location.pathname} />
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md">
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ to: string; label: string; activePath: string }> = ({ to, label, activePath }) => {
  const isActive = activePath === to;
  return (
    <Link
      to={to}
      className={`relative text-white font-medium hover:text-gray-300 transition duration-300 ${
        isActive ? 'text-gray-300' : ''
      }`}>
      {label}
      <span
        className={`absolute left-0 -bottom-1 h-0.5 w-full transition-transform duration-300 ${
          isActive ? 'scale-100 bg-yellow-400' : 'scale-0 bg-transparent group-hover:bg-yellow-400'
        }`}>
      </span>
    </Link>
  );
};

export default Navbar;