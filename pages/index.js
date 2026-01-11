import { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../components/Layout';
import { FaGoogle, FaTrophy, FaLock, FaPiggyBank, FaPlay, FaGift, FaQuestionCircle, FaUsers, FaImages } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';

// Format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toLocaleString() || '0';
};

// Floating image component - memoized to prevent unnecessary re-renders
const FloatingImage = memo(({ src, position, index, isVideo, isMobile }) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, y: 20 }}
      animate={{ 
        opacity: isLoaded ? 1 : 0, 
        scale: position.scale,
        rotate: position.rotate,
        y: 0
      }}
      transition={{ 
        duration: 0.6, 
        delay: 0.02 + index * 0.03,
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
      {/* Glow effect */}
      <div className={`absolute -inset-3 bg-gradient-to-r from-pink-500/60 via-purple-500/60 to-rose-500/60 rounded-2xl blur-xl ${isMobile ? 'opacity-70' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300`} />
      
      {/* Image frame */}
      <div className={`relative w-full h-full overflow-hidden border-2 border-white/30 ${isMobile ? 'rounded-xl shadow-2xl shadow-black/50' : 'rounded-xl sm:rounded-2xl shadow-xl group-hover:border-pink-500/60'} transition-all duration-200`}>
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
              preload="none"
              onLoadedData={() => setIsLoaded(true)}
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
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover ${!isMobile ? 'transition-transform duration-500 group-hover:scale-110' : ''}`}
          />
        )}
      </div>
    </motion.div>
  );
});


export default function Home() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [publicStats, setPublicStats] = useState(null);
  const [userStats, setUserStats] = useState({ photos: 0, models: 0, creations: 0 });

  useEffect(() => {
    // Check if mobile immediately
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch stats immediately (doesn't need session)
  useEffect(() => {
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => data.success && setPublicStats(data.stats))
      .catch(() => {});
  }, []);

  // Fetch user's personal stats when logged in
  useEffect(() => {
    if (!session) return;
    
    // Fetch models count
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const models = data.models || [];
          const totalPhotos = models.reduce((sum, m) => sum + (m.imageCount || 0), 0);
          setUserStats(prev => ({ ...prev, models: models.length, photos: totalPhotos }));
        }
      })
      .catch(() => {});
    
    // Fetch creations count
    fetch('/api/ai/creations?type=video&limit=1')
      .then(res => res.json())
      .then(data => {
        if (data.creations) {
          setUserStats(prev => ({ ...prev, creations: data.total || data.creations.length }));
        }
      })
      .catch(() => {});
  }, [session]);

  // Fetch images - different sources for logged in vs logged out
  useEffect(() => {
    if (status === 'loading') return;
    
    // Logged IN: fetch user's own images
    if (session) {
      fetch('/api/images?limit=50&sort=highest-elo')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.images?.length > 0) {
            const activeImages = data.images.filter(img => img.isActive && img.url);
            // Take top images by ELO, shuffle a bit for variety
            const topImages = activeImages.slice(0, 20);
            const shuffled = topImages.sort(() => 0.3 - Math.random());
            setImages(shuffled.slice(0, 12));
          }
        })
        .catch(err => console.error('Failed to fetch images:', err));
      return;
    }
    
    // Logged OUT: fetch public images
    fetch('/api/images?allUsers=true&limit=50')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.images?.length > 0) {
          const activeImages = data.images.filter(img => img.isActive && img.url);
          // Shuffle for variety, dedupe by URL only (allow multiple per model)
          const shuffled = activeImages.sort(() => 0.5 - Math.random());
          
          const seenUrls = new Set();
          const uniqueImages = [];
          
          for (const img of shuffled) {
            if (seenUrls.has(img.url)) continue;
            seenUrls.add(img.url);
            uniqueImages.push(img);
            if (uniqueImages.length >= 16) break;
          }
          
          setImages(uniqueImages);
        }
      })
      .catch(err => console.error('Failed to fetch images:', err));
  }, [session, status]);

  // Desktop positions - 16 positions scattered around the edges
  const desktopPositions = [
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
    { x: '9%', y: '28%', width: '100px', height: '130px', rotate: -4, scale: 0.85, z: 1 },
    { x: '88%', y: '22%', width: '105px', height: '138px', rotate: 7, scale: 0.88, z: 1 },
    { x: '76%', y: '90%', width: '95px', height: '125px', rotate: -9, scale: 0.82, z: 1 },
    { x: '22%', y: '3%', width: '90px', height: '120px', rotate: 6, scale: 0.8, z: 1 },
  ];

  const seoProps = {
    title: "fap bank - Your Private Vault",
    description: "The ultimate secret folder. Browse your favorites, create with AI, and rate head-to-head.",
    keywords: "private gallery, secret folder, photo vault, ai image generator, photo rating",
    ogType: "website"
  };

  // Logged-in dashboard positions - scattered around edges (larger images)
  const dashboardPositions = [
    // Left side
    { x: '0%', y: '8%', width: '140px', height: '185px', rotate: -8, scale: 1, z: 2 },
    { x: '2%', y: '42%', width: '130px', height: '170px', rotate: 6, scale: 0.95, z: 1 },
    { x: '0%', y: '72%', width: '135px', height: '175px', rotate: -5, scale: 0.9, z: 2 },
    // Right side
    { x: '86%', y: '6%', width: '135px', height: '175px', rotate: 8, scale: 0.95, z: 2 },
    { x: '84%', y: '40%', width: '145px', height: '190px', rotate: -6, scale: 1, z: 3 },
    { x: '87%', y: '70%', width: '130px', height: '170px', rotate: 5, scale: 0.9, z: 2 },
    // Top area
    { x: '14%', y: '3%', width: '120px', height: '155px', rotate: 10, scale: 0.9, z: 1 },
    { x: '74%', y: '2%', width: '115px', height: '150px', rotate: -10, scale: 0.85, z: 1 },
    // Bottom area
    { x: '12%', y: '78%', width: '115px', height: '150px', rotate: -8, scale: 0.85, z: 1 },
    { x: '76%', y: '80%', width: '120px', height: '155px', rotate: 7, scale: 0.85, z: 1 },
    // Inner scattered (closer to center, still visible)
    { x: '22%', y: '22%', width: '110px', height: '145px', rotate: -4, scale: 0.85, z: 1 },
    { x: '68%', y: '25%', width: '115px', height: '150px', rotate: 5, scale: 0.85, z: 1 },
  ];

  // Logged in user - dashboard view with floating images
  if (session) {
    return (
      <Layout {...seoProps} fullHeight>
        <div className="fixed inset-0 flex flex-col overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
          </div>

          {/* Floating Images from User's Collection - Desktop only */}
          {!isMobile && images.length > 0 && images.map((img, i) => {
            if (i >= dashboardPositions.length) return null;
            return (
              <FloatingImage
                key={img._id || i}
                src={img.url}
                position={dashboardPositions[i]}
                index={i}
                isVideo={false}
                isMobile={false}
              />
            );
          })}

          {/* Main content - centered */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-16 relative z-20">
            {/* Glassmorphism card container */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10 max-w-lg w-full">
              {/* Glow behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-xl -z-10" />
              
              {/* Welcome header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-pink-500/30">
                  <FaPiggyBank className="text-xl text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Welcome back
                </h1>
                <p className="text-white/40 text-sm">What do you want to do?</p>
              </div>

              {/* Action Cards Grid - 2x2 on mobile, 4 cols on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { href: '/rate', icon: FaTrophy, title: 'Rate', subtitle: 'Head-to-head', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
                  { href: '/manage', icon: FaPiggyBank, title: 'Bank', subtitle: userStats.photos > 0 ? `${userStats.photos} / ${userStats.models}` : '0 / 0', color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/25' },
                  { href: '/creations', icon: HiSparkles, title: 'Creations', subtitle: userStats.creations > 0 ? `${userStats.creations} vids` : 'AI video', color: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/25' },
                  { href: '/referrals', icon: FaGift, title: 'Refer', subtitle: 'Earn tokens', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
                ].map((item) => (
                  <Link href={item.href} key={item.title}>
                    <div className="relative p-3 sm:p-4 rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-white/25 hover:bg-white/[0.1] hover:scale-[1.03] active:scale-[0.98] cursor-pointer transition-all group">
                      <div className="flex items-center gap-3 sm:flex-col sm:text-center">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 sm:mx-auto sm:mb-1 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
                          <item.icon className="text-white text-base sm:text-base" />
                        </div>
                        <div className="flex-1 sm:flex-none">
                          <div className="text-white font-bold text-sm">{item.title}</div>
                          <div className="text-white/40 text-xs sm:text-[10px]">{item.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* FAQ Link */}
              <div className="text-center">
                <Link 
                  href="/faq"
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
                >
                  <FaQuestionCircle size={12} />
                  <span>How does this work? Read the FAQ</span>
                </Link>
              </div>

              {/* Platform Stats */}
              {publicStats && (
                <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-center gap-4 sm:gap-6">
                  {[
                    { value: publicStats.photos, label: 'Photos', icon: FaImages },
                    { value: publicStats.models, label: 'Models', icon: FaUsers },
                    { value: publicStats.users, label: 'Users', icon: FaUsers },
                    { value: publicStats.votes, label: 'Votes', icon: FaTrophy },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-white/80">
                        <stat.icon className="text-[10px] text-white/40" />
                        <span className="font-bold text-sm">{formatNumber(stat.value)}</span>
                      </div>
                      <div className="text-white/30 text-[9px] uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Picks Preview - Mobile only */}
            {isMobile && images.length > 0 && (
              <div className="mt-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-white/50 text-xs font-medium">Your Top Pics</span>
                  <Link href="/manage" className="text-pink-400 text-xs">View all →</Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.slice(0, 6).map((img, i) => (
                    <motion.div
                      key={img._id || i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex-shrink-0 relative"
                    >
                      <Link href="/manage">
                        <div className="w-20 h-28 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {img.elo && img.elo > 1500 && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm">
                              <span className="text-[9px] font-bold text-amber-400">{Math.round(img.elo)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Feature data - assign random images on mobile
  const features = [
    { icon: FaLock, title: 'Store', desc: 'Private vault', color: 'from-pink-500 to-rose-600', image: images[0]?.url },
    { icon: HiSparkles, title: 'Create', desc: 'AI video gen', color: 'from-purple-500 to-violet-600', image: images[1]?.url },
    { icon: FaTrophy, title: 'Rate', desc: 'ELO rankings', color: 'from-amber-500 to-orange-600', image: images[2]?.url },
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

        {/* Floating Images - Desktop only */}
        {!isMobile && images.map((img, i) => {
          if (i >= desktopPositions.length) return null;
          return (
            <FloatingImage
              key={img._id || i}
              src={img.url}
              position={desktopPositions[i]}
              index={i}
              isVideo={img.url?.includes('.mp4') || img.url?.includes('video')}
              isMobile={false}
            />
          );
        })}

        {/* Footer */}
        <footer className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center z-50">
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
        </footer>

        {/* Center content - images can overlap */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center px-4 pointer-events-auto max-w-xl">
            {/* Glassmorphism card - shows immediately */}
            <div className="relative p-6 sm:p-10 rounded-3xl bg-black/10 backdrop-blur-sm border border-white/5">
              {/* Glow behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl -z-10" />
              
              {/* Piggy bank icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 shadow-2xl shadow-pink-500/40 mb-5">
                <FaPiggyBank className="text-xl sm:text-2xl text-white" />
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-2">
                <span className="relative">
                  <span className="absolute inset-0 text-pink-500 blur-2xl opacity-60">fap bank</span>
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-pink-200">
                    fap bank
                  </span>
                </span>
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-lg text-white/50 mb-4 font-light">
                your private vault
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-white/40 mb-6 leading-relaxed max-w-md mx-auto">
                The ultimate secret folder for your favorite pics. Upload your collection, 
                generate AI videos, and rank your favorites in head-to-head battles with ELO ratings.
              </p>

              {/* Feature Cards - with background images on mobile */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="relative p-3 sm:p-4 rounded-xl overflow-hidden border border-white/10"
                  >
                    {/* Background image on mobile */}
                    {isMobile && feature.image && (
                      <>
                        <img 
                          src={feature.image} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                      </>
                    )}
                    {/* Desktop: solid background */}
                    {!isMobile && (
                      <div className="absolute inset-0 bg-white/5" />
                    )}
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${feature.color} mb-2 shadow-lg`}>
                        <feature.icon className="text-white text-sm sm:text-base" />
                      </div>
                      <h3 className="text-white font-bold text-xs sm:text-sm">{feature.title}</h3>
                      <p className="text-white/40 text-[10px] sm:text-xs leading-tight">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Stats */}
              {publicStats && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { value: publicStats.photos, label: 'Photos', icon: FaImages, color: 'text-pink-400' },
                    { value: publicStats.models, label: 'Models', icon: FaUsers, color: 'text-purple-400' },
                    { value: publicStats.users, label: 'Users', icon: FaUsers, color: 'text-amber-400' },
                    { value: publicStats.votes, label: 'Ratings', icon: FaTrophy, color: 'text-cyan-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center py-2">
                      <stat.icon className={`mx-auto mb-1 text-sm ${stat.color} opacity-60`} />
                      <div className="text-white font-bold text-sm sm:text-base">{formatNumber(stat.value)}</div>
                      <div className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => signIn('google')}
                className="group relative w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl overflow-hidden hover:scale-105 active:scale-95 transition-transform"
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
              </button>

              {/* FAQ Link */}
              <div className="mt-4">
                <Link 
                  href="/faq"
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
                >
                  <FaQuestionCircle size={12} />
                  <span>Learn more in the FAQ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
