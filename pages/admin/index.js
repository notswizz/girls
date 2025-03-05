import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  // Image upload state
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Model form state
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [modelMessage, setModelMessage] = useState(null);
  const [modelError, setModelError] = useState(null);
  
  // Models list state
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  // Tab state for mobile
  const [activeTab, setActiveTab] = useState('models'); // 'models', 'upload', 'list'

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Fetch models from the API
  const fetchModels = async () => {
    try {
      setIsLoadingModels(true);
      const response = await fetch('/api/models');
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      console.error('Error fetching models:', err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle image upload form submission
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Please select an image to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadMessage(null);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', name);
      formData.append('description', description);
      
      if (selectedModelId) {
        formData.append('modelId', selectedModelId);
      }
      
      console.log('Uploading file:', file.name);
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Error parsing response:', err);
        throw new Error('Failed to parse server response');
      }
      
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || 'Failed to upload image';
        console.error('Upload failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('Upload successful:', data);
      
      // Reset form
      setFile(null);
      setName('');
      setDescription('');
      setPreview(null);
      setUploadMessage('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle model form submission
  const handleModelSubmit = async (e) => {
    e.preventDefault();
    
    if (!modelName.trim()) {
      setModelError('Model name is required');
      return;
    }
    
    try {
      setIsCreatingModel(true);
      setModelError(null);
      setModelMessage(null);
      
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName.trim(),
          description: modelDescription.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create model');
      }
      
      // Reset form
      setModelName('');
      setModelDescription('');
      setModelMessage('Model created successfully!');
      
      // Refresh models list
      fetchModels();
      
      // Switch to models list tab on mobile after successful creation
      setActiveTab('list');
    } catch (err) {
      console.error('Model creation error:', err);
      setModelError(err.message || 'An unknown error occurred');
    } finally {
      setIsCreatingModel(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Head>
        <title>Admin | Hot or Not</title>
      </Head>
      
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Admin Dashboard
      </h1>
      
      {/* Mobile Tabs */}
      <div className="md:hidden mb-4 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('models')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'models'
                ? 'text-pink-600 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Add Model
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'upload'
                ? 'text-pink-600 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload Image
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'list'
                ? 'text-pink-600 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Models List
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Add Model Form */}
        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 ${activeTab !== 'models' ? 'md:block hidden' : ''}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Model</h2>
          
          {modelMessage && (
            <div className="bg-green-50 text-green-700 p-3 sm:p-4 rounded-lg mb-4 text-sm">
              {modelMessage}
            </div>
          )}
          
          {modelError && (
            <div className="bg-red-50 text-red-700 p-3 sm:p-4 rounded-lg mb-4 text-sm">
              {modelError}
            </div>
          )}
          
          <form onSubmit={handleModelSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Model Name *</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                disabled={isCreatingModel}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                rows="3"
                disabled={isCreatingModel}
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isCreatingModel}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all
                  ${isCreatingModel
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-pink-500 text-white hover:bg-pink-600'}`}
              >
                {isCreatingModel ? 'Creating...' : 'Create Model'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Upload Image Form */}
        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 ${activeTab !== 'upload' ? 'md:block hidden' : ''}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload New Image</h2>
          
          {uploadMessage && (
            <div className="bg-green-50 text-green-700 p-3 sm:p-4 rounded-lg mb-4 text-sm">
              {uploadMessage}
            </div>
          )}
          
          {uploadError && (
            <div className="bg-red-50 text-red-700 p-3 sm:p-4 rounded-lg mb-4 text-sm">
              {uploadError}
            </div>
          )}
          
          <form onSubmit={handleImageSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Image *</label>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    disabled={isUploading}
                  />
                </div>
                
                {preview && (
                  <div className="w-16 h-16 sm:w-24 sm:h-24 relative flex-shrink-0">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Select Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                disabled={isUploading || isLoadingModels}
              >
                <option value="">-- No Model --</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {isLoadingModels && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Loading models...</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                disabled={isUploading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                rows="3"
                disabled={isUploading}
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isUploading}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all
                  ${isUploading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-pink-500 text-white hover:bg-pink-600'}`}
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Models List */}
      <div className={`mt-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 ${activeTab !== 'list' ? 'md:block hidden' : ''}`}>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Models</h2>
        
        {isLoadingModels ? (
          <p className="text-center text-gray-500 text-sm">Loading models...</p>
        ) : models.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No models added yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {models.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                          {model.name}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {model.description || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{model.imageCount || 0}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {model.averageScore ? model.averageScore.toFixed(1) : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 