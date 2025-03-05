import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/scores/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse text-pink-500">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
        Error: {error}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        No entries in the leaderboard yet. Start rating to see results!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold text-center py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
        Top Rated
      </h2>
      
      <div className="divide-y divide-gray-100">
        {leaderboard.map((entry) => (
          <div key={entry.id} className="flex items-center p-3 sm:p-4 hover:bg-gray-50">
            <div className="font-bold text-xl sm:text-2xl text-pink-500 w-8 sm:w-12 text-center">
              {entry.rank}
            </div>
            
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
              <Image
                src={entry.url}
                alt={entry.name || `Rank #${entry.rank}`}
                fill
                sizes="(max-width: 768px) 48px, 64px"
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                <div className="text-lg font-semibold">
                  {entry.name}
                  {entry.modelUsername && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({entry.modelUsername})
                    </span>
                  )}
                </div>
                {entry.description && (
                  <p className="text-gray-500 text-xs sm:text-sm truncate">{entry.description}</p>
                )}
              </h3>
            </div>
            
            <div className="text-right ml-2 flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold text-pink-500">
                {entry.averageScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">
                {entry.timesRated} {entry.timesRated === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 