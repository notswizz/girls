import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

export default function MarketCard({ model, onReveal }) {
  if (!model) return null;

  // Use username as main label
  const username = model.username || 'unknown';
  const profileImg = model.profileImg || '/placeholder.png';
  const elo = Math.round(model.elo || 1200);
  const eloHistory = Array.isArray(model.eloHistory) ? model.eloHistory : [];

  // Prepare chart data (last 20 points)
  const chartData = {
    labels: eloHistory.slice(-20).map(point => {
      const d = new Date(point.timestamp);
      return `${d.getMonth()+1}/${d.getDate()}`;
    }),
    datasets: [
      {
        label: 'ELO Price',
        data: eloHistory.slice(-20).map(point => point.elo),
        fill: false,
        borderColor: '#a855f7',
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };
  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    elements: { line: { borderWidth: 3 } },
    responsive: true,
    maintainAspectRatio: false,
    tooltips: { enabled: false },
  };

  // Price movement indicator
  let priceDelta = null;
  if (eloHistory.length > 1) {
    const prev = eloHistory[eloHistory.length - 2].elo;
    if (elo > prev) priceDelta = 'up';
    else if (elo < prev) priceDelta = 'down';
  }

  return (
    <div className="bg-white/80 rounded-xl shadow-lg p-5 flex flex-col items-center market-card">
      <img src={profileImg} alt={username} className="w-20 h-20 rounded-full border-4 border-cyber mb-2" />
      <div className="text-lg font-bold text-cyber mb-1">@{username}</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-semibold text-gray-900">{elo}</span>
        {priceDelta === 'up' && <FaArrowTrendUp className="text-green-500" />}
        {priceDelta === 'down' && <FaArrowTrendDown className="text-red-500" />}
      </div>
      <div className="w-full h-16">
        <Line data={chartData} options={chartOptions} />
      </div>
      <button
        className="mt-4 px-4 py-2 bg-cyber text-white rounded-lg font-semibold hover:bg-cyber-dark transition"
        onClick={() => onReveal(model)}
      >
        Reveal Instagram
      </button>
    </div>
  );
}
