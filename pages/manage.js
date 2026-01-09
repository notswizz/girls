import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import { AnimatePresence } from 'framer-motion';

// Import modular components
import {
  UploadModal,
  AddModelModal,
  ImageViewerModal,
  ModelSelectorModal,
  DesktopSidebar,
  ImageGallery,
  Toast,
  SignInPrompt,
  MobileBottomBar,
  ModelHeader,
  Overview,
  manageStyles
} from '../components/Manage';

export default function ManagePage() {
  const { data: session, status } = useSession();
  
  // Models state
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  
  // Model images - personal (gallery) stats
  const [modelImages, setModelImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  // Community (explore) stats
  const [communityImages, setCommunityImages] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);
  
  // Rating mode: 'gallery' (my ratings) or 'explore' (community ratings)
  const [ratingMode, setRatingMode] = useState('explore');
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [showModelSelectorModal, setShowModelSelectorModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  
  // Messages
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setIsLoadingModels(true);
      const res = await fetch(`/api/models?t=${Date.now()}`);
      const data = await res.json();
      if (data.models) {
        // Filter out any model named "AI" (legacy AI creations) and sort
        const filtered = data.models.filter(m => m.name?.toLowerCase() !== 'ai');
        const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
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
    if (model) {
      // Fetch both personal and community stats in parallel
      await Promise.all([
        fetchModelImages(model._id),
        fetchCommunityStats(model._id)
      ]);
    } else {
      setModelImages([]);
      setCommunityImages([]);
      setCommunityStats(null);
    }
  };

  const fetchModelImages = async (modelId) => {
    try {
      setIsLoadingImages(true);
      setModelImages([]);
      const res = await fetch(`/api/models/${modelId}/images?t=${Date.now()}`);
      const data = await res.json();
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

  const fetchCommunityStats = async (modelId) => {
    try {
      setIsLoadingCommunity(true);
      setCommunityImages([]);
      const res = await fetch(`/api/models/${modelId}/community-stats?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setCommunityImages(data.images || []);
        setCommunityStats(data.stats || null);
      }
    } catch (err) {
      console.error('Error fetching community stats:', err);
    } finally {
      setIsLoadingCommunity(false);
    }
  };

  const handleModelCreated = async (model) => {
    await fetchModels();
    selectModel(model);
    showToast('success', `Created "${model.name}"`);
  };

  const handleModelUpdated = (updatedModel) => {
    // Update in models list
    setModels(models.map(m => m._id === updatedModel._id ? updatedModel : m));
    // Update selected model if it's the one that was updated
    if (selectedModel?._id === updatedModel._id) {
      setSelectedModel(updatedModel);
    }
  };

  const handleUploadComplete = async (count) => {
    await fetchModels();
    if (selectedModel) {
      await fetchModelImages(selectedModel._id);
    }
    showToast('success', `Uploaded ${count} photo${count !== 1 ? 's' : ''}`);
  };

  const deleteImage = async (imageId) => {
    if (!confirm('Delete this photo?')) return;
    
    try {
      await fetch(`/api/images/delete?id=${imageId}`, { method: 'DELETE' });
      setModelImages(modelImages.filter(img => img._id !== imageId));
      setViewingImage(null);
      showToast('success', 'Photo deleted');
      fetchModels();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <Layout title="Bank">
        <div className="h-[calc(100vh-100px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <Layout title="Bank">
        <SignInPrompt />
      </Layout>
    );
  }

  return (
    <Layout title="Bank" fullHeight>
      {/* Modals - rendered outside overflow container */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            selectedModel={selectedModel}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModelModal && (
          <AddModelModal
            isOpen={showAddModelModal}
            onClose={() => setShowAddModelModal(false)}
            onModelCreated={handleModelCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModelSelectorModal && (
          <ModelSelectorModal
            isOpen={showModelSelectorModal}
            onClose={() => setShowModelSelectorModal(false)}
            models={models}
            selectedModel={selectedModel}
            onSelectModel={selectModel}
            onAddModel={() => setShowAddModelModal(true)}
            isLoading={isLoadingModels}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingImage && (
          <ImageViewerModal
            image={viewingImage}
            onClose={() => setViewingImage(null)}
            onDelete={() => deleteImage(viewingImage._id)}
          />
        )}
      </AnimatePresence>

      {/* Toast message */}
      <AnimatePresence>
        {message && <Toast message={message} />}
      </AnimatePresence>

      {/* Main content container */}
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <DesktopSidebar
            models={models}
            selectedModel={selectedModel}
            onSelectModel={selectModel}
            onAddModel={() => setShowAddModelModal(true)}
            onRefresh={fetchModels}
            isLoading={isLoadingModels}
          />

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedModel ? (
              <>
                {/* Selected model header + upload button + analytics */}
                <ModelHeader
                  selectedModel={selectedModel}
                  imageCount={modelImages.length}
                  onUploadClick={() => setShowUploadModal(true)}
                  onModelUpdated={handleModelUpdated}
                  modelImages={modelImages}
                  communityImages={communityImages}
                  communityStats={communityStats}
                  ratingMode={ratingMode}
                  onRatingModeChange={setRatingMode}
                />

                {/* Gallery */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-24 md:pb-4">
                  <ImageGallery
                    selectedModel={selectedModel}
                    modelImages={ratingMode === 'gallery' ? modelImages : communityImages}
                    isLoading={ratingMode === 'gallery' ? isLoadingImages : isLoadingCommunity}
                    onImageClick={setViewingImage}
                    onUploadClick={() => setShowUploadModal(true)}
                    ratingMode={ratingMode}
                  />
                </div>
              </>
            ) : (
              /* Overview when no model selected */
              <Overview
                models={models}
                onSelectModel={selectModel}
                onAddModel={() => setShowAddModelModal(true)}
                isLoading={isLoadingModels}
              />
            )}

          </div>
        </div>

        {/* Mobile Bottom Action Bar */}
        <MobileBottomBar
          selectedModel={selectedModel}
          modelCount={models.length}
          onSelectModel={() => setShowModelSelectorModal(true)}
          onAddModel={() => setShowAddModelModal(true)}
          onUpload={() => selectedModel && setShowUploadModal(true)}
        />
      </div>

      {/* Custom scrollbar hide style */}
      <style jsx global>{manageStyles}</style>
    </Layout>
  );
}
