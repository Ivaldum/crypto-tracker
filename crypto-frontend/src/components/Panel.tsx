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
  const [sortColumn, setSortColumn] = useState<keyof Crypto>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<string>('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCryptosFromBackend = async () => {
      try {
        const token = getToken();
        const response = await axios.get('http://localhost:3001/api/cryptos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCryptos(response.data);
      } catch (error) {
        setError('Error al obtener las criptomonedas del backend');
        console.error('Error al obtener datos del backend:', error);
      }
    };

    fetchCryptosFromBackend();
  }, []);

  const sortData = (data: Crypto[]) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      return sortDirection === 'asc' 
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  };

  const toggleSortDirection = (column: keyof Crypto) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset a la primera página al cambiar el ordenamiento
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset a la primera página al filtrar
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset a la primera página al cambiar items por página
  };

  // Filtrar y ordenar datos
  const filteredAndSortedCryptos = sortData(
    cryptos.filter(crypto => 
      crypto.name.toLowerCase().includes(filter.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(filter.toLowerCase())
    )
  );

  // Calcular datos de paginación
  const totalItems = filteredAndSortedCryptos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAndSortedCryptos.slice(startIndex, endIndex);

  // Funciones de navegación
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Generar números de página para la navegación
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    if (totalPages > 1) {
      range.unshift(1);
      if (totalPages > 1) {
        range.push(totalPages);
      }
    }

    return range;
  };

  const addCrypto = async (id: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
  
      const cryptoData = cryptos.find((crypto) => crypto.id === id);
      if (!cryptoData) {
        throw new Error('Criptomoneda no encontrada');
      }
  
      const newCrypto = {
        id: cryptoData.id,
        name: cryptoData.name,
        symbol: cryptoData.symbol,
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

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
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
          <div>
            <label htmlFor="itemsPerPage" className="mr-2 font-semibold">Items por página:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-2 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
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
          {currentItems.map((crypto) => (
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

      {/* Controles de paginación */}
      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Anterior
        </button>
        
        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' ? goToPage(pageNum) : null}
            className={`px-3 py-1 rounded ${
              pageNum === currentPage
                ? 'bg-blue-600 text-white'
                : pageNum === '...'
                ? 'bg-white text-gray-600'
                : 'bg-white text-blue-600 hover:bg-blue-100'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Siguiente
        </button>
      </div>

      <div className="mt-2 text-center text-gray-600">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} items
      </div>
    </div>
  );
};

export default Panel;