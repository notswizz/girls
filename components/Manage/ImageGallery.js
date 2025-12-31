import { motion } from 'framer-motion';
import { FaPlus, FaCamera, FaImages } from 'react-icons/fa';

export default function ImageGallery({ 
  selectedModel, 
  modelImages, 
  isLoading, 
  onImageClick, 
  onUploadClick 
}) {
  if (!selectedModel) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <FaImages className="text-2xl text-white/20" />
          </div>
          <p className="text-lg mb-2">Select a model</p>
          <p className="text-sm">or tap + to add one</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (modelImages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <FaCamera className="text-2xl text-white/20" />
          </div>
          <p className="text-lg mb-2">No photos yet</p>
          <button
            onClick={onUploadClick}
            className="text-pink-400 hover:text-pink-300 text-sm font-medium"
          >
            Upload some →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
      {modelImages.map((image) => (
        <motion.div
          key={image._id}
          className="relative group cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onImageClick(image)}
          whileTap={{ scale: 0.97 }}
        >
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5">
            <img
              src={image.url}
              alt=""
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
          
          {/* Overlay on hover/tap */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 sm:transition-opacity rounded-xl pointer-events-none" />
          
          {/* ELO badge */}
          {image.elo && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
              {Math.round(image.elo)}
            </div>
          )}

          {/* Tap indicator on mobile */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaPlus className="text-white rotate-45" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

