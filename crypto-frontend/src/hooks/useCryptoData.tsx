import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price: number;
  trend: number;
  isFavorite?: boolean;
  hasAlert?: boolean;
  alertId?: string;
}

const useCryptoData = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const token = getToken();
        const [cryptosResponse, favoritesResponse, alertsResponse] = await Promise.all([
          axios.get("http://localhost:3001/api/cryptos", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3001/api/cryptos/favorites", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3001/api/alerts", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const favoriteIds = new Set(favoritesResponse.data.map((fav: Crypto) => fav.id));
        const alertMap = new Map(alertsResponse.data.map((alert: any) => [alert.cryptoId, alert.id]));

        const updatedCryptos = cryptosResponse.data.map((crypto: Crypto) => ({
          ...crypto,
          isFavorite: favoriteIds.has(crypto.id),
          hasAlert: alertMap.has(crypto.id),
          alertId: alertMap.get(crypto.id),
        }));

        setCryptos(updatedCryptos);
      } catch {
        setError("Error al obtener los datos de las criptomonedas");
      }
    };

    fetchCryptoData();
  }, []);

  return { cryptos, error, setCryptos };
};

export default useCryptoData;
