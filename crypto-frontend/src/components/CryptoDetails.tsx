import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { XCircle } from "lucide-react";
import useCryptoData from "../hooks/useCryptoData";

Chart.register(...registerables);

const CryptoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cryptos, error } = useCryptoData();
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  const crypto = cryptos.find((c) => c.id === id);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`https://api.coincap.io/v2/assets/${id}/history?interval=d1`);
        setPriceHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    if (id) fetchHistory();
  }, [id]);

  const formatDataForChart = () => {
    if (!priceHistory) return { labels: [], datasets: [] };

    const labels = priceHistory.map((point: any) => new Date(point.time * 1000).toLocaleDateString());
    const data = priceHistory.map((point: any) => parseFloat(point.priceUsd));

    return {
      labels,
      datasets: [
        {
          label: "Precio USD",
          data,
          fill: true,
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          borderColor: "rgba(37, 99, 235, 0.8)",
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: "rgba(37, 99, 235, 1)",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#1e293b",
        bodyColor: "#1e293b",
        borderColor: "rgba(37, 99, 235, 0.2)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as "index",
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
                ${crypto.price?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Tendencia 24h</p>
              <p className={`text-3xl font-bold ${crypto.trend && crypto.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {crypto.trend && crypto.trend >= 0 ? "+" : ""}
                {crypto.trend?.toFixed(2)}%
              </p>
            </div>
          </div>

          {priceHistory && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-6">Evolución del Precio</h3>
              <div className="h-[400px]">
                <Line key={crypto?.id} data={formatDataForChart()} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CryptoDetails;
