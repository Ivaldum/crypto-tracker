import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

interface Crypto {
    id: string;
    name: string;
    symbol: string;
    price: number;
    trend: number;
  }
  
  const Favorites: React.FC = () => {
    const [favoriteCryptos, setFavoriteCryptos] = useState<Crypto[]>([]);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchFavoriteCryptos = async () => {
        try {
          const token = getToken(); // Obtener el token de autenticación del usuario
          const response = await axios.get('http://localhost:3001/api/cryptos', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          // Asumimos que todas las criptomonedas devueltas son las que el usuario sigue (las agregadas desde el panel)
          setFavoriteCryptos(response.data);
        } catch (error) {
          setError('Error al obtener las criptomonedas favoritas');
        }
      };
  
      fetchFavoriteCryptos();
    }, []);
  
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6">Mis Criptomonedas Seguimiento</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border-b border-gray-200 text-left p-4">Nombre</th>
              <th className="border-b border-gray-200 text-left p-4">Símbolo</th>
              <th className="border-b border-gray-200 text-left p-4">Precio (USD)</th>
              <th className="border-b border-gray-200 text-left p-4">Tendencia (%)</th>
            </tr>
          </thead>
          <tbody>
            {favoriteCryptos.map((crypto) => (
              <tr key={crypto.id} className="hover:bg-gray-100">
                <td className="border-b border-gray-200 p-4">{crypto.name}</td>
                <td className="border-b border-gray-200 p-4">{crypto.symbol}</td>
                <td className="border-b border-gray-200 p-4">${crypto.price.toFixed(2)}</td>
                <td className="border-b border-gray-200 p-4">{crypto.trend.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default Favorites;