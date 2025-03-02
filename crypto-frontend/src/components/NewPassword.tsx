import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extraer el token de la URL
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setMessage('Token de restablecimiento no encontrado.');
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetPassword = async () => {
    if (!token) {
      setMessage('Token de restablecimiento no encontrado.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    console.log(token)
    try {
      console.log( token, formData.newPassword )
      const response = await axios.post('http://localhost:3001/auth/resetPassword', { token, newPassword: formData.newPassword });
      setMessage('Contraseña restablecida correctamente.');
      setTimeout(() => navigate('/login'), 3000); // Redirige al login después de 3 segundos
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setMessage('Datos inválidos. Verifica tu token o la nueva contraseña.');
              break;
            case 404:
              setMessage('Token inválido o expirado.');
              break;
            default:
              setMessage('Error al restablecer la contraseña. Intenta nuevamente.');
          }
        } else {
          setMessage('No se pudo conectar con el servidor. Verifica tu conexión.');
        }
      } else {
        setMessage('Error inesperado. Intenta nuevamente.');
      }
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Restablecer Contraseña
        </h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.includes('error') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
            }`}
          >
            <XCircle size={20} />
            <p>{message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleResetPassword}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-300"
            >
              Restablecer Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
