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
  FloatingModelButton,
  ModelHeader,
  manageStyles
} from '../components/Manage';

export default function ManagePage() {
  const { data: session, status } = useSession();
  
  // Models state
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  
  // Model images
  const [modelImages, setModelImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
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
    await fetchModelImages(model._id);
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

  const handleModelCreated = async (model) => {
    await fetchModels();
    selectModel(model);
    showToast('success', `Created "${model.name}"`);
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
      <Layout title="Manage">
        <div className="h-[calc(100vh-100px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <Layout title="Manage">
        <SignInPrompt />
      </Layout>
    );
  }

  return (
    <Layout title="Manage">
      <div className="h-[calc(100vh-100px)] flex flex-col">
        {/* Modals */}
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
            {/* Selected model header + upload button */}
            <ModelHeader
              selectedModel={selectedModel}
              imageCount={modelImages.length}
              onUploadClick={() => setShowUploadModal(true)}
            />

            {/* Gallery */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <ImageGallery
                selectedModel={selectedModel}
                modelImages={modelImages}
                isLoading={isLoadingImages}
                onImageClick={setViewingImage}
                onUploadClick={() => setShowUploadModal(true)}
              />
            </div>

            {/* Mobile floating model selector button */}
            <FloatingModelButton
              onClick={() => setShowModelSelectorModal(true)}
              visible={true}
              modelName={selectedModel?.name}
            />
          </div>
        </div>
      </div>

      {/* Custom scrollbar hide style */}
      <style jsx global>{manageStyles}</style>
    </Layout>
  );
}
