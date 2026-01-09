import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaGoogle, FaSignOutAlt, FaUser, FaFire, FaImages, FaCrown, FaChartLine, FaCoins, FaGift } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
              className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl bg-[#0d0d14] border border-white/10 z-50 overflow-hidden"
            >
              {/* Compact Header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">{session.user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate text-sm">{session.user.name}</p>
                    <p className="text-white/40 text-xs truncate">{session.user.email}</p>
                  </div>
                  {/* Token balance inline */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25">
                    <FaCoins className="text-amber-400 text-xs" />
                    <span className="text-amber-300 font-bold text-sm">
                      {loadingStats ? '·' : (userStats?.tokens || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="p-3">
                {/* Stats Row - Compact */}
                <div className="flex items-center gap-1 p-2 rounded-xl bg-white/[0.02]">
                  <div className="flex-1 text-center py-2">
                    <div className="text-lg font-bold text-white">{loadingStats ? '·' : (userStats?.ratingsCount || 0)}</div>
                    <div className="text-[10px] text-white/30 uppercase">Votes</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex-1 text-center py-2">
                    <div className="text-lg font-bold text-white">{loadingStats ? '·' : (liveStats?.models || 0)}</div>
                    <div className="text-[10px] text-white/30 uppercase">Models</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex-1 text-center py-2">
                    <div className="text-lg font-bold text-white">{loadingStats ? '·' : (liveStats?.images || 0)}</div>
                    <div className="text-[10px] text-white/30 uppercase">Photos</div>
                  </div>
                </div>

                {/* Token Earnings - Only show if has earnings */}
                {(userStats?.tokensFromWins > 0 || userStats?.referralTokensEarned > 0) && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-white/30 uppercase">Earned:</span>
                    <div className="flex items-center gap-2 flex-1">
                      {userStats?.tokensFromWins > 0 && (
                        <span className="text-xs text-pink-300">
                          <span className="text-pink-400 font-semibold">{userStats.tokensFromWins}</span> wins
                        </span>
                      )}
                      {userStats?.tokensFromWins > 0 && userStats?.referralTokensEarned > 0 && (
                        <span className="text-white/20">•</span>
                      )}
                      {userStats?.referralTokensEarned > 0 && (
                        <span className="text-xs text-emerald-300">
                          <span className="text-emerald-400 font-semibold">{userStats.referralTokensEarned}</span> referrals
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link 
                    href="/referrals"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                  >
                    <FaGift className="text-emerald-400 text-sm" />
                    <span className="text-xs font-medium text-emerald-300">Invite Friends</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
                  >
                    <FaSignOutAlt className="text-white/40 text-sm" />
                    <span className="text-xs font-medium text-white/50">Sign out</span>
                  </button>
                </div>
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
