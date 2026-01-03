import { motion } from 'framer-motion';
import { FaThLarge } from 'react-icons/fa';

export default function FloatingModelButton({ onClick, visible, modelName }) {
  if (!visible) return null;

  return (
    <div 
      className="md:hidden fixed right-4 z-30"
      style={{ bottom: 'calc(70px + env(safe-area-inset-bottom, 0px))' }}
    >
      <motion.button
        onClick={onClick}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center border border-white/20"
        whileTap={{ scale: 0.9 }}
      >
        <FaThLarge size={16} />
      </motion.button>
    </div>
  );
}

