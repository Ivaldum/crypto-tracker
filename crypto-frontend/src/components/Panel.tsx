import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  trend?: number; 
}

const Panel: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const fetchCryptosFromBackend = async () => {
      try {
        const token = getToken();
        const response = await axios.get('http://localhost:3001/api/cryptos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            sort: sortColumn,
            direction: sortDirection,
            filter: filter,
          },
        });

        setCryptos(response.data);
      } catch (error) {
        setError('Error al obtener las criptomonedas del backend');
        console.error('Error al obtener datos del backend:', error);
      }
    };

    fetchCryptosFromBackend();
  }, [sortColumn, sortDirection, filter]);

  const toggleSortDirection = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  // Función `addCrypto` para añadir una criptomoneda a favoritos
  const addCrypto = async (id: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const cryptoData = cryptos.find(crypto => crypto.id === id);
      if (!cryptoData) {
        throw new Error('Criptomoneda no encontrada');
      }

      const newCrypto = {
        id: cryptoData.id,
        name: cryptoData.name,
        symbol: cryptoData.symbol,
        price: cryptoData.price,
        trend: cryptoData.trend,
      };

      await axios.post('http://localhost:3001/api/cryptos', newCrypto, {
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

      <div className="mb-4 flex justify-between">
        <div>
          <label htmlFor="filter" className="mr-2 font-semibold">Filtrar por nombre:</label>
          <input
            id="filter"
            type="text"
            value={filter}
            onChange={handleFilterChange}
            placeholder="Buscar..."
            className="p-2 border rounded"
          />
        </div>
      </div>

      <table className="table-custom min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th
              className="border-b border-gray-200 text-left p-4 cursor-pointer"
              onClick={() => toggleSortDirection('name')}
            >
              Nombre {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th
              className="border-b border-gray-200 text-left p-4 cursor-pointer"
              onClick={() => toggleSortDirection('symbol')}
            >
              Símbolo {sortColumn === 'symbol' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th
              className="border-b border-gray-200 text-left p-4 cursor-pointer"
              onClick={() => toggleSortDirection('price')}
            >
              Precio (USD) {sortColumn === 'price' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th
              className="border-b border-gray-200 text-left p-4 cursor-pointer"
              onClick={() => toggleSortDirection('trend')}
            >
              Cambio 24h (%) {sortColumn === 'trend' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th className="border-b border-gray-200 text-left p-4">Favoritos</th>
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
                <span className={crypto.trend && crypto.trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {crypto.trend !== undefined ? `${crypto.trend.toFixed(2)}%` : 'N/A'}
                </span>
              </td>
              <td className="border-b border-gray-200 p-4">
                <button
                  onClick={() => addCrypto(crypto.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300"
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
