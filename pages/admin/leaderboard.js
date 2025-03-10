import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import Leaderboard from '../../components/Leaderboard';

export default function AdminLeaderboardPage() {
  return (
    <AdminLayout title="Leaderboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="card-neo p-4 rounded-lg bg-black/50 border border-pink-500/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Top Rated Content</h2>
            <Leaderboard />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 