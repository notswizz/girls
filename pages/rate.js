import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RankingSwiper from '../components/RankingSwiper';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RatePage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch random images from different models
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/images?count=3');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (!data.images || data.images.length < 3) {
        throw new Error('Not enough images available');
      }
      
      setImages(data.images);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load images on initial page load
  useEffect(() => {
    fetchImages();
  }, []);

  // Handle submission of rankings
  const handleSubmitRankings = async (rankings) => {
    try {
      const response = await fetch('/api/scores/rank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rankings }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rankings');
      }
      
      // Show success message
      setSuccess(true);
      
      // Reset after 1 second and fetch new images
      setTimeout(() => {
        setSuccess(false);
        fetchImages();
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting rankings:', err);
      setError(err.message);
    }
  };

  return (
    <Layout title="Rank">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center max-w-md mx-auto">
            <div className="text-red-500 mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Error Loading Images</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchImages}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
            >
              Try Again
            </button>
          </div>
        ) : success ? (
          <div className="flex justify-center items-center h-80">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <RankingSwiper 
            images={images} 
            onSubmitRankings={handleSubmitRankings}
          />
        )}
      </div>
    </Layout>
  );
} 