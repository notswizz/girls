import { useState, useEffect, useMemo } from 'react';
import { FaTrophy, FaCrown, FaStar, FaSort, FaSortUp, FaSortDown, FaFire } from 'react-icons/fa';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [modelLeaderboard, setModelLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeTab, setActiveTab] = useState('models');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Fetch images leaderboard with Wilson score
        // Use minRatings=1 so the leaderboard isn't empty right after a fresh reset
        const imageResponse = await fetch('/api/scores/leaderboard?type=images&limit=50&minRatings=1');
        
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image leaderboard');
        }
        
        const imageData = await imageResponse.json();
        setLeaderboard(imageData.leaderboard || []);
        
        // Fetch model leaderboard with Wilson score
        const modelResponse = await fetch('/api/scores/leaderboard?type=models&limit=50&minRatings=1');
        
        if (modelResponse.ok) {
          const modelData = await modelResponse.json();
          setModelLeaderboard(modelData.leaderboard || []);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-cyber-blue" /> : <FaSortDown className="text-cyber-blue" />;
  };

  // Get current data based on active tab
  const currentData = useMemo(() => {
    const data = activeTab === 'images' ? leaderboard : modelLeaderboard;
    
    // Sort data
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle special cases
      if (sortField === 'createdAt' || sortField === 'lastLoginAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Handle null/undefined values
      if (aValue === undefined || aValue === null) aValue = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bValue === undefined || bValue === null) bValue = sortDirection === 'asc' ? Infinity : -Infinity;
      
      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTab, leaderboard, modelLeaderboard, sortField, sortDirection]);

  // Get score color based on Wilson score (0-1000)
  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400';
    if (score >= 700) return 'text-amber-400'; // Gold - top tier
    if (score >= 550) return 'text-purple-400'; // Purple - great
    if (score >= 400) return 'text-cyan-400'; // Cyan - good
    return 'text-gray-300'; // Default
  };

  // Get tier name based on Wilson score
  const getScoreTier = (score) => {
    if (!score) return 'Unranked';
    if (score >= 700) return '🔥 Elite';
    if (score >= 550) return '⭐ Hot';
    if (score >= 400) return '👍 Solid';
    if (score >= 250) return '📈 Rising';
    return '🆕 New';
  };

  // Get ELO rank color class (kept for secondary display)
  const getEloRankColor = (elo) => {
    if (!elo) return 'text-gray-400';
    if (elo >= 1800) return 'text-amber-400';
    if (elo >= 1600) return 'text-purple-400';
    if (elo >= 1400) return 'text-cyan-400';
    return 'text-gray-300';
  };

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

  if (
    (activeTab === 'images' && !leaderboard.length) || 
    (activeTab === 'models' && !modelLeaderboard.length)
  ) {
    return (
      <div className="card-neo p-6 rounded-lg text-center">
        <div className="text-white mb-2">No rankings yet</div>
        <div className="text-white/60 text-sm">
          Go vote a few times on <span className="text-white/80">Rate</span> and your leaderboard will fill up.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs for filtering */}
      <div className="mb-4">
        {/* Mobile segmented control */}
        <div className="sm:hidden grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-900/60 border border-white/10">
          <button
            onClick={() => setActiveTab('models')}
            className={`py-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'models'
                ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white'
                : 'bg-transparent text-gray-300'
            }`}
          >
            <FaCrown className="inline-block mr-2" />
            Models
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'images'
                ? 'bg-gradient-to-r from-cyber-pink to-cyber-purple text-white'
                : 'bg-transparent text-gray-300'
            }`}
          >
            <FaStar className="inline-block mr-2" />
            Photos
          </button>
        </div>

        {/* Desktop tabs */}
        <div className="hidden sm:flex space-x-2">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'models' 
              ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FaCrown className="inline-block mr-2" />
          Models
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'images' 
              ? 'bg-gradient-to-r from-cyber-pink to-cyber-purple text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FaStar className="inline-block mr-2" />
          Images
        </button>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {currentData.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl bg-gray-900/80 border border-white/10 overflow-hidden"
          >
            <div className="p-4 flex items-center gap-3">
              {/* rank */}
              <div className="w-10 flex items-center justify-center">
                {index < 3 ? (
                  <FaTrophy
                    className={`text-lg ${
                      index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : 'text-amber-700'
                    }`}
                  />
                ) : (
                  <span className="text-gray-400 text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              {/* thumb / icon */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <FaCrown className="text-pink-400 text-xl" />
                )}
              </div>

              {/* title */}
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold truncate">
                  {item.name || item.username || 'Unknown'}
                </div>
                <div className="text-xs text-white/50 truncate">
                  {activeTab === 'images'
                    ? item.modelUsername
                      ? `@${item.modelUsername}`
                      : item.modelName || ''
                    : `Top ${item.imagesUsed || 0} pics`}
                </div>
              </div>

              {/* score */}
              <div className="text-right">
                <div className={`text-xl font-extrabold leading-none ${getScoreColor(item.score)}`}>
                  {item.score || 0}
                </div>
                <div className="text-[11px] text-white/50">{getScoreTier(item.score)}</div>
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>{Math.round((item.winRate || 0) * 100)}% win</span>
                <span>
                  {activeTab === 'models'
                    ? `${item.totalWins || 0}-${item.totalLosses || 0}`
                    : `${item.wins || 0}-${item.losses || 0}`}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.round((item.winRate || 0) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {activeTab === 'models' ? 'Model' : 'Photo'}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center">
                    <span>Score</span>
                    <span className="ml-1">{getSortIcon('score')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('winRate')}
                >
                  <div className="flex items-center">
                    <span>Win %</span>
                    <span className="ml-1">{getSortIcon('winRate')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hidden sm:table-cell"
                  onClick={() => handleSort('wins')}
                >
                  <div className="flex items-center">
                    <span>Record</span>
                    <span className="ml-1">{getSortIcon('wins')}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {index < 3 ? (
                        <div className="flex justify-center">
                          {index === 0 && <FaTrophy className="text-amber-400 text-lg" />}
                          {index === 1 && <FaTrophy className="text-gray-300 text-lg" />}
                          {index === 2 && <FaTrophy className="text-amber-700 text-lg" />}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 text-sm">{index + 1}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.url && (
                          <div className="flex-shrink-0 h-16 w-16 mr-4">
                            <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-700 border border-white/10">
                              <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          </div>
                        )}
                        {!item.url && activeTab === 'models' && (
                          <div className="flex-shrink-0 h-16 w-16 mr-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
                            <FaCrown className="text-pink-400 text-xl" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">
                            {item.name || item.username || 'Unknown'}
                          </div>
                          {activeTab === 'models' && (
                            <div className="text-xs text-gray-500">
                              {item.imagesUsed || item.imageCount || 0} pics rated
                            </div>
                          )}
                          {activeTab === 'images' && item.modelUsername && (
                            <div className="text-xs text-gray-500">
                              @{item.modelUsername}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                        {item.score || 0}
                      </div>
                      <div className="text-xs text-gray-500">{getScoreTier(item.score)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${Math.round((item.winRate || 0) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium">
                          {Math.round((item.winRate || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                      <span className="text-green-400 font-medium">{item.wins || item.totalWins || 0}</span>
                      <span className="mx-1 text-gray-600">-</span>
                      <span className="text-red-400 font-medium">{item.losses || item.totalLosses || 0}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
