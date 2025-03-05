import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Leaderboard
      </h1>
      
      <Leaderboard />
    </div>
  );
} 