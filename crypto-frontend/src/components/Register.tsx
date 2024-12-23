import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    dni: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/auth/register', formData);
      setMessage('Usuario registrado con éxito');
      navigate('/login');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setMessage('Datos inválidos. Por favor revisa tu información.');
              break;
            case 409:
              setMessage('El correo electrónico ya está registrado.');
              break;
            default:
              setMessage('Error en el registro. Por favor intenta nuevamente.');
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Registro</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="Nombre"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            name="birthDate"
            placeholder="Fecha de Nacimiento"
            value={formData.birthDate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="dni"
            placeholder="DNI"
            value={formData.dni}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Registrar
          </button>
          {message && <p className="text-red-500 mt-4 text-center">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Register;
