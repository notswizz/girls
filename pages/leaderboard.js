import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Leaderboard
      </h1>
      
      <Leaderboard />
    </div>
  );
} 