import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Importa axios para hacer las solicitudes al backend
import { getToken } from "../utils/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthGetter: boolean;
  login: (token: string) => void;
  logout: () => void;
  sendPasswordResetEmail: () => Promise<void>; // Nueva función para el reset de contraseña
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthGetter, setIsAuthGetter] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthGetter(true);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    try {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw new Error("Error en la autenticación");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  // Función para enviar el correo de restablecimiento de contraseña
  const sendPasswordResetEmail = async () => {
    const token = getToken();
    try {
      const response = await axios.post(
        "http://localhost:3001/auth/requestPasswordReset",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ); // Llama a la ruta del backend
      alert(response.data.message); // Muestra el mensaje de éxito
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al enviar el correo");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthGetter,
        login,
        logout,
        sendPasswordResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
