import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { FaUser, FaStar, FaChartLine, FaCrown, FaSpinner } from 'react-icons/fa';

export default function UserProfile() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserStats(data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [session]);
  
  if (!session) {
    return (
      <div className="mx-auto max-w-md p-6 card-neo bg-cyber-dark/50 shadow-neon rounded-xl backdrop-blur-sm">
        <div className="text-center py-5">
          <FaUser className="mx-auto text-4xl text-white/50 mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Not Signed In</h2>
          <p className="text-white/70">Sign in to view your profile and track your activity.</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="mx-auto max-w-md p-6 card-neo bg-cyber-dark/50 shadow-neon rounded-xl backdrop-blur-sm">
        <div className="text-center py-5">
          <FaSpinner className="mx-auto text-4xl text-cyber-blue animate-spin mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Loading Profile</h2>
          <p className="text-white/70">Fetching your data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mx-auto max-w-md p-6 card-neo bg-cyber-dark/50 shadow-neon rounded-xl backdrop-blur-sm border border-red-500/50">
        <div className="text-center py-5">
          <FaUser className="mx-auto text-4xl text-red-500/80 mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Profile</h2>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-md card-neo bg-cyber-dark/50 shadow-neon rounded-xl backdrop-blur-sm overflow-hidden">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-cyber-purple to-cyber-pink pt-8 pb-6 px-6 text-white text-center">
        <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-cyber-dark/60 flex items-center justify-center border-4 border-white/20 shadow-glow">
          <FaUser className="text-4xl text-white/70" />
        </div>
        
        <h2 className="text-xl font-bold">{session.user.name}</h2>
        <p className="text-white/80 text-sm truncate">{session.user.email}</p>
      </div>
      
      {/* Stats */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaChartLine className="mr-2 text-cyber-blue" />
          Your Activity
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-cyber-dark/40 border border-white/10">
            <div className="flex flex-col items-center">
              <FaStar className="text-cyber-pink text-xl mb-1" />
              <span className="text-2xl font-bold text-white">
                {userStats?.ratingsCount || 0}
              </span>
              <span className="text-xs text-white/60">Ratings</span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-cyber-dark/40 border border-white/10">
            <div className="flex flex-col items-center">
              <FaCrown className="text-cyber-purple text-xl mb-1" />
              <span className="text-2xl font-bold text-white">
                {userStats?.isAdmin ? 'Admin' : 'User'}
              </span>
              <span className="text-xs text-white/60">Account Type</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-cyber-dark/40 border border-white/10">
          <h4 className="text-sm font-medium text-white/80 mb-1">Member Since</h4>
          <p className="text-white">
            {userStats?.createdAt ? new Date(userStats.createdAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
} 