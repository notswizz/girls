import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaGoogle, FaSignOutAlt, FaUser, FaFire, FaImages, FaCrown, FaChartLine } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const loading = status === "loading";

  // Toggle dropdown menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Fetch user stats and live stats when menu opens
  useEffect(() => {
    const fetchStats = async () => {
      if (!session || !menuOpen) return;
      
      setLoadingStats(true);
      try {
        // Fetch user data
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserStats(userData.user);
        }
        
        // Fetch live stats (models, images)
        const modelsRes = await fetch('/api/models');
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          const totalImages = modelsData.models?.reduce((acc, m) => acc + (m.imageCount || 0), 0) || 0;
          setLiveStats({
            models: modelsData.models?.length || 0,
            images: totalImages
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchStats();
  }, [session, menuOpen]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!menuOpen) return;
    
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.auth-dropdown')) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (loading) {
    return (
      <button className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/50 animate-pulse">
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white/20" />
          <span>···</span>
        </span>
      </button>
    );
  }

  if (session) {
    return (
      <div className="relative auth-dropdown">
        <motion.button
          onClick={toggleMenu}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white hover:border-pink-500/50 transition-all"
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-bold">{session.user.name?.charAt(0).toUpperCase()}</span>
          </div>
          <span className="max-w-[80px] truncate hidden sm:block">{session.user.name?.split(' ')[0]}</span>
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10 z-50 overflow-hidden"
            >
              {/* Header with user info */}
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <span className="text-xl font-bold text-white">{session.user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{session.user.name}</p>
                    <p className="text-white/70 text-xs truncate">{session.user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Live Stats Grid */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {/* Ratings */}
                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <FaFire className="text-pink-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">
                      {loadingStats ? '·' : (userStats?.ratingsCount || 0)}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wide">Votes</div>
                  </div>
                  
                  {/* Models */}
                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <FaCrown className="text-purple-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">
                      {loadingStats ? '·' : (liveStats?.models || 0)}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wide">Models</div>
                  </div>
                  
                  {/* Images */}
                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <FaImages className="text-cyan-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">
                      {loadingStats ? '·' : (liveStats?.images || 0)}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wide">Photos</div>
                  </div>
                </div>
                
                {/* Activity indicator */}
                {userStats?.ratingsCount > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                    <div className="flex items-center gap-2">
                      <FaChartLine className="text-pink-400 text-sm" />
                      <span className="text-white/70 text-xs">
                        You've rated <span className="text-white font-semibold">{userStats.ratingsCount}</span> matchups!
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sign out button */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <FaSignOutAlt />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-lg"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <FaGoogle />
      <span className="hidden sm:inline">Sign in</span>
    </motion.button>
  );
}
