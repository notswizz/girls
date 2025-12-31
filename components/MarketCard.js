import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
import { FaArrowTrendUp, FaArrowTrendDown, FaStar, FaBolt } from 'react-icons/fa6';
import ModelStatsCard from './ModelStatsCard';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

export default function MarketCard({ model }) {
  if (!model) return null;

  // Use username as main label
  const username = model.username || 'unknown';
  const profileImg = model.profileImg || '/placeholder.png';
  const elo = Math.round(model.elo || 1200);
  const eloHistory = Array.isArray(model.eloHistory) ? model.eloHistory : [];
  const winStreak = model.stats?.winStreak || 0;
  const volatility = model.stats?.volatility || null;
  const isTopPerformer = model.stats?.rank === 1;

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
        fill: true,
        borderColor: '#a855f7',
        backgroundColor: ctx => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 70);
          gradient.addColorStop(0, 'rgba(168,85,247,0.35)');
          gradient.addColorStop(1, 'rgba(255,255,255,0.05)');
          return gradient;
        },
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };
  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: ctx => `ELO: ${ctx.parsed.y}`,
        },
        backgroundColor: '#a855f7',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
      },
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    elements: { line: { borderWidth: 3 } },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Price movement indicator
  let priceDelta = null;
  if (eloHistory.length > 1) {
    const prev = eloHistory[eloHistory.length - 2].elo;
    if (elo > prev) priceDelta = 'up';
    else if (elo < prev) priceDelta = 'down';
  }

  return (
    <div className="bg-white/80 rounded-xl shadow-lg p-5 flex flex-col items-center market-card card-glass-hover transition-all duration-300 hover:scale-105 relative">
      <img src={profileImg} alt={username} className="w-20 h-20 rounded-full border-4 border-cyber mb-2 shimmer" />
      <div className="text-lg font-bold text-cyber mb-1 flex items-center gap-2">
        @{username}
        {isTopPerformer && <FaStar className="text-yellow-400 animate-bounce" title="Top Performer" />}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-semibold text-gray-900">{elo}</span>
        {priceDelta === 'up' && <FaArrowTrendUp className="text-green-500 icon-pulse" />}
        {priceDelta === 'down' && <FaArrowTrendDown className="text-red-500 icon-pulse" />}
      </div>
      <div className="w-full h-16 mb-2">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="flex gap-3 mb-2">
        {winStreak > 2 && (
          <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold"><FaBolt className="mr-1" /> {winStreak} win streak</span>
        )}
        {volatility && (
          <span className="flex items-center px-2 py-1 bg-cyber-blue/10 text-cyber-blue rounded text-xs font-semibold">Volatility: {volatility.toFixed(2)}</span>
        )}
      </div>
      <div className="w-full mb-2">
        <ModelStatsCard model={model} />
      </div>
    </div>
  );
}
