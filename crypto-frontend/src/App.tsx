import { useState, useEffect } from "react"
import {getCryptos} from './services/cryptoService'

interface Crypto {
  id: number;
  name: string;
  symbol: string;
  price: number;
  trend: number;
}

const App: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([])

  useEffect(() => {

    getCryptos().then((response) => setCryptos(response.data))
  }, []);

  return(
    <div>
      <h1>Crypto Tracker</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Trend</th>
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

export default App
