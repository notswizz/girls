import React from 'react';
import { FaLock, FaGoogle } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

/**
 * Sign-in prompt component shown when anonymous users reach the rating limit
 */
const SignInPrompt = () => (
  <div className="w-full max-w-md mx-auto p-6 card-neo bg-cyber-dark/70 rounded-xl backdrop-blur-md shadow-neon">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-pink/20 flex items-center justify-center">
        <FaLock className="text-3xl text-cyber-pink" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Limited Access</h2>
      <p className="text-white/80 mb-6">
        You've reached the limit for anonymous comparisons. Sign in to continue rating and unlock full access.
      </p>
      
      <button
        onClick={() => signIn('google')}
        className="btn-cyber px-6 py-3 font-bold flex items-center justify-center gap-2 mx-auto"
      >
        <FaGoogle className="text-lg" /> 
        <span>Sign in with Google</span>
      </button>
    </div>
  </div>
);

export default SignInPrompt;
