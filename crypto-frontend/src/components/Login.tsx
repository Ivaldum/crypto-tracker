import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const { state } = location;

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate(location.state?.from || '/panel'); 
    } catch (error) {
      setErrorMessage('Credenciales incorrectas. Intenta nuevamente.');
      console.error('Error al iniciar sesión:', error);
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
      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-full max-w-sm">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border border-gray-300 p-2 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="border border-gray-300 p-2 rounded"
          required
        />
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
