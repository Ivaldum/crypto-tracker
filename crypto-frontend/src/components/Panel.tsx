import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

interface Crypto {
    id: number,
    name: string,
    symbol: string,
    price: number,
    trend: number
}

const Panel: React.FC = () => {
    const [cryptos, setCryptos] = useState<Crypto[]>([])
    const [error, setError] = useState<string | null>(null)
    const [newCrypto, setNewCrypto] = useState<Crypto>({
        id: 0,
        name: '',
        symbol: '',
        price: 0,
        trend: 0,
      });

    useEffect(() => {
        const fetchCryptos = async () => {
            try {
                const token = getToken();

                const response = await axios.get('http://localhost:3001/api/cryptos', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCryptos(response.data)
            } catch (error) {
                setError('No se pudieron obtener las crytp')
            }
        }
        fetchCryptos()
    }, [])


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

    return(
        <div>
        <h1>Panel de Seguimiento de Criptomonedas</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>} 
    
        <div>
          <input
            type="text"
            placeholder="Nombre"
            value={newCrypto.name}
            onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Símbolo"
            value={newCrypto.symbol}
            onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio"
            value={newCrypto.price}
            onChange={(e) => setNewCrypto({ ...newCrypto, price: parseFloat(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Tendencia"
            value={newCrypto.trend}
            onChange={(e) => setNewCrypto({ ...newCrypto, trend: parseFloat(e.target.value) })}
          />
          <button onClick={addCrypto}>Añadir Criptomoneda</button>
        </div>
    
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Símbolo</th>
              <th>Precio</th>
              <th>Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((crypto) => (
              <tr key={crypto.id}>
                <td>{crypto.name}</td>
                <td>{crypto.symbol}</td>
                <td>{crypto.price}</td>
                <td>{crypto.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
}

export default Panel