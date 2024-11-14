import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { Link } from 'react-router-dom';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price: number;
  trend: number;
}

interface SortConfig {
  key: keyof Crypto;
  direction: 'asc' | 'desc';
}

const Favorites: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    const fetchFavoriteCryptos = async () => {
      try {
        const token = getToken();
        const response = await axios.get('http://localhost:3001/api/cryptos/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const favoriteData = response.data;

        const updatedCryptos = await Promise.all(
          favoriteData.map(async (crypto: Crypto) => {
            try {
              const { data } = await axios.get(`https://api.coincap.io/v2/assets/${crypto.id}`);
              return {
                ...crypto,
                price: parseFloat(data.data.priceUsd) || crypto.price,
              };
            } catch (error) {
              console.error(`Error al obtener el precio de ${crypto.id}:`, error);
              return crypto;
            }
          })
        );

        setCryptos(updatedCryptos);
      } catch {
        setError('Error al obtener las criptomonedas favoritas');
      }
    };

    fetchFavoriteCryptos();
  }, []);

  const sortedCryptos = useMemo(() => {
    const sortedData = [...cryptos];
    
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aString.localeCompare(bString);
      }
      return bString.localeCompare(aString);
    });

    return sortedData;
  }, [cryptos, sortConfig]);

  const handleSort = (column: keyof Crypto) => {
    setSortConfig(prevConfig => ({
      key: column,
      direction: prevConfig.key === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortSymbol = (column: keyof Crypto) => {
    if (sortConfig.key !== column) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const removeCrypto = async (cryptoId: string) => {
    try {
      const token = getToken();
      await axios.delete(`http://localhost:3001/api/cryptos/${cryptoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCryptos(cryptos.filter((crypto) => crypto.id !== cryptoId));
    } catch (error) {
      setError('Error al eliminar la criptomoneda');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl text-center font-bold mb-6">Mis Criptomonedas Favoritas</h2>
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="table-custom min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th
                className="border-b border-gray-200 text-left p-4 cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Nombre {getSortSymbol('name')}
              </th>
              <th
                className="border-b border-gray-200 text-left p-4 cursor-pointer"
                onClick={() => handleSort('symbol')}
              >
                Símbolo {getSortSymbol('symbol')}
              </th>
              <th
                className="border-b border-gray-200 text-left p-4 cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Precio (USD) {getSortSymbol('price')}
              </th>
              <th
                className="border-b border-gray-200 text-left p-4 cursor-pointer"
                onClick={() => handleSort('trend')}
              >
                Tendencia (%) {getSortSymbol('trend')}
              </th>
              <th className="border-b border-gray-200 text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {sortedCryptos.map((crypto) => (
              <tr key={crypto.id} className="hover:bg-gray-100 transition duration-300">
                <td className="border-b border-gray-200 p-4">{crypto.name}</td>
                <td className="border-b border-gray-200 p-4">{crypto.symbol}</td>
                <td className="border-b border-gray-200 p-4">${crypto.price.toFixed(2)}</td>
                <td className="border-b border-gray-200 p-4">
                  <span className={crypto.trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {crypto.trend.toFixed(2)}%
                  </span>
                </td>
                <td className="border-b border-gray-200 p-4 flex space-x-2">
                  <Link to={`/crypto/${crypto.id}`}>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
                      Ver Detalles
                    </button>
                  </Link>
                  <button
                    onClick={() => removeCrypto(crypto.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Favorites;