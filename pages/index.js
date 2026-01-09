import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../components/Layout';
import { FaGoogle, FaTrophy, FaLock, FaPiggyBank, FaPlay, FaGift, FaQuestionCircle, FaUsers, FaCoins, FaImages, FaVideo } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';

// Format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toLocaleString() || '0';
};

// Floating image component
const FloatingImage = ({ src, position, index, isVideo, isMobile }) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ 
        opacity: isMobile ? 0.7 : 1, 
        scale: position.scale,
        rotate: position.rotate
      }}
      transition={{ 
        duration: 0.8, 
        delay: 0.05 + index * 0.08,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={!isMobile ? { 
        scale: position.scale * 1.2, 
        rotate: 0,
        zIndex: 100,
        transition: { duration: 0.2 }
      } : undefined}
      onHoverStart={() => {
        if (isMobile) return;
        setIsHovered(true);
        if (videoRef.current) videoRef.current.play().catch(() => {});
      }}
      onHoverEnd={() => {
        if (isMobile) return;
        setIsHovered(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className="absolute cursor-pointer group"
      style={{ 
        left: position.x, 
        top: position.y,
        width: position.width,
        height: position.height,
        zIndex: position.z || 1,
      }}
    >
      {/* Glow effect - desktop only */}
      {!isMobile && (
        <div className="absolute -inset-3 bg-gradient-to-r from-pink-500/60 via-purple-500/60 to-rose-500/60 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
      )}
      
      {/* Image frame */}
      <div className={`relative w-full h-full overflow-hidden shadow-xl border border-white/10 ${isMobile ? 'rounded-lg' : 'rounded-xl sm:rounded-2xl group-hover:border-pink-500/60'} transition-all duration-200`}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10" />
        
        {isVideo && !isMobile ? (
          <>
            <video
              ref={videoRef}
              src={src}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
            />
            {!isHovered && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                  <FaPlay className="text-white text-[8px] ml-0.5" />
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={src}
            alt=""
            className={`w-full h-full object-cover ${!isMobile ? 'transition-transform duration-500 group-hover:scale-110' : ''}`}
          />
        )}
      </div>
    </motion.div>
  );
};

// Generate scattered positions for images - responsive for mobile/desktop
const generatePositions = (count, isMobile = false) => {
  if (isMobile) {
    // Mobile: Smaller images in corners, leaving center clear
    const mobilePositions = [
      // Top left area
      { x: '-5%', y: '2%', width: '80px', height: '100px', rotate: -8, scale: 1, z: 2 },
      { x: '8%', y: '12%', width: '70px', height: '90px', rotate: 6, scale: 0.9, z: 1 },
      
      // Top right area
      { x: '78%', y: '2%', width: '75px', height: '95px', rotate: 10, scale: 0.95, z: 2 },
      { x: '88%', y: '14%', width: '65px', height: '85px', rotate: -5, scale: 0.85, z: 1 },
      
      // Bottom left area
      { x: '-3%', y: '75%', width: '72px', height: '92px', rotate: 8, scale: 0.9, z: 2 },
      { x: '10%', y: '85%', width: '68px', height: '88px', rotate: -10, scale: 0.85, z: 1 },
      
      // Bottom right area
      { x: '80%', y: '78%', width: '70px', height: '90px', rotate: -6, scale: 0.9, z: 2 },
      { x: '88%', y: '88%', width: '65px', height: '82px', rotate: 5, scale: 0.8, z: 1 },
    ];
    return mobilePositions.slice(0, Math.min(count, 8));
  }
  
  // Desktop positions
  const basePositions = [
    // Left side
    { x: '2%', y: '8%', width: '130px', height: '170px', rotate: -12, scale: 1, z: 2 },
    { x: '4%', y: '42%', width: '115px', height: '150px', rotate: 8, scale: 0.95, z: 1 },
    { x: '2%', y: '72%', width: '125px', height: '165px', rotate: -6, scale: 0.9, z: 2 },
    
    // Left-center
    { x: '16%', y: '15%', width: '140px', height: '185px', rotate: 5, scale: 1.05, z: 3 },
    { x: '14%', y: '55%', width: '120px', height: '155px', rotate: -10, scale: 0.9, z: 1 },
    { x: '18%', y: '85%', width: '110px', height: '145px', rotate: 12, scale: 0.85, z: 2 },
    
    // Right side
    { x: '83%', y: '6%', width: '125px', height: '165px', rotate: 10, scale: 0.95, z: 2 },
    { x: '85%', y: '38%', width: '135px', height: '175px', rotate: -8, scale: 1, z: 3 },
    { x: '82%', y: '70%', width: '115px', height: '150px', rotate: 6, scale: 0.9, z: 1 },
    
    // Right-center
    { x: '70%', y: '10%', width: '120px', height: '160px', rotate: -5, scale: 1, z: 2 },
    { x: '72%', y: '52%', width: '130px', height: '170px', rotate: 8, scale: 1.05, z: 3 },
    { x: '68%', y: '82%', width: '118px', height: '155px', rotate: -12, scale: 0.9, z: 1 },
    
    // Extra positions
    { x: '9%', y: '28%', width: '100px', height: '130px', rotate: -4, scale: 0.82, z: 1 },
    { x: '88%', y: '22%', width: '105px', height: '138px', rotate: 7, scale: 0.85, z: 1 },
    { x: '76%', y: '90%', width: '95px', height: '125px', rotate: -9, scale: 0.8, z: 1 },
    { x: '22%', y: '3%', width: '90px', height: '120px', rotate: 6, scale: 0.78, z: 1 },
  ];
  
  return basePositions.slice(0, count);
};

export default function Home() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [publicStats, setPublicStats] = useState(null);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch public stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats/public');
        const data = await res.json();
        if (data.success) {
          setPublicStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // If logged in, fetch only user's own images
        // If logged out, fetch public images for the landing page
        const url = session 
          ? '/api/images?limit=20' 
          : '/api/images?allUsers=true&limit=100';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.images?.length > 0) {
          const activeImages = data.images.filter(img => img.isActive && img.url);
          
          if (session) {
            // For logged-in users, just show recent images (no shuffle)
            setImages(activeImages.slice(0, 16));
          } else {
            // For logged-out users, shuffle and dedupe for variety
            const shuffled = activeImages.sort(() => 0.5 - Math.random());
            
            const seenUrls = new Set();
            const seenModels = new Set();
            const uniqueImages = [];
            
            for (const img of shuffled) {
              const modelId = img.modelId?.toString() || img.modelId;
              
              if (seenUrls.has(img.url) || seenModels.has(modelId)) continue;
              
              seenUrls.add(img.url);
              if (modelId) seenModels.add(modelId);
              uniqueImages.push(img);
              
              if (uniqueImages.length >= 16) break;
            }
            
            setImages(uniqueImages);
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    // Wait for session to be determined before fetching
    if (status !== 'loading') {
      fetchImages();
    }
  }, [session, status]);

  const seoProps = {
    title: "fap bank - Your Private Vault",
    description: "The ultimate secret folder. Browse your favorites, create with AI, and rate head-to-head.",
    keywords: "private gallery, secret folder, photo vault, ai image generator, photo rating",
    ogType: "website"
  };

  const positions = generatePositions(images.length, isMobile);

  // Logged in user - dashboard view (no scroll)
  if (session) {
    return (
      <Layout {...seoProps} fullHeight>
        <div className="fixed inset-0 flex flex-col overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
          </div>

          {/* Main content - centered */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-16">
            {/* Welcome header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-pink-500/30"
              >
                <FaPiggyBank className="text-2xl text-white" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Welcome back
              </h1>
              <p className="text-white/40 text-sm">What do you want to do?</p>
            </motion.div>

            {/* Action Cards Grid - 2x2 on mobile, 4 cols on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md sm:max-w-lg"
            >
              {[
                { href: '/rate', icon: FaTrophy, title: 'Rate', subtitle: 'Head-to-head', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
                { href: '/manage', icon: FaPiggyBank, title: 'Bank', subtitle: 'Your collection', color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/25' },
                { href: '/creations', icon: HiSparkles, title: 'Creations', subtitle: 'AI video gen', color: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/25' },
                { href: '/referrals', icon: FaGift, title: 'Refer', subtitle: 'Earn tokens', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
              ].map((item, i) => (
                <Link href={item.href} key={item.title}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-4 sm:p-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-white/20 cursor-pointer transition-all`}
                  >
                    <div className="flex items-center gap-3 sm:flex-col sm:text-center">
                      <div className={`w-12 h-12 sm:w-11 sm:h-11 sm:mx-auto sm:mb-2 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg ${item.shadow}`}>
                        <item.icon className="text-white text-lg sm:text-base" />
                      </div>
                      <div className="flex-1 sm:flex-none">
                        <div className="text-white font-bold text-sm sm:text-sm">{item.title}</div>
                        <div className="text-white/40 text-xs sm:text-[10px] mt-0.5">{item.subtitle}</div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* FAQ Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <Link 
                href="/faq"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                <FaQuestionCircle size={12} />
                <span>How does this work? Read the FAQ</span>
              </Link>
            </motion.div>

            {/* Platform Stats */}
            {publicStats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-6 flex items-center justify-center gap-4 sm:gap-6"
              >
                {[
                  { value: publicStats.photos, label: 'Photos', icon: FaImages },
                  { value: publicStats.models, label: 'Models', icon: FaUsers },
                  { value: publicStats.users, label: 'Users', icon: FaUsers },
                  { value: publicStats.votes, label: 'Votes', icon: FaTrophy },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-white/80">
                      <stat.icon className="text-[10px] text-white/40" />
                      <span className="font-bold text-sm">{formatNumber(stat.value)}</span>
                    </div>
                    <div className="text-white/30 text-[9px] uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Recent Photos Preview */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 w-full max-w-md"
              >
                <Link href="/manage" className="block">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-xs font-medium">Recent in collection</span>
                    <span className="text-pink-400/60 text-xs">View all →</span>
                  </div>
                  <div className="flex gap-2 overflow-hidden">
                    {images.slice(0, 6).map((img, i) => {
                      const isVideo = img.url?.includes('.mp4') || img.url?.includes('video') || img.type === 'video';
                      return (
                        <motion.div
                          key={img._id || i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + i * 0.03 }}
                          className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10"
                        >
                          {isVideo ? (
                            <video
                              src={img.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={img.url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                    {images.length > 6 && (
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-white/40 text-xs font-medium">+{images.length - 6}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Feature data
  const features = [
    { icon: FaPiggyBank, title: 'Store', desc: 'Private & encrypted', color: 'from-pink-500 to-rose-600' },
    { icon: HiSparkles, title: 'Create', desc: 'AI video gen', color: 'from-purple-500 to-violet-600' },
    { icon: FaTrophy, title: 'Rate', desc: 'ELO rankings', color: 'from-amber-500 to-orange-600' },
  ];

  // Logged out - immersive landing page (no scroll)
  return (
    <Layout {...seoProps} hideBottomNav>
      <div className="fixed inset-0 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0015] via-[#12001f] to-[#050010]" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Floating Images */}
        {!loading && images.slice(0, positions.length).map((img, i) => (
          <FloatingImage
            key={img._id || i}
            src={img.url}
            position={positions[i]}
            index={i}
            isVideo={img.url?.includes('.mp4') || img.url?.includes('video')}
            isMobile={isMobile}
          />
        ))}

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center z-50"
        >
          <a 
            href="https://www.hotgirlshit.xyz/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-block"
          >
            <span className="text-white/80 text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase hover:text-pink-400 transition-colors">
              HOT GIRL SHIT
            </span>
            <div className="mt-1 h-[1.5px] w-full bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.footer>

        {/* Center content - above images */}
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center px-4 pointer-events-auto max-w-xl">
            {/* Glassmorphism card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-6 sm:p-10 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              {/* Glow behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl -z-10" />
              
              {/* Lock icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 shadow-2xl shadow-pink-500/40 mb-5"
              >
                <FaLock className="text-xl sm:text-2xl text-white" />
              </motion.div>

              {/* Title */}
              <motion.h1 
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="relative">
                  <span className="absolute inset-0 text-pink-500 blur-2xl opacity-60">fap bank</span>
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-pink-200">
                    fap bank
                  </span>
                </span>
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg text-white/50 mb-6 font-light"
              >
                your private vault
              </motion.p>

              {/* Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-2 sm:gap-3 mb-6"
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.1 }}
                    className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${feature.color} mb-2 shadow-lg`}>
                      <feature.icon className="text-white text-sm sm:text-base" />
                    </div>
                    <h3 className="text-white font-bold text-xs sm:text-sm">{feature.title}</h3>
                    <p className="text-white/40 text-[10px] sm:text-xs leading-tight">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Live Stats */}
              {publicStats && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-4 gap-2 mb-6"
                >
                  {[
                    { value: publicStats.photos, label: 'Photos', icon: FaImages, color: 'text-pink-400' },
                    { value: publicStats.models, label: 'Models', icon: FaUsers, color: 'text-purple-400' },
                    { value: publicStats.users, label: 'Users', icon: FaUsers, color: 'text-amber-400' },
                    { value: publicStats.creations, label: 'AI Vids', icon: FaVideo, color: 'text-cyan-400' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.75 + i * 0.05 }}
                      className="text-center py-2"
                    >
                      <stat.icon className={`mx-auto mb-1 text-sm ${stat.color} opacity-60`} />
                      <div className="text-white font-bold text-sm sm:text-base">{formatNumber(stat.value)}</div>
                      <div className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  onClick={() => signIn('google')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl overflow-hidden"
                >
                  {/* Animated gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-[length:200%_100%] animate-gradient-x" />
                  
                  {/* Shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                  
                  {/* Border */}
                  <div className="absolute inset-0 rounded-xl border border-white/30" />
                  
                  {/* Content */}
                  <span className="relative flex items-center justify-center gap-3 text-white">
                    <FaGoogle className="text-lg" />
                    <span>UNLOCK YOUR VAULT</span>
                  </span>
                </motion.button>
              </motion.div>

              {/* FAQ Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4"
              >
                <Link 
                  href="/faq"
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
                >
                  <FaQuestionCircle size={12} />
                  <span>Learn more in the FAQ</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
