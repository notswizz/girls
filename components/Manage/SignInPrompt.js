import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaUpload, FaGoogle } from 'react-icons/fa';

export default function SignInPrompt() {
  return (
    <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
          <FaUpload className="text-3xl text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Manage Your Gallery</h1>
        <p className="text-white/60 mb-8">
          Sign in to create your personal gallery, upload photos, and start rating your own hot girl shit.
        </p>
        <button
          onClick={() => signIn('google')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
        >
          <FaGoogle className="text-xl" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}

