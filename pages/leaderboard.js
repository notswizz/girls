import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function LeaderboardPage() {
  const [models, setModels] = useState([]);
  const [topImages, setTopImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('models');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch models
        const modelsResponse = await fetch('/api/models');
        if (!modelsResponse.ok) {
          throw new Error('Failed to fetch models');
        }
        const modelsData = await modelsResponse.json();
        
        // Fetch top-rated images
        const imagesResponse = await fetch('/api/images?sort=highest-elo&limit=20');
        if (!imagesResponse.ok) {
          throw new Error('Failed to fetch images');
        }
        const imagesData = await imagesResponse.json();
        
        // Sort models by ELO
        const sortedModels = modelsData.models
          .filter(model => model.elo) // Only include models with an ELO rating
          .sort((a, b) => (b.elo || 0) - (a.elo || 0));
        
        setModels(sortedModels);
        setTopImages(imagesData.images || []);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Leaderboard | Hot or Not</title>
        <meta name="description" content="View the highest ranked models and images" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Leaderboard
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            See which models and images are rated the highest based on your votes. 
            ELO ratings update after each comparison.
          </p>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 max-w-5xl mx-auto">
            <div className="flex border-b">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  selectedTab === 'models'
                    ? 'text-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setSelectedTab('models')}
              >
                Top Models
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  selectedTab === 'images'
                    ? 'text-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setSelectedTab('images')}
              >
                Top Images
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Error Loading Data</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : selectedTab === 'models' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ELO Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Win/Loss
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Images
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No ranked models found. Start rating to see results!
                        </td>
                      </tr>
                    ) : (
                      models.map((model, index) => (
                        <tr key={model._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">#{index + 1}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-800 font-bold">
                                  {model.name.substring(0, 1).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{model.name}</div>
                                {model.instagram && (
                                  <div className="text-sm text-gray-500">
                                    <a 
                                      href={`https://instagram.com/${model.instagram}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-pink-500 hover:text-pink-700"
                                    >
                                      @{model.instagram}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {model.elo ? Math.round(model.elo) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {model.wins || 0}/{model.losses || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {model.winRate !== undefined 
                                ? `${(model.winRate * 100).toFixed(1)}%` 
                                : 'N/A'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {model.imageCount || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
                {topImages.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-12">
                    No rated images found. Start rating to see results!
                  </div>
                ) : (
                  topImages.map((image, index) => (
                    <div key={image._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                      <div className="relative">
                        <img 
                          src={image.url} 
                          alt={image.name || 'Image'} 
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                          #{index + 1}
                        </div>
                        {image.elo && (
                          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {Math.round(image.elo)} ELO
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {image.modelName || 'Unknown Model'}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                            {image.wins && (image.wins + image.losses) > 0
                              ? `${((image.wins / (image.wins + image.losses)) * 100).toFixed(1)}% wins`
                              : 'No ratings'
                            }
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>Wins: <span className="text-green-600 font-medium">{image.wins || 0}</span></div>
                          <div>Losses: <span className="text-red-600 font-medium">{image.losses || 0}</span></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Link
              href="/rate"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300"
            >
              Rate More Images
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 