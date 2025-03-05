import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ComparisonSwiper from '../components/ComparisonSwiper';
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
      // Now only get 2 images instead of 3
      const response = await fetch('/api/images?count=2');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (!data.images || data.images.length < 2) {
        throw new Error('Not enough images available');
      }
      
      // Log the images to verify they're from different models
      console.log('Fetched images:', data.images);
      
      // Check if we have duplicate models
      const modelIds = data.images.map(img => img.modelId);
      const uniqueModelIds = [...new Set(modelIds)];
      
      if (uniqueModelIds.length < modelIds.length) {
        console.warn('Warning: Some images are from the same model', {
          modelIds,
          uniqueModelIds
        });
      } else {
        console.log('Success: All images are from different models');
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

  // Handle submission of comparison
  const handleSubmitComparison = async ({ winnerId, loserId }) => {
    try {
      const response = await fetch('/api/scores/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winnerId, loserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit comparison');
      }
      
      // Show success message
      setSuccess(true);
      
      // Reset after 1 second and fetch new images
      setTimeout(() => {
        setSuccess(false);
        fetchImages();
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting comparison:', err);
      setError(err.message);
    }
  };

  return (
    <Layout title="Compare">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Image Comparison
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Choose which image you prefer. Your selections help determine which models produce the most appealing results.
          </p>
        </div>
        
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
          <ComparisonSwiper 
            images={images} 
            onSubmitComparison={handleSubmitComparison}
          />
        )}
      </div>
    </Layout>
  );
} 