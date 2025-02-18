import { useState, useMemo } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { Link } from 'react-router-dom';
import { Eye, Bell, BellOff, Trash2, ChevronDown, XCircle } from 'lucide-react';
import useCryptoData, { Crypto } from '../hooks/useCryptoData';
import AlertConfigDialog from './AlertConfigDialog';

interface SortConfig {
  key: keyof Crypto;
  direction: 'asc' | 'desc';
}

interface AlertConfig {
  cryptoId: string;
  thresholdPercentage: number;
  isOpen: boolean;
}

interface AlertHistory {
  id: string;
  price: number;
  createdAt: string;
  alert: {
    cryptocurrency: {
      name: string;
      symbol: string;
    };
    thresholdPercentage: number;
  };
}

const Favorites: React.FC = () => {
  // Usamos el hook para obtener datos centralizados y la función para actualizar el estado
  const { cryptos, error, setCryptos } = useCryptoData();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    cryptoId: '',
    thresholdPercentage: 5,
    isOpen: false
  });
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);

  // Filtramos solo las criptomonedas que son favoritas
  const favoriteCryptos = cryptos.filter(crypto => crypto.isFavorite);

  const sortedCryptos = useMemo(() => {
    const sortedData = [...favoriteCryptos];
    
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      return sortConfig.direction === 'asc'
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });

    return sortedData;
  }, [favoriteCryptos, sortConfig]);

  const removeCrypto = async (cryptoId: string) => {
    try {
      const token = getToken();
      await axios.delete(`http://localhost:3001/api/cryptos/${cryptoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Actualizamos el estado global eliminando la cripto
      setCryptos(prev => prev.filter(crypto => crypto.id !== cryptoId));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAlert = async (cryptoId: string) => {
    try {
      const token = getToken();
      const crypto = favoriteCryptos.find(c => c.id === cryptoId);
      
      if (!crypto?.hasAlert) {
        // Abrir diálogo de configuración de alerta antes de crearla
        openAlertConfig(cryptoId);
      } else if (crypto.alertId) {
        // Eliminar alerta directamente si ya existe
        await axios.delete(`http://localhost:3001/api/alerts/${crypto.alertId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Actualizar estado global inmediatamente
        setCryptos(prev =>
          prev.map(crypto =>
            crypto.id === cryptoId
              ? { ...crypto, hasAlert: false, alertId: undefined }
              : crypto
          )
        );
      }
    } catch (error) {
      console.error(error);
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

      setCryptos(prev =>
        prev.map(crypto =>
          crypto.id === alertConfig.cryptoId ? { ...crypto, hasAlert: true } : crypto
        )
      );
      closeAlertConfig();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/alert-history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mis Criptomonedas Favoritas
          </h2>
          <button
            onClick={fetchAlertHistory}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300 flex items-center gap-2"
          >
            <Bell size={18} />
            Historial de Alertas
          </button>
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-600">
            <XCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Tabla de Historial de Alertas */}
        {showHistory && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Historial de Alertas</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="overflow-x-auto">
              {alertHistory.length === 0 ? (
                <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                  No hay historial de alertas disponible
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criptomoneda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio (USD)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Umbral (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alertHistory.map((history) => (
                      <tr key={history.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {history.alert.cryptocurrency.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {history.alert.cryptocurrency.symbol}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${history.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {history.alert.thresholdPercentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(history.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                  onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                >
                  <div className="flex items-center gap-1">
                    Nombre
                    <ChevronDown size={16} className={`transform transition-transform ${
                      sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => setSortConfig({ key: 'symbol', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                >
                  <div className="flex items-center gap-1">
                    Símbolo
                    <ChevronDown size={16} className={`transform transition-transform ${
                      sortConfig.key === 'symbol' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => setSortConfig({ key: 'price', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                >
                  <div className="flex items-center gap-1">
                    Precio (USD)
                    <ChevronDown size={16} className={`transform transition-transform ${
                      sortConfig.key === 'price' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => setSortConfig({ key: 'trend', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                >
                  <div className="flex items-center gap-1">
                    Tendencia (%)
                    <ChevronDown size={16} className={`transform transition-transform ${
                      sortConfig.key === 'trend' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCryptos.map((crypto) => (
                <tr key={crypto.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{crypto.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crypto.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${crypto.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      crypto.trend >= 0 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {crypto.trend.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/crypto/${crypto.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        title="Ver detalles"
                      >
                        <Eye size={20} />
                      </Link>
                      <button
                        onClick={() => crypto.hasAlert 
                          ? toggleAlert(crypto.id) 
                          : openAlertConfig(crypto.id)
                        }
                        className={`transition-colors duration-150 ${
                          crypto.hasAlert 
                            ? 'text-yellow-500 hover:text-yellow-700'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={crypto.hasAlert ? 'Desactivar alerta' : 'Configurar alerta'}
                      >
                        {crypto.hasAlert ? <BellOff size={20} /> : <Bell size={20} />}
                      </button>
                      <button
                        onClick={() => removeCrypto(crypto.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-150"
                        title="Eliminar de favoritos"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AlertConfigDialog
        isOpen={alertConfig.isOpen}
        onClose={closeAlertConfig}
        thresholdPercentage={alertConfig.thresholdPercentage}
        onThresholdChange={(value) => setAlertConfig(prev => ({
          ...prev,
          thresholdPercentage: value
        }))}
        onSubmit={handleAlertSubmit}
        cryptoName={selectedCrypto?.name}
        currentPrice={selectedCrypto?.price}
      />
    </>
  );
};

export default Favorites;
