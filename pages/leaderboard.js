import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import Image from 'next/image';

export default function LeaderboardPage() {
  const [models, setModels] = useState([]);
  const [topImages, setTopImages] = useState([]);
  const [modelImages, setModelImages] = useState({});
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
        
        // Get one image for each model for the avatar
        const modelImagesMap = {};
        const allImages = imagesData.images || [];
        
        // Create a map of modelId -> imageUrl
        sortedModels.forEach(model => {
          // Find the first image for this model
          const modelImage = allImages.find(img => img.modelId === model._id);
          if (modelImage) {
            modelImagesMap[model._id] = modelImage.url;
          } else {
            // Try to find any image by this model by username if available
            if (model.username) {
              const imageByUsername = allImages.find(img => 
                img.modelUsername === model.username || img.modelName === model.username
              );
              if (imageByUsername) {
                modelImagesMap[model._id] = imageByUsername.url;
              }
            }
            // We'll handle models with no images in the UI with a fallback avatar
          }
        });
        
        setModels(sortedModels);
        setTopImages(imagesData.images || []);
        setModelImages(modelImagesMap);
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
        <title>leaderboard | hot girl shit</title>
        <meta name="description" content="view the highest ranked models and images" />
      </Head>
      
      <div className="min-h-screen pt-8 pb-12">
        <div className="container mx-auto px-4">
          {/* Header Section with Cyberpunk Styling */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-cyber-pink to-cyber-yellow inline-block mb-2">
              LEADERBOARD
            </h1>
            <div className="max-w-xl mx-auto relative">
              <p className="text-center text-white/70 mb-2">
                See which models and images are rated the highest based on your votes.
                ELO ratings update after each comparison.
              </p>
              {/* Decorative line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
            </div>
          </div>
          
          <div className="card-neo rounded-xl overflow-hidden mb-12 max-w-5xl mx-auto relative">
            {/* Decorative elements */}
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-cyber-pink/20 blur-xl"></div>
            <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-cyber-blue/20 blur-xl"></div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-white/10 relative">
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
              
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 relative overflow-hidden ${
                  selectedTab === 'models'
                    ? 'text-cyber-blue' 
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setSelectedTab('models')}
              >
                <span className="relative z-10">TOP MODELS</span>
                {selectedTab === 'models' && (
                  <>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-blue"></div>
                    <div className="absolute inset-0 bg-cyber-blue/10"></div>
                  </>
                )}
              </button>
              
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 relative overflow-hidden ${
                  selectedTab === 'images'
                    ? 'text-cyber-pink' 
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setSelectedTab('images')}
              >
                <span className="relative z-10">TOP IMAGES</span>
                {selectedTab === 'images' && (
                  <>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-pink"></div>
                    <div className="absolute inset-0 bg-cyber-pink/10"></div>
                  </>
                )}
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <div className="w-16 h-16 border-t-4 border-b-4 border-cyber-pink rounded-full animate-spin"></div>
                  <div className="w-16 h-16 border-r-4 border-l-4 border-cyber-blue rounded-full animate-spin-slow absolute top-0 left-0"></div>
                  <div className="w-8 h-8 bg-gradient-to-br from-cyber-pink to-cyber-purple rounded-full absolute top-4 left-4 animate-pulse"></div>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-cyber-pink mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Error Loading Data</h3>
                <p className="text-white/60">{error}</p>
              </div>
            ) : selectedTab === 'models' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="bg-white/5">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        ELO Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Win/Loss
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Images
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {models.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-white/70">
                          No ranked models found. Start rating to see results!
                        </td>
                      </tr>
                    ) : (
                      models.map((model, index) => (
                        <tr 
                          key={model._id} 
                          className={`hover:bg-white/5 transition-all duration-300`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-bold ${
                              index === 0 ? 'text-cyber-yellow' : 
                              index === 1 ? 'text-white' : 
                              index === 2 ? 'text-cyber-pink' : 'text-white/70'
                            }`}>
                              #{index + 1}
                              {index === 0 && (
                                <span className="ml-1 inline-block animate-pulse">👑</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-white/20">
                                {modelImages[model._id] ? (
                                  <div className="relative h-10 w-10">
                                    <Image 
                                      src={modelImages[model._id]} 
                                      alt={model.username || 'Model'} 
                                      fill
                                      className="object-cover"
                                    />
                                    {index < 3 && (
                                      <div className="absolute inset-0 border rounded-full border-cyber-blue/50 animate-pulse"></div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 bg-gradient-to-br from-cyber-purple/40 to-cyber-pink/40 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border border-cyber-blue/30"></div>
                                    <span className="text-white font-bold relative z-10">
                                      {model.username ? model.username.substring(0, 1).toUpperCase() : '?'}
                                    </span>
                                    {index < 3 && (
                                      <div className="absolute inset-0 border rounded-full border-cyber-blue/50 animate-pulse"></div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{model.username || 'unknown'}</div>
                                {model.instagram && (
                                  <div className="text-sm text-white/60">
                                    <a 
                                      href={`https://instagram.com/${model.instagram}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-cyber-pink hover:text-cyber-blue transition-colors duration-300"
                                    >
                                      @{model.instagram}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative inline-flex items-center gap-1.5 bg-gradient-to-r from-cyber-purple/30 to-cyber-blue/30 px-3 py-1 rounded-md border border-white/10">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyber-pink animate-pulse"></div>
                              <span className="text-sm font-semibold text-white tracking-wider">
                                {model.elo ? Math.round(model.elo) : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              <span className="text-cyber-green">{model.wins || 0}</span>
                              <span className="text-white/50">/</span>
                              <span className="text-cyber-pink">{model.losses || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {model.winRate !== undefined 
                                ? `${(model.winRate * 100).toFixed(1)}%` 
                                : 'N/A'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {model.imageCount || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {topImages.length === 0 ? (
                  <div className="col-span-full text-center text-white/70 py-12">
                    No rated images found. Start rating to see results!
                  </div>
                ) : (
                  topImages.map((image, index) => (
                    <div 
                      key={image._id} 
                      className="card-neo rounded-lg overflow-hidden border border-white/10 transition-all duration-300 hover:border-cyber-blue/50 hover:shadow-neon"
                    >
                      <div className="relative">
                        <img 
                          src={image.url} 
                          alt={image.name || 'Image'} 
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        
                        <div className={`absolute top-2 left-2 ${
                          index === 0 ? 'bg-gradient-to-r from-cyber-yellow to-cyber-yellow/80' : 
                          index === 1 ? 'bg-gradient-to-r from-white/90 to-white/70' : 
                          index === 2 ? 'bg-gradient-to-r from-cyber-pink to-cyber-pink/80' : 
                          'bg-gradient-to-r from-cyber-dark/80 to-cyber-dark/60'
                        } text-black text-xs font-bold px-3 py-1.5 rounded-md backdrop-blur-md border border-white/20 flex items-center`}>
                          {index < 3 && (
                            <span className="mr-1.5">
                              {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                          <span className="tracking-wider">#{index + 1}</span>
                        </div>
                        
                        {image.elo && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-cyber-purple to-cyber-blue text-white text-xs font-bold px-3 py-1.5 rounded-md backdrop-blur-md border border-white/20 shadow-neon flex items-center gap-1.5 transform hover:scale-105 transition-transform duration-300">
                            <div className="w-2 h-2 rounded-full bg-cyber-pink animate-pulse"></div>
                            <span className="tracking-wider">{Math.round(image.elo)} ELO</span>
                          </div>
                        )}
                        
                        {index < 3 && (
                          <div className="absolute inset-0 border-2 border-cyber-blue/30 mix-blend-overlay"></div>
                        )}
                      </div>
                      
                      <div className="p-4 bg-gradient-to-b from-cyber-dark/50 to-cyber-dark/90 backdrop-blur-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium truncate">{image.name || 'Untitled'}</h3>
                            {image.wins !== undefined && (
                              <div className="text-sm flex gap-2 mt-1">
                                <span className="text-cyber-green">W: {image.wins || 0}</span>
                                <span className="text-cyber-pink">L: {image.losses || 0}</span>
                              </div>
                            )}
                          </div>
                          
                          {index === 0 && (
                            <div className="text-cyber-yellow text-xl animate-pulse">🏆</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Bottom decorative line */}
            <div className="h-1 w-full bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-pink"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 