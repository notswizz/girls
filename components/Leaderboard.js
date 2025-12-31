import { useState, useEffect, useMemo } from 'react';
import { FaTrophy, FaCrown, FaStar, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [modelLeaderboard, setModelLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('elo');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeTab, setActiveTab] = useState('models');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // Fetch images leaderboard
        const imageResponse = await fetch('/api/scores/leaderboard');
        
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image leaderboard');
        }
        
        const imageData = await imageResponse.json();
        
        // Add type field to image entries to distinguish them
        const imageEntries = (imageData.leaderboard || []).map(item => ({
          ...item,
          type: 'image',
          // If the API doesn't provide these fields, add default values
          wins: item.wins || 0,
          losses: item.losses || 0,
          winRate: item.winRate || 0,
          elo: item.elo || 1200
        }));
        
        setLeaderboard(imageEntries);
        
        // Fetch model stats
        const modelResponse = await fetch('/api/scores/rank');
        
        if (modelResponse.ok) {
          const modelData = await modelResponse.json();
          
          // Add type field to model entries to distinguish them
          const modelEntries = (modelData.models || []).map(model => ({
            id: model._id || model.id,
            name: model.name,
            type: 'model',
            elo: model.elo || 1200,
            wins: model.wins || 0,
            losses: model.losses || 0,
            winRate: model.winRate || 0,
            imageCount: model.imageCount
          }));
          
          setModelLeaderboard(modelEntries);
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

  // Get ELO rank color class
  const getEloRankColor = (elo) => {
    if (!elo) return 'text-gray-400';
    if (elo >= 1800) return 'text-amber-400'; // Gold
    if (elo >= 1600) return 'text-purple-400'; // Purple
    if (elo >= 1400) return 'text-cyan-400'; // Cyan
    return 'text-gray-300'; // Default
  };

  // Get ELO rank name
  const getEloRankName = (elo) => {
    if (!elo) return 'Unranked';
    if (elo >= 1800) return 'Elite';
    if (elo >= 1600) return 'Pro';
    if (elo >= 1400) return 'Expert';
    if (elo >= 1200) return 'Advanced';
    return 'Beginner';
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
        <div className="text-white mb-2">No data available for {activeTab}</div>
        <div className="text-white/60 text-sm">Check back after more ratings have been submitted</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs for filtering */}
      <div className="flex space-x-2 mb-4">
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

      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {activeTab === 'models' ? 'Model' : 'Image'}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('elo')}
                >
                  <div className="flex items-center">
                    <span>ELO</span>
                    <span className="ml-1">{getSortIcon('elo')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('winRate')}
                >
                  <div className="flex items-center">
                    <span>Win Rate</span>
                    <span className="ml-1">{getSortIcon('winRate')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('wins')}
                >
                  <div className="flex items-center">
                    <span>W/L</span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {index < 3 ? (
                        <div className="flex justify-center">
                          {index === 0 && <FaTrophy className="text-amber-400 text-lg" />}
                          {index === 1 && <FaTrophy className="text-gray-300 text-lg" />}
                          {index === 2 && <FaTrophy className="text-amber-700 text-lg" />}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">{index + 1}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.url && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <div className="h-10 w-10 rounded overflow-hidden bg-gray-700">
                              <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          </div>
                        )}
                        {!item.url && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3 rounded bg-gray-700 flex items-center justify-center">
                            {item.type === 'model' ? (
                              <FaCrown className="text-gray-400" />
                            ) : (
                              <FaStar className="text-gray-400" />
                            )}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">
                            {item.name || 'Unknown'}
                          </div>
                          {activeTab === 'models' && item.imageCount !== undefined && (
                            <div className="text-xs text-gray-400">
                              {item.imageCount} {item.imageCount === 1 ? 'image' : 'images'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${getEloRankColor(item.elo)}`}>{Math.round(item.elo || 1200)}</div>
                      <div className="text-xs text-gray-400">{getEloRankName(item.elo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-cyber-pink to-cyber-purple h-2.5 rounded-full"
                          style={{ width: `${Math.round((item.winRate || 0) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {Math.round((item.winRate || 0) * 100)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className="text-green-400">{item.wins || 0}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-400">{item.losses || 0}</span>
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
