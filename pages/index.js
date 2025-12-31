import Link from 'next/link';
import Layout from '../components/Layout';
import { FaFire, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import RandomImages from '../components/ModelGallery';

export default function Home() {
  const seoProps = {
    title: "hot girl shit - Rate and Compare Models Head-to-Head",
    description: "Discover, rate and compare models in head-to-head matchups on our cyberpunk-inspired platform. Join the community and help rank the hottest content.",
    keywords: "olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, hot girls, model rating, influencers, instagram models, tiktok stars, social rating app",
    ogType: "website"
  };

  return (
    <Layout {...seoProps}>
      {/* Animated gradient orbs - hidden on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-600/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 py-4 sm:py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main title */}
          <motion.div 
            className="relative inline-block mb-3 sm:mb-4"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-display font-black tracking-tight">
              <span className="relative inline-block">
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                  hot girl shit
                </span>
              </span>
            </h1>
          </motion.div>
          
          {/* Short tagline */}
          <motion.p 
            className="text-base sm:text-xl text-white/50 mb-6 sm:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Vote. Compare. Win.
          </motion.p>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 sm:mb-12"
          >
            <Link href="/rate">
              <motion.button
                className="group relative px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_100%] animate-gradient-x" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                
                {/* Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />
                
                {/* Content */}
                <span className="relative flex items-center justify-center gap-2 sm:gap-3 text-white">
                  <FaFire className="text-xl sm:text-2xl" />
                  <span>START RATING</span>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Featured Models Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10 sm:mb-16"
        >
          <RandomImages />
        </motion.div>

        {/* How it works - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-md sm:max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {[
              { num: '1', title: 'Pick', color: 'from-pink-500 to-pink-600' },
              { num: '2', title: 'Vote', color: 'from-purple-500 to-purple-600' },
              { num: '3', title: 'Win', color: 'from-cyan-500 to-cyan-600' },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} mb-2 sm:mb-3 shadow-lg`}>
                  <span className="text-white font-bold text-lg sm:text-xl">{item.num}</span>
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-lg">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA - simplified */}
        <motion.div
          className="text-center mt-10 sm:mt-16 pb-4 sm:pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/rate" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors text-sm sm:text-base">
            Start comparing <FaArrowRight className="text-xs sm:text-sm" />
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
