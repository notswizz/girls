import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaUpload, FaTrash, FaSync, FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';
import { generateModelUsername, isValidModelUsername } from '../utils/idGenerator';

export default function ManagePage() {
  // Models state
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  
  // Model images
  const [modelImages, setModelImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  // New model form
  const [showAddModel, setShowAddModel] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelUsername, setModelUsername] = useState('');
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  
  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Messages
  const [message, setMessage] = useState(null);
  
  // Enlarged image modal
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    setModelUsername(generateModelUsername());
    fetchModels();
  }, []);

  // Auto-select first model when models load
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      selectModel(models[0]);
    }
  }, [models]);

  const fetchModels = async () => {
    try {
      setIsLoadingModels(true);
      const res = await fetch(`/api/models?t=${Date.now()}`);
      const data = await res.json();
      if (data.models) {
        const sorted = data.models.sort((a, b) => a.name.localeCompare(b.name));
        setModels(sorted);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const selectModel = async (model) => {
    setSelectedModel(model);
    setShowUpload(false);
    setShowAddModel(false);
    await fetchModelImages(model._id);
  };

  const fetchModelImages = async (modelId) => {
    try {
      setIsLoadingImages(true);
      setModelImages([]);
      const res = await fetch(`/api/models/${modelId}/images?t=${Date.now()}`);
      const data = await res.json();
      console.log('Fetched images:', data);
      if (data.success && data.images) {
        setModelImages(data.images);
      } else if (data.images) {
        setModelImages(data.images);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();
    if (!modelName.trim() || !isValidModelUsername(modelUsername)) return;

    try {
      setIsCreatingModel(true);
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName.trim(),
          username: modelUsername.toUpperCase(),
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setModelName('');
      setModelUsername(generateModelUsername());
      setShowAddModel(false);
      setMessage({ type: 'success', text: `Created "${data.model.name}"` });
      
      await fetchModels();
      selectModel(data.model);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsCreatingModel(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    previews.forEach(p => p.url.startsWith('blob:') && URL.revokeObjectURL(p.url));
    setPreviews(selectedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    })));
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    if (newPreviews[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index].url);
    }
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !selectedModel) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      let successCount = 0;
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        formData.append('name', files[i].name.split('.')[0]);
        formData.append('modelId', selectedModel._id);

        const res = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) successCount++;
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      previews.forEach(p => p.url.startsWith('blob:') && URL.revokeObjectURL(p.url));
      setFiles([]);
      setPreviews([]);
      setShowUpload(false);
      setMessage({ type: 'success', text: `Uploaded ${successCount} photo${successCount !== 1 ? 's' : ''}` });
      
      await fetchModels();
      await fetchModelImages(selectedModel._id);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imageId) => {
    if (!confirm('Delete this photo?')) return;
    
    try {
      await fetch(`/api/images/delete?id=${imageId}`, { method: 'DELETE' });
      setModelImages(modelImages.filter(img => img._id !== imageId));
      setMessage({ type: 'success', text: 'Photo deleted' });
      fetchModels();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  return (
    <Layout title="Manage">
      <div className="h-[calc(100vh-100px)] flex flex-col">
        {/* Enlarged image modal */}
        <AnimatePresence>
          {enlargedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setEnlargedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setEnlargedImage(null)}
                  className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
                
                {/* Image */}
                <img
                  src={enlargedImage.url}
                  alt=""
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                />
                
                {/* Info bar */}
                <div className="mt-4 flex items-center justify-between text-white/70">
                  <div className="flex items-center gap-4">
                    {enlargedImage.elo && (
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        ELO: {Math.round(enlargedImage.elo)}
                      </span>
                    )}
                    {enlargedImage.timesRated > 0 && (
                      <span className="text-sm">
                        Rated {enlargedImage.timesRated} times
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      deleteImage(enlargedImage._id);
                      setEnlargedImage(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <FaTrash size={12} />
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium ${
                message.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Model list */}
          <div className="w-48 sm:w-56 flex-shrink-0 border-r border-white/10 flex flex-col bg-black/20">
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/70">Models</h2>
              <button
                onClick={() => { setShowAddModel(true); setShowUpload(false); }}
                className="p-1.5 bg-pink-500 rounded-lg text-white hover:bg-pink-600 transition-colors"
                title="Add model"
              >
                <FaPlus size={10} />
              </button>
            </div>
            
            {/* Model list - scrollable */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingModels ? (
                <div className="p-3 space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : models.length === 0 ? (
                <div className="p-4 text-center text-white/40 text-sm">
                  No models yet
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {models.map((model) => (
                    <button
                      key={model._id}
                      onClick={() => selectModel(model)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-all text-sm
                        ${selectedModel?._id === model._id 
                          ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-500/50' 
                          : 'hover:bg-white/10 border border-transparent'}
                      `}
                    >
                      <div className="font-medium text-white truncate">{model.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-white/40 text-xs">@{model.username}</span>
                        <span className="text-white/50 text-xs">{model.imageCount || 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Refresh button */}
            <div className="p-2 border-t border-white/10">
              <button
                onClick={fetchModels}
                disabled={isLoadingModels}
                className="w-full flex items-center justify-center gap-2 p-2 text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                <FaSync className={isLoadingModels ? 'animate-spin' : ''} size={10} />
                Refresh
              </button>
            </div>
          </div>

          {/* Main content - Gallery */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content header */}
            {selectedModel && !showAddModel && (
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div>
                  <h1 className="text-lg font-bold text-white">{selectedModel.name}</h1>
                  <p className="text-white/40 text-sm">@{selectedModel.username} · {modelImages.length} photos</p>
                </div>
                <button
                  onClick={() => { setShowUpload(!showUpload); setShowAddModel(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showUpload 
                      ? 'bg-white/10 text-white' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  <FaUpload size={12} />
                  {showUpload ? 'Cancel' : 'Upload'}
                </button>
              </div>
            )}

            {/* Upload panel */}
            <AnimatePresence>
              {showUpload && selectedModel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 bg-black/30 overflow-hidden"
                >
                  <form onSubmit={handleUpload} className="p-4">
                    <div className="flex gap-4 items-start">
                      {/* File input */}
                      <div className="flex-1">
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept="image/*"
                            multiple
                            disabled={isUploading}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer block">
                            <FaUpload className="text-2xl text-white/30 mx-auto mb-2" />
                            <p className="text-white/50 text-sm">
                              {files.length > 0 ? `${files.length} selected` : 'Click to select'}
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Previews */}
                      {previews.length > 0 && (
                        <div className="flex gap-2 flex-wrap max-w-md">
                          {previews.slice(0, 6).map((preview, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={preview.url}
                                alt=""
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FaTrash size={8} />
                              </button>
                            </div>
                          ))}
                          {previews.length > 6 && (
                            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-white/50 text-sm">
                              +{previews.length - 6}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload button */}
                      <button
                        type="submit"
                        disabled={isUploading || files.length === 0}
                        className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                          isUploading || files.length === 0
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {isUploading ? `${uploadProgress}%` : 'Upload'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add model panel */}
            <AnimatePresence>
              {showAddModel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 bg-black/30 overflow-hidden"
                >
                  <form onSubmit={handleCreateModel} className="p-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-white/50 text-xs mb-1">Name</label>
                        <input
                          type="text"
                          value={modelName}
                          onChange={(e) => setModelName(e.target.value)}
                          placeholder="Model name"
                          className="w-full p-2.5 bg-white/5 border border-white/10 text-white rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-white/30"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-white/50 text-xs mb-1">Username</label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={modelUsername}
                            onChange={(e) => setModelUsername(e.target.value.slice(0, 6).replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                            placeholder="ABC123"
                            className="w-full p-2.5 bg-white/5 border border-white/10 text-white rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModelUsername(generateModelUsername())}
                        className="p-2.5 bg-white/10 text-white/50 rounded-lg hover:bg-white/20"
                      >
                        <FaSync size={12} />
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingModel || !isValidModelUsername(modelUsername) || !modelName.trim()}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                          isCreatingModel || !isValidModelUsername(modelUsername) || !modelName.trim()
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {isCreatingModel ? '...' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddModel(false)}
                        className="p-2.5 bg-white/10 text-white/50 rounded-lg hover:bg-white/20"
                      >
                        ✕
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gallery */}
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedModel ? (
                <div className="h-full flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <p className="text-lg mb-2">Select a model</p>
                    <p className="text-sm">or add a new one</p>
                  </div>
                </div>
              ) : isLoadingImages ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : modelImages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <p className="text-lg mb-2">No photos yet</p>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="text-pink-400 hover:text-pink-300 text-sm"
                    >
                      Upload some →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {modelImages.map((image) => (
                    <motion.div
                      key={image._id}
                      className="relative group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setEnlargedImage(image)}
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5">
                        <img
                          src={image.url}
                          alt=""
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                        <span className="text-white text-sm font-medium">Click to view</span>
                      </div>
                      
                      {/* ELO badge */}
                      {image.elo && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
                          {Math.round(image.elo)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
