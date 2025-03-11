import Link from 'next/link';
import Layout from '../components/Layout';
import Head from 'next/head';
import { FaFire, FaCrown, FaChartLine, FaHeart, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import RandomImages from '../components/ModelGallery';

export default function Home() {
  return (
    <Layout title="home">
      <Head>
        <title>home | hot girl shit</title>
        <meta name="description" content="rate and compare hot girl shit" />
      </Head>
      
      <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative mb-6 inline-block">
            <h1 className="text-5xl sm:text-7xl font-display font-bold mb-4 text-cyber">
              hot girl shit
            </h1>
            <div className="absolute -top-6 -right-6 w-12 h-12 animate-spin-slow opacity-70">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,10 L55,30 L75,30 L60,45 L65,65 L50,55 L35,65 L40,45 L25,30 L45,30 L50,10 Z" fill="none" stroke="#FF6AB1" strokeWidth="2" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/rate"
                className="group btn-cyber flex items-center justify-center gap-2 px-12 py-4 text-lg font-bold shadow-neon"
              >
                <FaFire className="text-cyber-pink text-xl" /> 
                <span>START RATING</span>
                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          </div>
          
          {/* Random Model Images */}
          <div className="mt-10">
            <RandomImages />
          </div>
        </motion.div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div 
            className="relative group p-6 hover:-translate-y-2 transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Animated border container */}
            <div className="absolute inset-0 rounded-xl border-2 border-cyber-pink/60 z-0 animate-pulse-slow"></div>
            
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-cyber-pink/20 blur-md rounded-xl z-0 group-hover:bg-cyber-blue/20 transition-all duration-700"></div>
            
            {/* Cyber corner accent */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-blue z-20"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-pink z-20"></div>
            
            {/* Card content */}
            <div className="relative z-10">
              <div className="h-40 flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-cyber-pink/20 flex items-center justify-center relative">
                  <FaHeart className="text-4xl text-cyber-pink" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyber-pink/50 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Compare</h3>
                <p className="text-white/70">Head-to-head matches to find your favorites</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative group p-6 hover:-translate-y-2 transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Animated border container */}
            <div className="absolute inset-0 rounded-xl border-2 border-cyber-pink/60 z-0 animate-pulse-slow"></div>
            
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-cyber-pink/20 blur-md rounded-xl z-0 group-hover:bg-cyber-blue/20 transition-all duration-700"></div>
            
            {/* Cyber corner accent */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-blue z-20"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-pink z-20"></div>
            
            {/* Card content */}
            <div className="relative z-10">
              <div className="h-40 flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-cyber-purple/20 flex items-center justify-center relative">
                  <FaFire className="text-4xl text-cyber-purple" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyber-purple/50 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Rate</h3>
                <p className="text-white/70">Score and rate your favorite models</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative group p-6 hover:-translate-y-2 transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Animated border container */}
            <div className="absolute inset-0 rounded-xl border-2 border-cyber-pink/60 z-0 animate-pulse-slow"></div>
            
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-cyber-pink/20 blur-md rounded-xl z-0 group-hover:bg-cyber-blue/20 transition-all duration-700"></div>
            
            {/* Cyber corner accent */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-blue z-20"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-pink z-20"></div>
            
            {/* Card content */}
            <div className="relative z-10">
              <div className="h-40 flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-cyber-blue/20 flex items-center justify-center relative">
                  <FaChartLine className="text-4xl text-cyber-blue" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyber-blue/50 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Track</h3>
                <p className="text-white/70">Follow rankings on the leaderboard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
