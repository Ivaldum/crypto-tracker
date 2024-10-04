import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  changePercent24Hr?: number;
}

const Panel: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptosFromAPI = async () => {
      try {
        const response = await axios.get('https://api.coincap.io/v2/assets');
        const data = response.data.data.map((crypto: any) => ({
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          price: parseFloat(crypto.priceUsd) || 0,
          changePercent24Hr: parseFloat(crypto.changePercent24Hr) || 0,
        }));
        setCryptos(data);
      } catch (error) {
        setError('Error al obtener las criptomonedas de la API');
        console.error('Error al obtener datos de la API:', error);
      }
    };

    fetchCryptosFromAPI();
  }, []);

  const addCrypto = async (cryptoId: string) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const cryptoData = cryptos.find(crypto => crypto.id === cryptoId);

      if (!cryptoData) {
        throw new Error('Criptomoneda no encontrada');
      }

      const newCrypto = {
        name: cryptoData.name,
        symbol: cryptoData.symbol,
        price: cryptoData.price,
        trend: cryptoData.changePercent24Hr,
      };

      const response = await axios.post('http://localhost:3001/api/cryptos', newCrypto, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

    } catch {
      setError('Error al añadir la criptomoneda');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Panel de Seguimiento de Criptomonedas</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border-b border-gray-200 text-left p-4">Nombre</th>
            <th className="border-b border-gray-200 text-left p-4">Símbolo</th>
            <th className="border-b border-gray-200 text-left p-4">Precio (USD)</th>
            <th className="border-b border-gray-200 text-left p-4">Cambio 24h (%)</th>
            <th className="border-b border-gray-200 text-left p-4">Acción</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto) => (
            <tr key={crypto.id} className="hover:bg-gray-100">
              <td className="border-b border-gray-200 p-4">{crypto.name}</td>
              <td className="border-b border-gray-200 p-4">{crypto.symbol}</td>
              <td className="border-b border-gray-200 p-4">
                {crypto.price !== undefined ? `$${crypto.price.toFixed(2)}` : 'N/A'}
              </td>
              <td className="border-b border-gray-200 p-4">
                {crypto.changePercent24Hr !== undefined ? `${crypto.changePercent24Hr.toFixed(2)}%` : 'N/A'}
              </td>
              <td className="border-b border-gray-200 p-4">
                <button
                  onClick={() => addCrypto(crypto.id)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Agregar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Panel;