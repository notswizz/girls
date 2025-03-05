import React from 'react';

export default function ModelStatsCard({ model }) {
  if (!model) return null;
  
  // Calculate win rate percentage
  const winRate = model.winRate !== undefined 
    ? `${(model.winRate * 100).toFixed(1)}%` 
    : 'N/A';
  
  // Format ELO rating
  const elo = model.elo ? Math.round(model.elo) : 'N/A';
  
  // Get stats from model if available
  const stats = model.stats || {};
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          {model.username || 'unknown'} statistics
        </h3>
        
        <div className="mt-2 sm:mt-0 flex space-x-2">
          {model.instagram && (
            <a 
              href={`https://instagram.com/${model.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-700"
              title={`@${model.instagram} on Instagram`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          )}
          
          {model.twitter && (
            <a 
              href={`https://twitter.com/${model.twitter}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600"
              title={`@${model.twitter} on Twitter`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          )}
          
          {model.onlyfans && (
            <a 
              href={model.onlyfans.startsWith('http') ? model.onlyfans : `https://onlyfans.com/${model.onlyfans}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
              title="OnlyFans"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5c-5.799 0-10.5-4.701-10.5-10.5S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5z" />
                <path d="M15.75 12c0-2.071-1.679-3.75-3.75-3.75-2.071 0-3.75 1.679-3.75 3.75s1.679 3.75 3.75 3.75c2.071 0 3.75-1.679 3.75-3.75z" />
              </svg>
            </a>
          )}
        </div>
      </div>
      
      {model.description && (
        <p className="text-gray-600 text-sm mb-4">{model.description}</p>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Total Images</div>
          <div className="text-2xl font-semibold text-gray-800">
            {stats.totalImages || model.imageCount || 0}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">ELO Rating</div>
          <div className="text-2xl font-semibold text-gray-800">
            {elo}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Win/Loss</div>
          <div className="text-2xl font-semibold text-gray-800">
            {model.wins || 0}/{model.losses || 0}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Win Rate</div>
          <div className="text-2xl font-semibold text-gray-800">
            {winRate}
          </div>
        </div>
      </div>
      
      {stats.totalWins !== undefined && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Rated Images</div>
            <div className="text-xl font-semibold text-gray-800">
              {stats.ratedImages || 0}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Avg. Image ELO</div>
            <div className="text-xl font-semibold text-gray-800">
              {stats.averageElo ? Math.round(stats.averageElo) : 'N/A'}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Highest Image ELO</div>
            <div className="text-xl font-semibold text-gray-800">
              {stats.highestElo ? Math.round(stats.highestElo) : 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 