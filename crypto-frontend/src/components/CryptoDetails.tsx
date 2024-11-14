import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const CryptoDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [crypto, setCrypto] = useState<any>(null);
    const [priceHistory, setPriceHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [onFetching, setOnFetching] = useState<boolean>(false);

    useEffect(() => {
        if (onFetching) return;

        const fetchCryptoDetails = async () => {
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('No se encontró el token de autenticación');
                }

                setOnFetching(true);

                const { data } = await axios.get(`https://api.coincap.io/v2/assets/${id}`);
                const cryptoData = data.data;

                // Obtener el historial de precios
                const priceHistoryResponse = await axios.get(`https://api.coincap.io/v2/assets/${id}/history?interval=d1`);
                const priceHistoryData = priceHistoryResponse.data.data;

                setCrypto({
                    id: cryptoData.id,
                    name: cryptoData.name,
                    symbol: cryptoData.symbol,
                    price: parseFloat(cryptoData.priceUsd),
                    trend: parseFloat(cryptoData.changePercent24Hr),
                });
                setPriceHistory(priceHistoryData);
            } catch (error) {
                setError('Error al obtener los detalles de la criptomoneda');
                console.error('Error:', error);
            } finally {
                setOnFetching(false);
            }
        };

        fetchCryptoDetails();
    }, [id]);

    const formatDataForChart = () => {
        if (!priceHistory) return { labels: [], datasets: [] };

        const labels = priceHistory.map((point: any) => new Date(point.time * 1000).toLocaleDateString());
        const data = priceHistory.map((point: any) => parseFloat(point.priceUsd));

        return {
            labels,
            datasets: [
                {
                    label: 'Precio USD',
                    data,
                    fill: false,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1,
                },
            ],
        };
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {error && <p className="text-red-500">{error}</p>}
            {crypto && (
                <div>
                    <h2 className="text-3xl font-bold mb-4 text-center">{crypto.name} ({crypto.symbol})</h2>
                    <div className="flex justify-center mb-6 space-x-8">
                        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                            <p className="text-lg font-semibold">Precio Actual</p>
                            <p className="text-2xl font-bold text-green-600">${crypto.price.toFixed(2)}</p>
                        </div>
                        <div className={`p-4 rounded-lg shadow-md ${crypto.trend >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            <p className="text-lg font-semibold">Tendencia</p>
                            <p className={`text-2xl font-bold ${crypto.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {crypto.trend.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {priceHistory && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4 text-center">Evolución del Precio (Últimos 6 meses)</h3>
                            <Line key={crypto?.id} data={formatDataForChart()} options={{ responsive: true }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CryptoDetails;