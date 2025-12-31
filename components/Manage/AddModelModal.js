import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSync, FaInstagram } from 'react-icons/fa';
import { generateModelUsername, isValidModelUsername } from '../../utils/idGenerator';

export default function AddModelModal({ isOpen, onClose, onModelCreated }) {
  const [modelName, setModelName] = useState('');
  const [modelUsername, setModelUsername] = useState('');
  const [instagram, setInstagram] = useState('');
  const [onlyfans, setOnlyfans] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setModelUsername(generateModelUsername());
      setModelName('');
      setInstagram('');
      setOnlyfans('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modelName.trim() || !isValidModelUsername(modelUsername)) return;

    try {
      setIsCreating(true);
      setError('');
      
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName.trim(),
          username: modelUsername.toUpperCase(),
          instagram: instagram.trim().replace('@', ''),
          onlyfans: onlyfans.trim(),
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      onModelCreated(data.model);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-t-3xl sm:rounded-2xl border border-white/10"
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Add New Model</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-white/50 hover:text-white transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}
          
          {/* Name */}
          <div>
            <label className="block text-white/60 text-sm mb-2">Model Name *</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter name..."
              className="w-full p-4 bg-white/5 border border-white/10 text-white rounded-xl text-base focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-white/30"
              autoFocus
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-white/60 text-sm mb-2">Username *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={modelUsername}
                onChange={(e) => setModelUsername(e.target.value.slice(0, 6).replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                placeholder="ABC123"
                className="flex-1 p-4 bg-white/5 border border-white/10 text-white rounded-xl text-base focus:ring-2 focus:ring-pink-500 font-mono tracking-wider"
                required
              />
              <button
                type="button"
                onClick={() => setModelUsername(generateModelUsername())}
                className="px-4 bg-white/10 text-white/70 rounded-xl hover:bg-white/20 transition-colors"
              >
                <FaSync size={14} />
              </button>
            </div>
            <p className="text-white/40 text-xs mt-2">6 characters, letters and numbers only</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">SOCIALS (optional)</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
              <FaInstagram className="text-pink-400" />
              Instagram
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                placeholder="username"
                className="w-full p-4 pl-8 bg-white/5 border border-white/10 text-white rounded-xl text-base focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-white/30"
              />
            </div>
          </div>

          {/* OnlyFans */}
          <div>
            <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#00AFF0] flex items-center justify-center text-[10px] font-bold text-white">OF</span>
              OnlyFans
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">onlyfans.com/</span>
              <input
                type="text"
                value={onlyfans}
                onChange={(e) => setOnlyfans(e.target.value)}
                placeholder="username"
                className="w-full p-4 pl-[108px] bg-white/5 border border-white/10 text-white rounded-xl text-base focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-white/30"
              />
            </div>
          </div>

          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={isCreating || !isValidModelUsername(modelUsername) || !modelName.trim()}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                isCreating || !isValidModelUsername(modelUsername) || !modelName.trim()
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/25'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Model'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
