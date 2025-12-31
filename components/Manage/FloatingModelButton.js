import { motion } from 'framer-motion';
import { FaThLarge } from 'react-icons/fa';

export default function FloatingModelButton({ onClick, visible, modelName }) {
  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-30">
      <motion.button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <FaThLarge size={18} />
      </motion.button>
    </div>
  );
}

