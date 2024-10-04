import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <h1 className="text-4xl font-bold mb-12 text-center">Bienvenido a Crypto Tracker</h1>
  
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          <Link to="/login">
            <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg">Iniciar Sesión</button>
          </Link>
  
          <Link to="/register">
            <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 text-lg">Registrarse</button>
          </Link>
  
          <Link to="/panel">
            <button className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 text-lg">Panel de Seguimiento</button>
          </Link>
  
          <Link to="/favorites">
            <button className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 text-lg">Mis Criptomonedas Favoritas</button>
          </Link>
        </div>
      </div>
    );
  };
  
  export default Home;