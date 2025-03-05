import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { useRouter } from 'next/router';
import { generateModelUsername, isValidModelUsername } from '../../utils/idGenerator';

export default function AdminPage() {
  // Image upload state
  const [files, setFiles] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Model form state
  const [modelName, setModelName] = useState('');
  const [modelUsername, setModelUsername] = useState('');
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [modelMessage, setModelMessage] = useState(null);
  const [modelError, setModelError] = useState(null);
  
  // Models list state
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  // Model images state
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelImages, setModelImages] = useState([]);
  const [modelStats, setModelStats] = useState(null);
  const [isLoadingModelImages, setIsLoadingModelImages] = useState(false);
  const [imageActionMessage, setImageActionMessage] = useState(null);
  const [imageActionError, setImageActionError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Active tab state (for mobile view)
  const [activeTab, setActiveTab] = useState('models');
  
  const router = useRouter();
  
  // Initial data loading on mount
  useEffect(() => {
    console.log("Component mounted, fetching initial data...");
    fetchModels();
    
    // Also fetch models when the window regains focus
    const handleFocus = () => {
      console.log("Window focused, refreshing models...");
      fetchModels();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Set active tab based on URL query param
  useEffect(() => {
    const { tab, modelId } = router.query;
    
    // Set active tab based on query param
    if (tab) {
      setActiveTab(tab);
    }
    
    // If modelId is provided in query, set the selected model
    if (modelId) {
      setSelectedModelId(modelId);
    }
  }, [router.query]);

  // When selectedModelId changes and is not empty, fetch the selected model details and images
  useEffect(() => {
    if (selectedModelId) {
      const model = models.find(m => m._id === selectedModelId);
      if (model) {
        setSelectedModel({
          id: model._id,
          name: model.name,
          username: model.username || '(No username)'
        });
        
        // If active tab is 'images', fetch images for the selected model
        if (activeTab === 'images') {
          fetchModelImages(model._id);
        }
      }
    }
  }, [selectedModelId, models, activeTab]);

  // Fetch models from the API
  const fetchModels = async () => {
    try {
      setIsLoadingModels(true);
      
      // Add cache-busting parameter to avoid stale data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/models?t=${timestamp}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch models');
      }
      
      if (!data.models || !Array.isArray(data.models)) {
        console.error('Invalid response format. Expected array of models:', data);
        throw new Error('Invalid response format from server');
      }
      
      // Sort models by name
      const sortedModels = [...data.models].sort((a, b) => a.name.localeCompare(b.name));
      console.log("Fetched models:", sortedModels);
      
      // Check if we got any models
      if (sortedModels.length === 0) {
        console.log("Warning: No models returned from API");
      } else {
        console.log(`Fetched ${sortedModels.length} models successfully`);
      }
      
      setModels(sortedModels);
      
      // Clear selected model if it's not in the fetched models
      if (selectedModelId) {
        const modelExists = sortedModels.some(model => model._id === selectedModelId);
        if (!modelExists) {
          setSelectedModelId('');
          setSelectedModel(null);
        }
      }
      
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Fetch images for a specific model
  const fetchModelImages = async (modelId) => {
    if (!modelId) return;
    
    try {
      setIsLoadingModelImages(true);
      setImageActionMessage(null);
      setImageActionError(null);
      
      const response = await fetch(`/api/models/${modelId}/images`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch model images');
      }
      
      const data = await response.json();
      console.log('Fetched model images:', data);
      
      // Calculate some statistics for this model
      const totalImages = data.images.length;
      const ratedImages = data.images.filter(img => img.wins > 0 || img.losses > 0).length;
      
      // Calculate average score if rated images exist
      let averageScore = null;
      if (ratedImages > 0) {
        const totalScore = data.images.reduce((sum, img) => {
          if (img.wins === 0 && img.losses === 0) return sum;
          const score = img.wins / (img.wins + img.losses) * 100;
          return sum + score;
        }, 0);
        averageScore = totalScore / ratedImages;
      }
      
      // Find highest rated image
      let highestRated = null;
      if (ratedImages > 0) {
        highestRated = data.images.reduce((highest, img) => {
          if (img.wins === 0 && img.losses === 0) return highest;
          const score = img.wins / (img.wins + img.losses);
          if (!highest || score > highest.averageScore) {
            return { ...img, averageScore: score };
          }
          return highest;
        }, null);
      }
      
      setModelStats({
        totalImages,
        ratedImages,
        averageScore,
        highestRated
      });
      
      // Set images with formatted data
      setModelImages(data.images.map(img => ({
        id: img._id,
        url: img.url,
        wins: img.wins || 0,
        losses: img.losses || 0,
        winRate: img.wins + img.losses > 0 ? (img.wins / (img.wins + img.losses) * 100).toFixed(1) + '%' : 'N/A',
        elo: img.elo ? Math.round(img.elo) : 'N/A',
        createdAt: new Date(img.createdAt).toLocaleDateString()
      })));
      
    } catch (err) {
      console.error('Error fetching model images:', err);
    } finally {
      setIsLoadingModelImages(false);
    }
  };

  // Delete an image
  const deleteImage = async (imageId) => {
    if (!imageId || isDeleting) return;
    
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setImageActionMessage(null);
      setImageActionError(null);
      
      const response = await fetch(`/api/images/delete?id=${imageId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete image');
      }
      
      // Remove the image from the list
      setModelImages(modelImages.filter(img => img.id.toString() !== imageId.toString()));
      
      // Update stats
      if (selectedModel && data.modelId === selectedModel.id) {
        // Fetch updated model images to refresh stats
        await fetchModelImages(data.modelId);
      }
      
      setImageActionMessage('Image deleted successfully');
      
      // Refresh models list to update counts
      fetchModels();
    } catch (err) {
      console.error('Error deleting image:', err);
      setImageActionError(err.message || 'An error occurred while deleting the image');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    
    setFiles(selectedFiles);
    
    // Create previews
    const newPreviews = selectedFiles.map(file => {
      return {
        file,
        url: URL.createObjectURL(file)
      };
    });
    
    // Clean up previous object URLs to prevent memory leaks
    previews.forEach(preview => {
      if (preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    });
    
    setPreviews(newPreviews);
  };

  // Remove a file from the selection
  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke the object URL
    if (newPreviews[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index].url);
    }
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Handle image upload form submission
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!files.length) {
      setUploadError('Please select at least one image to upload');
      return;
    }
    
    if (!selectedModelId) {
      setUploadError('Please select a model');
      return;
    }
    
    // Find the selected model name for display purposes
    const selectedModel = models.find(model => model._id === selectedModelId);
    const modelName = selectedModel ? selectedModel.name : 'Unknown Model';
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadMessage(null);
      setUploadProgress(0);
      
      // Upload each file sequentially
      const totalFiles = files.length;
      let successCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', file.name.split('.')[0]); // Use filename without extension as the name
        formData.append('modelId', selectedModelId);
        
        // Log to verify data being sent
        console.log(`Uploading image ${i+1}/${totalFiles}: ${file.name} for model: ${modelName} (ID: ${selectedModelId})`);
        
        try {
          const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error(`Failed to upload ${file.name}:`, data.error || 'Unknown error');
            continue;
          }
          
          console.log(`Successfully uploaded ${file.name}:`, data);
          successCount++;
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err);
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      // Clean up previews
      previews.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      // Reset form
      setFiles([]);
      setPreviews([]);
      
      if (successCount === 0) {
        setUploadError('Failed to upload any images');
      } else if (successCount < totalFiles) {
        setUploadMessage(`Successfully uploaded ${successCount} out of ${totalFiles} images to model: ${modelName}`);
      } else {
        setUploadMessage(`Successfully uploaded all ${totalFiles} images to model: ${modelName}!`);
      }
      
      // Refresh the models list to update image counts
      fetchModels();
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'An unknown error occurred');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Generate a random username when the component mounts
  useEffect(() => {
    setModelUsername(generateModelUsername());
  }, []);

  // Handle model form submission
  const handleModelSubmit = async (e) => {
    e.preventDefault();
    
    if (!modelName.trim()) {
      setModelError('Model name is required');
      return;
    }
    
    if (!isValidModelUsername(modelUsername)) {
      setModelError('Valid username is required (3 letters followed by 3 numbers)');
      return;
    }
    
    try {
      setIsCreatingModel(true);
      setModelError(null);
      setModelMessage(null);
      
      // Format username to ensure correct format (capital letters + numbers)
      const formattedUsername = modelUsername.substring(0, 3).toUpperCase() + modelUsername.substring(3);
      
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName.trim(),
          username: formattedUsername,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create model');
      }
      
      console.log("Created model successfully:", data.model);
      
      // Reset form
      setModelName('');
      setModelUsername(generateModelUsername()); // Generate new random username for next model
      setModelMessage('Model created successfully!');
      
      // Get the new model ID
      const newModelId = data.model._id;
      
      // Force refetch models with cache-busting
      await fetchModels();
      
      // ADDITIONAL SAFETY: Get the model directly if it's not in the models list
      let newlyCreatedModel = models.find(m => m._id === newModelId);
      
      if (!newlyCreatedModel) {
        console.log(`New model ${newModelId} not found in models list, fetching directly...`);
        try {
          // Directly fetch the newly created model to ensure we have it
          const modelResponse = await fetch(`/api/models/${newModelId}?t=${new Date().getTime()}`);
          if (modelResponse.ok) {
            const modelData = await modelResponse.json();
            if (modelData.success && modelData.model) {
              newlyCreatedModel = modelData.model;
              // Add to models list if not already there
              if (!models.some(m => m._id === newModelId)) {
                setModels(prevModels => [...prevModels, newlyCreatedModel]);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching individual model:", err);
        }
      }
      
      if (newlyCreatedModel) {
        // Select the newly created model
        console.log("Setting selected model to:", newlyCreatedModel);
        setSelectedModelId(newModelId);
        setSelectedModel({
          id: newModelId,
          name: newlyCreatedModel.name,
          username: newlyCreatedModel.username || '(No username)'
        });
      }
      
      // Switch to upload tab on mobile after successful creation
      setActiveTab('upload');
      
    } catch (err) {
      console.error('Model creation error:', err);
      setModelError(err.message || 'An unknown error occurred');
    } finally {
      setIsCreatingModel(false);
    }
  };

  return (
    <AdminLayout title={activeTab}>
      <div className="space-y-6">
        {/* Mobile Tabs */}
        <div className="md:hidden">
          <div className="flex justify-between overflow-x-auto pb-2 no-scrollbar">
            <button
              className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'models'
                  ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-glow-pink'
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => {
                setActiveTab('models');
                router.push('/admin', undefined, { shallow: true });
              }}
            >
              Models
            </button>
            <button
              className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-glow-pink'
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => {
                setActiveTab('upload');
                router.push('/admin?tab=upload', undefined, { shallow: true });
              }}
            >
              Upload
            </button>
            <button
              className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'images'
                  ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-glow-pink'
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => {
                setActiveTab('images');
                router.push('/admin?tab=images', undefined, { shallow: true });
              }}
              disabled={!selectedModel}
            >
              Images
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Model Form */}
          <div className={`bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 ${activeTab !== 'models' ? 'md:block hidden' : ''}`}>
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">Add New Model</h2>
            
            {modelMessage && (
              <div className="bg-green-900/20 border border-green-500/20 text-green-400 p-4 rounded-lg mb-4 text-sm">
                {modelMessage}
              </div>
            )}
            
            {modelError && (
              <div className="bg-red-900/20 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-sm">
                {modelError}
              </div>
            )}
            
            <form onSubmit={handleModelSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Model Name *</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={isCreatingModel}
                  required
                  placeholder="Enter model name"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Username *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={modelUsername}
                    onChange={(e) => {
                      // Convert to uppercase for letters and limit to 6 characters
                      const formattedValue = e.target.value.slice(0, 6).replace(/[^A-Za-z0-9]/g, '');
                      setModelUsername(formattedValue);
                    }}
                    className={`w-full p-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      !isValidModelUsername(modelUsername) && modelUsername ? 'border-red-500' : 'border-gray-700'
                    } text-white`}
                    disabled={isCreatingModel}
                    required
                    placeholder="ABC123"
                  />
                  <button
                    type="button"
                    onClick={() => setModelUsername(generateModelUsername())}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded border border-gray-700 hover:bg-gray-700"
                    disabled={isCreatingModel}
                  >
                    Generate
                  </button>
                </div>
                {!isValidModelUsername(modelUsername) && modelUsername && (
                  <p className="text-xs text-red-400 mt-1">Username must be 3 letters followed by 3 numbers (e.g. ABC123)</p>
                )}
                <p className="text-xs text-gray-400 mt-1">this 3-letter-3-number id will be displayed publicly in comparisons</p>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isCreatingModel || !isValidModelUsername(modelUsername)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isCreatingModel || !isValidModelUsername(modelUsername)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:shadow-glow-pink'
                  }`}
                >
                  {isCreatingModel ? 'Creating...' : 'Create Model'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Upload Image Form */}
          <div className={`bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 ${activeTab !== 'upload' ? 'md:block hidden' : ''}`}>
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">Upload Images</h2>
            
            {uploadMessage && (
              <div className="bg-green-900/20 border border-green-500/20 text-green-400 p-4 rounded-lg mb-4 text-sm">
                {uploadMessage}
              </div>
            )}
            
            {uploadError && (
              <div className="bg-red-900/20 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-sm">
                {uploadError}
              </div>
            )}
            
            <form onSubmit={handleImageSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Select Model *</label>
                <select
                  value={selectedModelId}
                  onChange={(e) => {
                    console.log('Selected model ID:', e.target.value);
                    setSelectedModelId(e.target.value);
                    
                    // If a model is selected, find it and update selectedModel state
                    if (e.target.value) {
                      const selectedModel = models.find(m => m._id === e.target.value);
                      if (selectedModel) {
                        console.log('Found model:', selectedModel);
                        setSelectedModel({
                          id: selectedModel._id,
                          name: selectedModel.name,
                          username: selectedModel.username || '(No username)'
                        });
                      }
                    } else {
                      setSelectedModel(null);
                    }
                  }}
                  className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={isUploading || isLoadingModels}
                  required
                >
                  <option value="">Select a model</option>
                  {models.map((model) => (
                    <option key={model._id} value={model._id}>
                      {model.name} {model.username ? `(${model.username})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Images *</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-pink-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">
                        {files.length > 0 
                          ? `${files.length} file${files.length > 1 ? 's' : ''} selected` 
                          : 'Click to select images or drag and drop'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Image previews */}
              {previews.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Images ({previews.length})</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isUploading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isUploading || files.length === 0 || !selectedModelId}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isUploading || files.length === 0 || !selectedModelId
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:shadow-glow-pink'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Upload Images'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Models List */}
          <div className={`bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 md:col-span-2 ${activeTab !== 'models' ? 'md:block hidden' : ''}`}>
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">Models</h2>
            
            {isLoadingModels ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-3 text-gray-300">Loading models...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>No models found. Create your first model to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Images
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        ELO Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Win/Loss
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/50 divide-y divide-gray-800">
                    {models.map((model, index) => (
                      <tr key={model._id || index} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/admin/models/${model._id}`} className="flex items-center">
                            <div className="text-sm font-medium text-gray-200 hover:text-pink-400">
                              {model.name} <span className="text-xs text-gray-500">({model.username || 'unknown'})</span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{model.imageCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {model.elo ? Math.round(model.elo) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {model.wins || 0}/{model.losses || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {model.winRate !== undefined 
                              ? `${(model.winRate * 100).toFixed(1)}%` 
                              : 'N/A'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link 
                            href={`/admin/models/${model._id}`} 
                            className="text-blue-400 hover:text-blue-300 mr-4"
                          >
                            View
                          </Link>
                          <Link 
                            href={`/admin/upload?modelId=${model._id}`} 
                            className="text-pink-400 hover:text-pink-300"
                          >
                            Upload
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Model Images */}
          {selectedModel && (
            <div className={`bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 md:col-span-2 ${activeTab !== 'images' ? 'md:block hidden' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  Images for {selectedModel.name}
                </h2>
                <button
                  onClick={() => fetchModelImages(selectedModel.id)}
                  className="text-sm text-pink-400 hover:text-pink-300 flex items-center"
                  disabled={isLoadingModelImages}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {/* Statistics card */}
              {modelStats && (
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                  <h3 className="text-md font-medium text-gray-300 mb-3">Model Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 p-3 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Total Images</div>
                      <div className="text-xl font-semibold text-gray-200">{modelStats.totalImages}</div>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Rated Images</div>
                      <div className="text-xl font-semibold text-gray-200">{modelStats.ratedImages}</div>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Average Score</div>
                      <div className="text-xl font-semibold text-gray-200">
                        {modelStats.averageScore ? modelStats.averageScore.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                    {modelStats.highestRated && (
                      <div className="bg-gray-900 p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500">Highest Score</div>
                        <div className="text-xl font-semibold text-gray-200">
                          {modelStats.highestRated.averageScore.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {imageActionMessage && (
                <div className="bg-green-900/20 border border-green-500/20 text-green-400 p-4 rounded-lg mb-4 text-sm">
                  {imageActionMessage}
                </div>
              )}
              
              {imageActionError && (
                <div className="bg-red-900/20 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-sm">
                  {imageActionError}
                </div>
              )}
              
              {isLoadingModelImages ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-pink-500"></div>
                  <p className="mt-2 text-gray-400 text-sm">Loading images...</p>
                </div>
              ) : modelImages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No images found for this model.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {modelImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.name || 'Image'}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-2">
                          <div className="text-xs font-medium truncate">{image.name || 'Unnamed'}</div>
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-gray-500">
                              Score: {image.averageScore ? image.averageScore.toFixed(2) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Rated: {image.timesRated || 0}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteImage(image.id)}
                            disabled={isDeleting}
                            className="mt-2 w-full text-xs text-white bg-red-500 hover:bg-red-600 py-1 px-2 rounded transition-colors"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 