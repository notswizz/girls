import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaPiggyBank, FaGoogle, FaLock } from 'react-icons/fa';

export default function SignInPrompt() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center max-w-md mx-auto px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-pink-500/30"
        >
          <FaPiggyBank className="text-4xl text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-black mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-300">
              fap bank
            </span>
          </h1>
          <p className="text-white/40 text-sm mb-2">your private vault</p>
          
          <div className="flex items-center justify-center gap-2 mb-8 text-white/60">
            <FaLock className="text-pink-400/60" size={12} />
            <span className="text-sm">Secure & Private</span>
          </div>

          <p className="text-white/50 mb-8 max-w-sm mx-auto">
            Sign in to unlock your personal collection. Browse, create with AI, and rate your favorites head-to-head.
          </p>
        </motion.div>

        <motion.button
          onClick={() => signIn('google')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition-all shadow-xl"
        >
          <FaGoogle className="text-xl" />
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  );
}
