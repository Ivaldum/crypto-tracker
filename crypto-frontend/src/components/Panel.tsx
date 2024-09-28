import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

interface Crypto {
  id: number;
  name: string;
  symbol: string;
  price: number;
  trend: number;
}

const Panel: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [newCrypto, setNewCrypto] = useState<Crypto>({
    id: 0,
    name: '',
    symbol: '',
    price: 0,
    trend: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const token = getToken();

        const response = await axios.get('http://localhost:3001/api/cryptos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCryptos(response.data);
      } catch (error) {
        setError('No se pudieron obtener las criptomonedas');
      }
    };

    fetchCryptos();
  }, []);

  const addCrypto = async () => {
    try {
      const token = getToken();

      const response = await axios.post('http://localhost:3001/api/cryptos', newCrypto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCryptos([...cryptos, response.data]);
      setNewCrypto({ id: 0, name: '', symbol: '', price: 0, trend: 0 });
    } catch (error) {
      setError('Error al añadir la criptomoneda');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Seguimiento de Criptomonedas</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Nombre"
          className="border rounded px-3 py-2 mr-2"
          value={newCrypto.name}
          onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Símbolo"
          className="border rounded px-3 py-2 mr-2"
          value={newCrypto.symbol}
          onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value })}
        />
        <input
          type="number"
          placeholder="Precio"
          className="border rounded px-3 py-2 mr-2"
          value={newCrypto.price}
          onChange={(e) => setNewCrypto({ ...newCrypto, price: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Tendencia"
          className="border rounded px-3 py-2 mr-2"
          value={newCrypto.trend}
          onChange={(e) => setNewCrypto({ ...newCrypto, trend: parseFloat(e.target.value) })}
        />
        <button
          onClick={addCrypto}
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
        >
          Añadir Criptomoneda
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b py-2 text-left">Nombre</th>
            <th className="border-b py-2 text-left">Símbolo</th>
            <th className="border-b py-2 text-left">Precio</th>
            <th className="border-b py-2 text-left">Tendencia</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td className="border-b py-2">{crypto.name}</td>
              <td className="border-b py-2">{crypto.symbol}</td>
              <td className="border-b py-2">{crypto.price}</td>
              <td className="border-b py-2">{crypto.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Panel;
