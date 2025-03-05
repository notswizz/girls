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
        <div className="relative">
          <div className="w-12 h-12 border-t-4 border-b-4 border-cyber-pink rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-r-4 border-l-4 border-cyber-blue rounded-full animate-spin-slow absolute top-0 left-0"></div>
          <div className="w-6 h-6 bg-gradient-to-br from-cyber-pink to-cyber-purple rounded-full absolute top-3 left-3 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-neo p-4 rounded-lg text-center border-2 border-cyber-pink">
        <div className="text-cyber-pink font-bold mb-1">ERROR</div>
        <div className="text-white">{error}</div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="card-neo p-6 rounded-lg text-center border border-cyber-blue/30">
        <div className="text-cyber-blue text-xl mb-2">Leaderboard Empty</div>
        <div className="text-white/70">No entries in the leaderboard yet. Start rating to see results!</div>
      </div>
    );
  }

  return (
    <div className="card-neo rounded-xl overflow-hidden relative backdrop-blur-lg">
      {/* Decorative elements */}
      <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-cyber-pink/20 blur-xl"></div>
      <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-cyber-blue/20 blur-xl"></div>

      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold text-center py-4 bg-gradient-to-r from-cyber-purple to-cyber-pink text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-glitter opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
        <span className="relative z-10 text-shadow-neon">TOP RATED</span>
      </h2>
      
      <div className="divide-y divide-white/10">
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.id} 
            className={`flex items-center p-3 sm:p-4 hover:bg-white/5 transition-all duration-300 relative ${
              index === 0 ? 'bg-gradient-to-r from-cyber-yellow/10 to-transparent' : ''
            }`}
          >
            {/* Rank indicator */}
            <div className={`font-bold text-xl sm:text-2xl w-10 sm:w-12 text-center relative ${
              index === 0 ? 'text-cyber-yellow' : 
              index === 1 ? 'text-white' : 
              index === 2 ? 'text-cyber-pink' : 'text-white/70'
            }`}>
              {index === 0 && (
                <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full border border-cyber-yellow animate-pulse"></div>
              )}
              {entry.rank}
            </div>
            
            {/* Profile image */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0 border-2 border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/30 to-cyber-pink/30 z-10 mix-blend-overlay"></div>
              <Image
                src={entry.url}
                alt={entry.name || `Rank #${entry.rank}`}
                fill
                sizes="(max-width: 768px) 48px, 64px"
                className="object-cover"
              />
              {index < 3 && (
                <div className="absolute inset-0 border-2 rounded-full border-cyber-blue animate-pulse"></div>
              )}
            </div>
            
            {/* Name and info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                <div className="text-lg font-semibold text-white group-hover:text-cyber-blue transition-colors duration-300">
                  {entry.name}
                  {entry.modelUsername && (
                    <span className="text-sm text-white/50 ml-2">
                      @{entry.modelUsername}
                    </span>
                  )}
                </div>
                {entry.description && (
                  <p className="text-white/60 text-xs sm:text-sm truncate">{entry.description}</p>
                )}
              </h3>
            </div>
            
            {/* Score */}
            <div className="text-right ml-2 flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold">
                <span className={`${
                  index === 0 ? 'text-cyber-yellow' : 
                  index === 1 ? 'text-white' : 
                  index === 2 ? 'text-cyber-pink' : 'text-cyber-blue'
                }`}>
                  {entry.averageScore.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-white/50">
                {entry.timesRated} {entry.timesRated === 1 ? 'rating' : 'ratings'}
              </div>
            </div>

            {/* Special effects for top entries */}
            {index === 0 && (
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-cyber-yellow via-transparent to-cyber-yellow"></div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom decorative line */}
      <div className="h-1 w-full bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-pink"></div>
    </div>
  );
} 