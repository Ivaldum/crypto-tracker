import { useEffect, useState } from 'react';
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

const Favorites: React.FC = () => {
  const [favoriteCryptos, setFavoriteCryptos] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<keyof Crypto>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

        setFavoriteCryptos(updatedCryptos);
      } catch {
        setError('Error al obtener las criptomonedas favoritas');
      }
    };

    fetchFavoriteCryptos();
  }, []);

  const handleSort = (column: keyof Crypto) => {
    if (sortOrder === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder(column);
      setSortDirection('asc');
    }
    setFavoriteCryptos([...favoriteCryptos].sort(compare(column)));
  };

  const compare = (column: keyof Crypto) => (a: Crypto, b: Crypto) => {
    const order = sortDirection === 'asc' ? 1 : -1;
    if (typeof a[column] === 'number' && typeof b[column] === 'number') {
      return order * ((a[column] as number) - (b[column] as number));
    }
    return order * String(a[column]).localeCompare(String(b[column]));
  };

  const removeCrypto = async (cryptoId: string) => {
    try {
      const token = getToken();
      await axios.delete(`http://localhost:3001/api/cryptos/${cryptoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavoriteCryptos(favoriteCryptos.filter((crypto) => crypto.id !== cryptoId));
    } catch (error) {
      setError('Error al eliminar la criptomoneda');
    }
  };

  const getSortSymbol = (column: keyof Crypto) => {
    return sortOrder === column ? (sortDirection === 'asc' ? '▲' : '▼') : '';
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
            {favoriteCryptos.map((crypto) => (
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
