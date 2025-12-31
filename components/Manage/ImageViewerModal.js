import { motion } from 'framer-motion';
import { FaTimes, FaTrash } from 'react-icons/fa';

export default function ImageViewerModal({ image, onClose, onDelete }) {
  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-top">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>
        <div className="flex items-center gap-3">
          {image.elo && (
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
              ELO: {Math.round(image.elo)}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <FaTrash size={16} />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={image.url}
          alt=""
          className="max-w-full max-h-full object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Footer info */}
      <div className="p-4 text-center text-white/50 text-sm safe-bottom">
        {image.timesRated > 0 && (
          <span>Rated {image.timesRated} times</span>
        )}
      </div>
    </motion.div>
  );
}

