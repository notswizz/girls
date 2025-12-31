import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCamera, FaPlus } from 'react-icons/fa';

export default function UploadModal({ isOpen, onClose, selectedModel, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const allFiles = [...files, ...newFiles];
    setFiles(allFiles);
    const newPreviews = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(droppedFiles);
  };

  const handleUpload = async () => {
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

      // Cleanup
      previews.forEach(p => p.url.startsWith('blob:') && URL.revokeObjectURL(p.url));
      setFiles([]);
      setPreviews([]);
      
      onUploadComplete(successCount);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    previews.forEach(p => p.url.startsWith('blob:') && URL.revokeObjectURL(p.url));
    setFiles([]);
    setPreviews([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={handleClose}
          disabled={isUploading}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-lg font-semibold text-white">
          Upload to {selectedModel?.name}
        </h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${dragOver 
              ? 'border-pink-500 bg-pink-500/10' 
              : 'border-white/20 hover:border-pink-500/50 hover:bg-white/5'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
            disabled={isUploading}
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
            <FaCamera className="text-2xl text-pink-400" />
          </div>
          <p className="text-white font-medium mb-1">Tap to select photos</p>
          <p className="text-white/40 text-sm">or drag and drop</p>
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div className="mt-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-white/50 text-sm mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Previews Grid */}
        {previews.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white/60 text-sm font-medium mb-3">
              Selected ({previews.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((preview, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                >
                  <img
                    src={preview.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {!isUploading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute top-1 right-1 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
                    >
                      <FaTimes size={10} />
                    </button>
                  )}
                </motion.div>
              ))}
              
              {/* Add more button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center hover:border-pink-500/50 hover:bg-white/5 transition-all"
              >
                <FaPlus className="text-white/30" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Upload Button */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/50">
        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
            isUploading || files.length === 0
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/25'
          }`}
        >
          {isUploading ? `Uploading... ${uploadProgress}%` : `Upload${files.length > 0 ? ` ${files.length} Photo${files.length > 1 ? 's' : ''}` : ''}`}
        </button>
      </div>
    </motion.div>
  );
}

