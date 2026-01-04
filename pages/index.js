import Link from 'next/link';
import Layout from '../components/Layout';
import { FaArrowRight, FaTrophy, FaEye, FaPiggyBank } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';
import RandomImages from '../components/ModelGallery';

export default function Home() {
  const seoProps = {
    title: "fap bank - Browse, Create, Rate",
    description: "Your private collection vault. Browse your favorites, create with AI, and rate head-to-head. The ultimate secret folder app.",
    keywords: "private gallery, secret folder, photo vault, ai image generator, photo rating, collection manager",
    ogType: "website"
  };

  return (
    <Layout {...seoProps}>
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 py-4 sm:py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mb-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30">
              <FaPiggyBank className="text-2xl sm:text-3xl text-white" />
            </div>
          </motion.div>

          {/* Main title */}
          <motion.div 
            className="relative inline-block mb-3 sm:mb-4"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tight">
              <span className="relative inline-block">
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300">
                  fap bank
                </span>
              </span>
            </h1>
          </motion.div>
          
          {/* Tagline */}
          <motion.p 
            className="text-lg sm:text-2xl text-white/60 mb-6 sm:mb-8 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            browse. create. rate.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
          >
            <Link href="/manage">
              <motion.button
                className="group relative px-8 sm:px-10 py-4 text-lg font-bold rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-[length:200%_100%] animate-gradient-x" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                
                {/* Border */}
                <div className="absolute inset-0 rounded-2xl border border-white/20" />
                
                {/* Content */}
                <span className="relative flex items-center justify-center gap-2 text-white">
                  <FaPiggyBank className="text-lg" />
                  <span>OPEN BANK</span>
                </span>
              </motion.button>
            </Link>

            <Link href="/rate">
              <motion.button
                className="group relative px-8 sm:px-10 py-4 text-lg font-bold rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative flex items-center justify-center gap-2 text-white/80">
                  <FaTrophy className="text-lg text-pink-400" />
                  <span>START RATING</span>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Featured Gallery Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <RandomImages />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-md sm:max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {[
              { icon: FaEye, title: 'Browse', desc: 'Your collection', color: 'from-pink-500 to-rose-600' },
              { icon: HiSparkles, title: 'Create', desc: 'AI magic', color: 'from-purple-500 to-violet-600' },
              { icon: FaTrophy, title: 'Rate', desc: 'Head-to-head', color: 'from-cyan-500 to-blue-600' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} mb-2 sm:mb-3 shadow-lg`}>
                  <item.icon className="text-white text-lg sm:text-xl" />
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-lg">{item.title}</h3>
                <p className="text-white/40 text-xs sm:text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-10 sm:mt-16 pb-4 sm:pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="/manage" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors text-sm sm:text-base">
            Open your bank <FaArrowRight className="text-xs sm:text-sm" />
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
