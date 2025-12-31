import { useState } from 'react';
import { FaUpload, FaGlobe, FaLock } from 'react-icons/fa';

export default function ModelHeader({ selectedModel, imageCount, onUploadClick, onModelUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedModel) return null;

  const togglePublic = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/models/${selectedModel._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedModel.name,
          username: selectedModel.username,
          isPublic: !selectedModel.isPublic,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (onModelUpdated) {
          onModelUpdated(data.model);
        }
      }
    } catch (err) {
      console.error('Error updating model:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white truncate">{selectedModel.name}</h1>
          <button
            onClick={togglePublic}
            disabled={isUpdating}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
              selectedModel.isPublic 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-white/10 text-white/50 hover:bg-white/20'
            }`}
            title={selectedModel.isPublic ? 'Public - click to make private' : 'Private - click to make public'}
          >
            {selectedModel.isPublic ? (
              <>
                <FaGlobe size={10} />
                <span className="hidden sm:inline">Public</span>
              </>
            ) : (
              <>
                <FaLock size={10} />
                <span className="hidden sm:inline">Private</span>
              </>
            )}
          </button>
        </div>
        <p className="text-white/40 text-sm">@{selectedModel.username} · {imageCount} photos</p>
      </div>
      <button
        onClick={onUploadClick}
        className="flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/25 active:scale-95"
      >
        <FaUpload size={12} />
        <span className="hidden sm:inline">Upload</span>
      </button>
    </div>
  );
}
