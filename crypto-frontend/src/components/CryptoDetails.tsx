import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { Line } from 'react-chartjs-2';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { XCircle } from 'lucide-react';

Chart.register(...registerables);

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  trend: number;
}

interface PriceHistoryPoint {
  time: number;
  priceUsd: string;
  date: string;
}

const CryptoDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [crypto, setCrypto] = useState<CryptoData | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [onFetching, setOnFetching] = useState<boolean>(false);

    const API_BASE_URL = 'https://rest.coincap.io/v3';
    const API_KEY = '66bb38c643960e7948541eb2afd961201c06ad4d2d69e6a2ea72c7f89ed0a611';

    const coinCapApi = axios.create({
        baseURL: API_BASE_URL,
        headers: {
        'Authorization': `Bearer ${API_KEY}`
        }
    });

    useEffect(() => {
        if (onFetching) return;

        const fetchCryptoDetails = async () => {
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('No se encontró el token de autenticación');
                }

                setOnFetching(true);

                const { data } = await coinCapApi.get(`${API_BASE_URL}/assets/${id}`);
                const cryptoData = data.data;

                const priceHistoryResponse = await coinCapApi.get(`${API_BASE_URL}/assets/${id}/history?interval=d1`);
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

    const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp); 
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

    const formatDataForChart = () => {
        if (!priceHistory.length) return { labels: [], datasets: [] };

        const labels = priceHistory.map((point: PriceHistoryPoint) => formatDate(point.time));
        const data = priceHistory.map((point: PriceHistoryPoint) => parseFloat(point.priceUsd));

        return {
            labels,
            datasets: [
                {
                    label: 'Precio USD',
                    data,
                    fill: true,
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderColor: 'rgba(37, 99, 235, 0.8)',
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: 'rgba(37, 99, 235, 1)',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                },
            ],
        };
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                borderColor: 'rgba(37, 99, 235, 0.2)',
                borderWidth: 1,
                callbacks: {
                    title: (context) => {
                        return context[0].label || '';
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    maxRotation: 0,
                    maxTicksLimit: 8,
                },
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    callback: (value) => `${(value as number).toLocaleString()}`,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-600">
                    <XCircle size={20} />
                    <p>{error}</p>
                </div>
            )}
            
            {crypto && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {crypto.name} ({crypto.symbol})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <p className="text-sm font-medium text-gray-500 mb-2">Precio Actual</p>
                            <p className="text-3xl font-bold text-gray-900">
                                ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <p className="text-sm font-medium text-gray-500 mb-2">Tendencia 24h</p>
                            <p className={`text-3xl font-bold ${crypto.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {crypto.trend >= 0 ? '+' : ''}{crypto.trend.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {priceHistory && (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-medium text-gray-900 mb-6">
                                Evolución del Precio
                            </h3>
                            <div className="h-[400px]">
                                <Line 
                                    key={crypto?.id} 
                                    data={formatDataForChart()} 
                                    options={chartOptions}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {onFetching && (
                <div className="space-y-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-100 rounded-lg p-6 h-32"/>
                        <div className="bg-gray-100 rounded-lg p-6 h-32"/>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-6 h-[400px]"/>
                </div>
            )}
        </div>
    );
};

export default CryptoDetails;