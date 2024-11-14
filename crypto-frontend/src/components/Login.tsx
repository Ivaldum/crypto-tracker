import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useForm } from 'react-hook-form';
import { yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup';
import { login as loginServer } from '../services/cryptoService';

// Esquema de validación con Yup
const schema = yup.object().shape({
  email: yup.string().email('El correo debe ser válido').required('El correo es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
});

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const { state } = location;
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const token = await loginServer(data.email, data.password);

      login(token);
      navigate(location.state?.from || '/panel');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión, intenta nuevamente');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      {state?.message && (
        <p className="mb-4 text-red-500 text-center">{state.message}</p>
      )}
      {errorMessage && (
        <p className="mb-4 text-red-500 text-center">{errorMessage}</p>
      )}
      <h2 className="text-3xl font-bold mb-6">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 w-full max-w-sm">
        <input
          {...register('email')}
          placeholder="Email"
          className="border border-gray-300 p-2 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <input
          {...register('password')}
          type="password"
          placeholder="Contraseña"
          className="border border-gray-300 p-2 rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-lg"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;