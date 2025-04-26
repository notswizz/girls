import Link from 'next/link';
import Layout from '../components/Layout';
import { FaFire, FaCrown, FaChartLine, FaHeart, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import RandomImages from '../components/ModelGallery';

export default function Home() {
  // SEO metadata for homepage
  const seoProps = {
    title: "hot girl shit - Rate and Compare Models Head-to-Head",
    description: "Discover, rate and compare models in head-to-head matchups on our cyberpunk-inspired platform. Join the community and help rank the hottest content.",
    keywords: "olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, hot girls, model rating, influencers, instagram models, tiktok stars, social rating app",
    ogType: "website"
  };

  return (
    <Layout {...seoProps}>
      {/* Cyberpunk Particle Background */}
      <div className="cyber-particles"></div>
      {/* Animated Grid Overlay */}
      <div className="cyber-grid"></div>
      <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative mb-6 inline-block">
            {/* Glitchy, flickering neon title */}
            <h1 className="text-5xl sm:text-7xl font-display font-bold mb-4 neon-shimmer glitch flicker drop-shadow-xl" data-text="hot girl shit">
              hot girl shit
            </h1>
            <div className="absolute -top-6 -right-6 w-12 h-12 animate-spin-slow opacity-80 float-ud">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                <path d="M50,10 L55,30 L75,30 L60,45 L65,65 L50,55 L35,65 L40,45 L25,30 L45,30 L50,10 Z" fill="none" stroke="#FF6AB1" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/rate"
                className="group btn-glow flex items-center justify-center gap-2 px-14 py-5 text-xl font-bold shadow-neon relative overflow-hidden underline-animate"
                aria-label="Start rating models"
              >
                <FaFire className="text-cyber-pink text-2xl icon-pulse float-ud" /> 
                <span className="tracking-wide">START RATING</span>
                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:text-cyber-yellow transition-all duration-300 text-2xl float-ud" />
              </Link>
            </motion.div>
          </div>
          {/* Random Model Images */}
          <div className="mt-10 flex justify-center w-full">
            <div className="w-full flex justify-center">
              <RandomImages />
            </div>
          </div>
        </motion.div>
        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Feature Card 1 */}
          <motion.div 
            className="relative group p-6 animated-border glass card-glass-hover hover:shadow-2xl transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Card content */}
            <div className="relative z-10">
              <div className="h-40 flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-cyber-pink/20 flex items-center justify-center relative">
                  <FaHeart className="text-4xl text-cyber-pink icon-pulse float-ud" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyber-pink/50 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2 glitch" data-text="Compare">Compare</h3>
                <p className="text-white/70">Head-to-head matches to find your favorites</p>
              </div>
            </div>
          </motion.div>
          {/* Feature Card 2 */}
          <motion.div 
            className="relative group p-6 animated-border glass card-glass-hover hover:shadow-2xl transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Card content */}
            <div className="relative z-10">
              <div className="h-40 flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-cyber-purple/20 flex items-center justify-center relative">
                  <FaFire className="text-4xl text-cyber-purple icon-pulse float-ud" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyber-purple/50 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2 glitch" data-text="Rate">Rate</h3>
                <p className="text-white/70">Score and rate your favorite models</p>
              </div>
            </div>
          </motion.div>
          {/* Feature Card 3 */}
          <motion.div 
            className="relative group p-6 animated-border glass card-glass-hover hover:shadow-2xl transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Card content */}
            <div className="relative z-10">
              <div className="h-40 flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-cyber-blue/20 flex items-center justify-center relative">
                  <FaChartLine className="text-4xl text-cyber-blue icon-pulse float-ud" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyber-blue/50 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2 glitch" data-text="Track">Track</h3>
                <p className="text-white/70">Follow rankings on the leaderboard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
