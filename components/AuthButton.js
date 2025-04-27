import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaGoogle, FaSignOutAlt, FaUser, FaStar, FaCalendarAlt } from "react-icons/fa";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const loading = status === "loading";

  // Toggle dropdown menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close dropdown when clicking outside
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Fetch user stats when session is available and menu is opened
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session || !menuOpen) return;
      
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserStats(data.user);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    
    fetchUserStats();
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
      <button className="px-4 py-2 rounded-full text-sm font-medium border-2 bg-cyber-dark/50 text-white/80 border-transparent animate-pulse">
        <span className="flex items-center">
          <FaUser className="mr-2" />
          Loading...
        </span>
      </button>
    );
  }

  if (session) {
    return (
      <div className="relative auth-dropdown">
        <button
          onClick={toggleMenu}
          className="flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 border-cyber-blue bg-cyber-blue/20 text-white hover:bg-cyber-blue/30 transition-all duration-300"
        >
          <FaUser className="mr-2" />
          <span className="max-w-[100px] truncate">{session.user.name}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-cyber-dark/90 backdrop-blur-lg border border-cyber-blue/40 z-50 overflow-hidden">
            <div className="py-1">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-cyber-purple to-cyber-pink px-4 py-3 border-b border-white/10">
                <p className="text-white font-bold truncate">{session.user.name}</p>
                <p className="text-white/80 text-xs truncate">{session.user.email}</p>
              </div>
              
              {/* User stats */}
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center mb-2">
                  <FaStar className="text-cyber-pink mr-2" />
                  <span className="text-white text-sm">
                    {userStats?.ratingsCount || 0} Ratings
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2" />
                  <span className="text-white text-sm font-semibold">
                    {userStats?.tokens ?? 0} Tokens
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-cyber-blue mr-2" />
                  <span className="text-white text-sm">
                    Member since {userStats?.createdAt 
                      ? new Date(userStats.createdAt).toLocaleDateString() 
                      : 'Unknown'}
                  </span>
                </div>
              </div>
              
              {/* Sign out button */}
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-cyber-purple/20 transition-colors duration-150 flex items-center"
              >
                <FaSignOutAlt className="mr-2 text-cyber-pink" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 rounded-full text-sm font-medium border-2 border-cyber-pink bg-cyber-pink/20 text-white hover:bg-cyber-pink/30 transition-all duration-300 flex items-center"
    >
      <FaGoogle className="mr-2" />
      Sign in
    </button>
  );
} 