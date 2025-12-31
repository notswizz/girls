import { motion } from 'framer-motion';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
        message.type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}
    >
      {message.text}
    </motion.div>
  );
}

