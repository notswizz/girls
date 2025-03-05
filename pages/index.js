import { useState, useEffect } from 'react';
import Head from "next/head";
import RatingCard from '../components/RatingCard';

export default function Home() {
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch a new image to rate
  const fetchNewImage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/images?limit=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        setCurrentImage(data.images[0]);
      } else {
        setCurrentImage(null);
        setError('No more images to rate');
      }
    } catch (err) {
      console.error('Error fetching image:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit a rating
  const handleRate = async (imageId, score) => {
    try {
      const response = await fetch('/api/scores/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          score,
          // In a real app, you'd use a real user ID from authentication
          userId: 'anonymous-' + Math.random().toString(36).substring(2, 9),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      // Fetch the next image
      fetchNewImage();
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.message);
    }
  };

  // Skip the current image
  const handleSkip = () => {
    fetchNewImage();
  };

  // Fetch the first image on component mount
  useEffect(() => {
    fetchNewImage();
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Rate 1-3
      </h1>
      
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-pulse text-pink-500">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchNewImage}
            className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : currentImage ? (
        <RatingCard 
          image={currentImage} 
          onRate={handleRate} 
          onSkip={handleSkip} 
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No images available to rate.</p>
          <button 
            onClick={fetchNewImage}
            className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
