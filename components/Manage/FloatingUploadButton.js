import { motion } from 'framer-motion';
import { FaCamera } from 'react-icons/fa';

export default function FloatingUploadButton({ onClick, visible }) {
  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-30">
      <motion.button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <FaCamera size={20} />
      </motion.button>
    </div>
  );
}

