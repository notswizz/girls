import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ModelEditForm from '../../../../components/ModelEditForm';
import ModelStatsCard from '../../../../components/ModelStatsCard';
import AdminLayout from '../../../../components/AdminLayout';

export default function ModelDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [model, setModel] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch model details
  useEffect(() => {
    if (!id) return;
    
    const fetchModelDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch model data
        const modelRes = await fetch(`/api/models/${id}`);
        if (!modelRes.ok) {
          throw new Error(`Failed to fetch model: ${modelRes.statusText}`);
        }
        
        const modelData = await modelRes.json();
        setModel(modelData.model);
        
        // Fetch images associated with this model
        const imagesRes = await fetch(`/api/images?modelId=${id}`);
        if (!imagesRes.ok) {
          throw new Error(`Failed to fetch images: ${imagesRes.statusText}`);
        }
        
        const imagesData = await imagesRes.json();
        setImages(imagesData.images || []);
      } catch (err) {
        console.error('Error fetching model details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModelDetails();
  }, [id]);

  // Handle model delete
  const handleDeleteModel = async () => {
    if (!id || !deleteConfirm) return;
    
    try {
      const res = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete model: ${res.statusText}`);
      }
      
      // Navigate back to models list
      router.push('/admin');
    } catch (err) {
      console.error('Error deleting model:', err);
      setError(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };
  
  // Handle image delete
  const handleDeleteImage = async (imageId) => {
    try {
      const res = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete image: ${res.statusText}`);
      }
      
      // Update images list by removing the deleted image
      setImages(images.filter(img => img._id !== imageId));
      
      // Update model's imageCount if available
      if (model && model.imageCount !== undefined) {
        setModel({
          ...model,
          imageCount: model.imageCount - 1
        });
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err.message);
    }
  };
  
  // Handle sorting images
  const sortImages = (images) => {
    if (!images || !images.length) return [];
    
    switch (sortBy) {
      case 'newest':
        return [...images].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return [...images].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest-elo':
        return [...images].sort((a, b) => (b.elo || 0) - (a.elo || 0));
      case 'lowest-elo':
        return [...images].sort((a, b) => (a.elo || 0) - (b.elo || 0));
      case 'most-wins':
        return [...images].sort((a, b) => (b.wins || 0) - (a.wins || 0));
      case 'best-win-rate':
        return [...images].sort((a, b) => {
          const rateA = ((a.wins || 0) + (a.losses || 0)) > 0 ? (a.wins || 0) / ((a.wins || 0) + (a.losses || 0)) : 0;
          const rateB = ((b.wins || 0) + (b.losses || 0)) > 0 ? (b.wins || 0) / ((b.wins || 0) + (b.losses || 0)) : 0;
          return rateB - rateA;
        });
      default:
        return images;
    }
  };

  const sortedImages = sortImages(images);
  
  // Handle form submission for editing model
  const handleFormSubmit = async (formData) => {
    try {
      const res = await fetch(`/api/models/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update model: ${res.statusText}`);
      }
      
      const updatedModel = await res.json();
      setModel(updatedModel.model);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating model:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Link href="/admin" className="text-purple-600 hover:text-purple-800">
            ← Back to Models
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!model) {
    return (
      <AdminLayout>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Not Found: </strong>
          <span className="block sm:inline">Model not found</span>
        </div>
        <div className="mt-4">
          <Link href="/admin" className="text-purple-600 hover:text-purple-800">
            ← Back to Models
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>{model.username || 'unknown'} | model details | admin</title>
      </Head>
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-purple-600 hover:text-purple-800">
            ← Back to Models
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {model.username || 'unknown'} 
            <span className="text-sm font-normal text-gray-500 ml-2">({model.name})</span>
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Edit Model
              </button>
              
              {deleteConfirm !== model._id ? (
                <button 
                  onClick={() => setDeleteConfirm(model._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Model
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleDeleteModel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <ModelEditForm 
          model={model} 
          onSubmit={handleFormSubmit} 
          onCancel={() => setIsEditing(false)} 
        />
      ) : (
        <ModelStatsCard model={model} />
      )}
      
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Images ({images.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border rounded text-sm bg-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest-elo">Highest ELO</option>
              <option value="lowest-elo">Lowest ELO</option>
              <option value="most-wins">Most Wins</option>
              <option value="best-win-rate">Best Win Rate</option>
            </select>
          </div>
        </div>
        
        {images.length === 0 ? (
          <div className="bg-gray-50 p-10 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">No images found for this model</p>
            <Link href={`/admin/upload?modelId=${model._id}`} className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Upload Images
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedImages.map((image) => (
              <div key={image._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.name || 'Image'} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold truncate">
                      {image.name || 'Unnamed'}
                    </span>
                    <span 
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        image.elo >= 1500 ? 'bg-green-100 text-green-800' : 
                        image.elo >= 1400 ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {image.elo ? Math.round(image.elo) : 'No ELO'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-3">
                    <div>Wins: <span className="text-green-600 font-medium">{image.wins || 0}</span></div>
                    <div>Losses: <span className="text-red-600 font-medium">{image.losses || 0}</span></div>
                    <div>Win Rate: <span className="font-medium">
                      {((image.wins || 0) + (image.losses || 0)) > 0
                        ? `${(((image.wins || 0) / ((image.wins || 0) + (image.losses || 0))) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span></div>
                    <div>Rated: <span className="font-medium">{image.wins + image.losses || 0}</span></div>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteImage(image._id)}
                    className="w-full text-xs text-red-500 hover:text-red-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Delete Image</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 