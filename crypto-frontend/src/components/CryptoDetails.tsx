import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { Line } from 'react-chartjs-2'; 

const CryptoDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [crypto, setCrypto] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCryptoDetails = async () => {
            try {
                const token = getToken();

                if (!token) {
                    throw new Error('No se encontró el token de autenticación');
                }

                const cryptoResponse = await axios.get(`http://localhost:3001/api/cryptos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCrypto(cryptoResponse.data);
            } catch (error) {
                setError('Error al obtener los detalles de la criptomoneda');
                console.error('Error:', error);
            }
        };

        fetchCryptoDetails();
    }, [id]);

    const formatDataForChart = () => {
        if (!crypto.priceHistory) return { labels: [], datasets: [] };

        const labels = crypto.priceHistory.map((point: any) => new Date(point.date).toLocaleDateString());
        const data = crypto.priceHistory.map((point: any) => parseFloat(point.priceUsd));

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
                    <h2 className="text-2xl font-bold mb-4">{crypto.name} ({crypto.symbol})</h2>
                    <p>Precio Actual: ${crypto.price}</p>
                    <p>Tendencia: {crypto.trend}%</p>

                    {crypto.priceHistory && (
                        <div className="mt-6">
                            <h3 className="text-xl font-bold mb-2">Evolución del Precio (Últimos 6 meses)</h3>
                            <Line data={formatDataForChart()} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CryptoDetails;

