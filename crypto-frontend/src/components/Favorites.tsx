import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price: number;
  trend: number;
  hasAlert?: boolean;
  alertId?: string;
}

interface SortConfig {
  key: keyof Crypto;
  direction: 'asc' | 'desc';
}

interface AlertConfig {
  cryptoId: string;
  thresholdPercentage: number;
  isOpen: boolean;
}

const Favorites: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    cryptoId: '',
    thresholdPercentage: 5,
    isOpen: false
  });

  useEffect(() => {
    const fetchFavoriteCryptos = async () => {
      try {
        const token = getToken();
        const [favoritesResponse, alertsResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/cryptos/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3001/api/alerts', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const favoriteData = favoritesResponse.data;
        const alerts = alertsResponse.data;
        const alertMap = new Map(alerts.map((alert: any) => [alert.cryptoId, alert.id]));

        const updatedCryptos = await Promise.all(
          favoriteData.map(async (crypto: Crypto) => {
            try {
              const { data } = await axios.get(`https://api.coincap.io/v2/assets/${crypto.id}`);
              return {
                ...crypto,
                price: parseFloat(data.data.priceUsd) || crypto.price,
                hasAlert: alertMap.has(crypto.id),
                alertId: alertMap.get(crypto.id)
              };
            } catch (error) {
              console.error(`Error al obtener el precio de ${crypto.id}:`, error);
              return crypto;
            }
          })
        );

        setCryptos(updatedCryptos);
      } catch {
        setError('Error al obtener los datos');
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

  const toggleAlert = async (cryptoId: string) => {
    try {
      const token = getToken();
      const crypto = cryptos.find(c => c.id === cryptoId);
      
      if (!crypto?.hasAlert) {
        // Crear alerta
        await axios.post('http://localhost:3001/api/alerts', 
          {
            cryptoId,
            thresholdPercentage: 5
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (crypto.alertId) {
        // Eliminar alerta usando el alertId
        await axios.delete(`http://localhost:3001/api/alerts/${crypto.alertId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Actualizar estado local
      setCryptos(cryptos.map(crypto => 
        crypto.id === cryptoId 
          ? { ...crypto, hasAlert: !crypto.hasAlert }
          : crypto
      ));
    } catch (error) {
      setError('Error al gestionar la alerta');
    }
  };

  const openAlertConfig = (cryptoId: string, currentThreshold?: number) => {
    setAlertConfig({
      cryptoId,
      thresholdPercentage: currentThreshold || 5,
      isOpen: true
    });
  };

  const closeAlertConfig = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleAlertSubmit = async () => {
    try {
      const token = getToken();
      await axios.post('http://localhost:3001/api/alerts', 
        {
          cryptoId: alertConfig.cryptoId,
          thresholdPercentage: alertConfig.thresholdPercentage
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCryptos(cryptos.map(crypto => 
        crypto.id === alertConfig.cryptoId 
          ? { ...crypto, hasAlert: true }
          : crypto
      ));
      closeAlertConfig();
    } catch (error) {
      setError('Error al configurar la alerta');
    }
  };

  return (
    <>
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
                      onClick={() => crypto.hasAlert 
                        ? toggleAlert(crypto.id) 
                        : openAlertConfig(crypto.id)}
                      className={`${
                        crypto.hasAlert 
                          ? 'bg-yellow-500 hover:bg-yellow-600' 
                          : 'bg-gray-500 hover:bg-gray-600'
                      } text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300`}
                    >
                      {crypto.hasAlert ? 'Desactivar Alerta' : 'Configurar Alerta'}
                    </button>
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

      <Dialog
        open={alertConfig.isOpen}
        onClose={closeAlertConfig}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-xl font-bold mb-4">
              Configurar Alerta
            </Dialog.Title>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de cambio para alertar
              </label>
              <input
                type="number"
                value={alertConfig.thresholdPercentage}
                onChange={(e) => setAlertConfig(prev => ({
                  ...prev,
                  thresholdPercentage: parseFloat(e.target.value)
                }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0.1"
                step="0.1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recibirás una alerta cuando el precio cambie más de este porcentaje
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeAlertConfig}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAlertSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Guardar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default Favorites;