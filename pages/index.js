import Link from 'next/link';
import Layout from '../components/Layout';
import { FaFire, FaBolt, FaTrophy, FaArrowRight, FaUsers, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import RandomImages from '../components/ModelGallery';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ totalVotes: 0, totalModels: 0 });
  
  // Fetch some basic stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/scores/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalVotes: data.leaderboard?.reduce((acc, item) => acc + (item.wins || 0) + (item.losses || 0), 0) || 1247,
            totalModels: data.leaderboard?.length || 22
          });
        }
      } catch (e) {
        // Use fallback stats
        setStats({ totalVotes: 1247, totalModels: 22 });
      }
    };
    fetchStats();
  }, []);

  const seoProps = {
    title: "hot girl shit - Rate and Compare Models Head-to-Head",
    description: "Discover, rate and compare models in head-to-head matchups on our cyberpunk-inspired platform. Join the community and help rank the hottest content.",
    keywords: "olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, hot girls, model rating, influencers, instagram models, tiktok stars, social rating app",
    ogType: "website"
  };

  return (
    <Layout {...seoProps}>
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-600/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 py-6 sm:py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Floating accent elements */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-cyber-pink rounded-full animate-ping opacity-60" />
          <div className="absolute top-40 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-32 right-40 w-4 h-4 bg-purple-500 rounded-full animate-pulse opacity-40" />
          
          {/* Main title with enhanced glow */}
          <motion.div 
            className="relative inline-block mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-display font-black tracking-tight">
              <span className="relative inline-block">
                <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-50 animate-pulse" style={{ WebkitBackgroundClip: 'text' }}>
                  hot girl shit
                </span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-2xl">
                  hot girl shit
                </span>
              </span>
            </h1>
            
            {/* Decorative line */}
            <motion.div 
              className="h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent mt-4 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>
          
          {/* Tagline */}
          <motion.p 
            className="text-lg sm:text-xl text-white/60 mb-8 font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Vote. Compare. Discover who&apos;s winning.
          </motion.p>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <Link href="/rate">
              <motion.button
                className="group relative px-12 py-5 text-xl font-bold rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button background with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_100%] animate-gradient-x" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                
                {/* Button border glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/20 group-hover:border-white/40 transition-colors" />
                
                {/* Button content */}
                <span className="relative flex items-center justify-center gap-3 text-white">
                  <FaFire className="text-2xl group-hover:animate-bounce" />
                  <span>START RATING</span>
                  <FaArrowRight className="text-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Live Stats Bar */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <FaUsers className="text-cyan-400" />
              <span className="text-white/80 text-sm">
                <span className="font-bold text-white">{stats.totalVotes.toLocaleString()}</span> votes cast
              </span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <FaTrophy className="text-yellow-400" />
              <span className="text-white/80 text-sm">
                <span className="font-bold text-white">{stats.totalModels}</span> models competing
              </span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <FaBolt className="text-pink-400" />
              <span className="text-white/80 text-sm">
                <span className="font-bold text-white">Live</span> rankings
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Featured Models Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-2">Featured Models</h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto" />
          </div>
          <RandomImages />
        </motion.div>

        {/* How it works - Minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { step: '01', title: 'Pick', desc: 'Choose your favorite', color: 'from-pink-500 to-pink-600' },
              { step: '02', title: 'Vote', desc: 'Cast your vote', color: 'from-purple-500 to-purple-600' },
              { step: '03', title: 'Rank', desc: 'See who wins', color: 'from-cyan-500 to-cyan-600' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${item.color} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-white font-bold text-lg sm:text-xl">{item.step}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-white/40 text-sm mb-4">Ready to vote?</p>
          <Link href="/rate" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors">
            Start comparing now <FaArrowRight className="text-sm" />
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
