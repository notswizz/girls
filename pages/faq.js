import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronDown, FaCoins, FaGift, FaTrophy, FaPiggyBank, 
  FaGlobe, FaLock, FaQuestionCircle, FaRobot, FaUsers,
  FaChartLine, FaShieldAlt, FaHeart, FaArrowLeft
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Link from 'next/link';

// FAQ Item Component
const FAQItem = ({ question, answer, icon: Icon, isOpen, onClick, color = 'pink' }) => {
  const colorClasses = {
    pink: 'from-pink-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
    cyan: 'from-cyan-500 to-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-all"
    >
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-white text-sm" />
        </div>
        <span className="flex-1 font-medium text-white text-sm sm:text-base">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown className="text-white/40" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-0">
              <div className="pl-14 text-white/60 text-sm leading-relaxed space-y-2">
                {typeof answer === 'string' ? <p>{answer}</p> : answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Section Header
const SectionHeader = ({ icon: Icon, title, color }) => (
  <div className="flex items-center gap-3 mb-4 mt-8 first:mt-0">
    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
      <Icon className="text-white text-sm" />
    </div>
    <h2 className="text-lg font-bold text-white">{title}</h2>
  </div>
);

export default function FAQPage() {
  const { data: session } = useSession();
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqSections = [
    {
      title: 'Getting Started',
      icon: FaQuestionCircle,
      color: 'from-pink-500 to-rose-600',
      items: [
        {
          id: 'what-is',
          icon: FaPiggyBank,
          color: 'pink',
          question: 'What is fap bank?',
          answer: (
            <>
              <p>fap bank is your private vault for storing, organizing, rating, and creating content. Think of it as your personal collection manager with powerful features:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Bank</strong> - Store and organize your photos into models/galleries</li>
                <li><strong>Rate</strong> - Compare photos head-to-head to find your favorites</li>
                <li><strong>Creations</strong> - Generate AI videos</li>
                <li><strong>Explore</strong> - Discover and rate public community content</li>
              </ul>
            </>
          ),
        },
        {
          id: 'privacy',
          icon: FaShieldAlt,
          color: 'purple',
          question: 'Is my content private?',
          answer: (
            <>
              <p>Yes! Your content is private by default. When you create a model/gallery, you choose:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Private</strong> - Only you can see and rate your photos</li>
                <li><strong>Public</strong> - Your top photos appear in Explore for others to rate</li>
              </ul>
              <p className="mt-2">You can change visibility anytime. Even public galleries only show your top 10 rated photos.</p>
            </>
          ),
        },
      ],
    },
    {
      title: 'Tokens & Rewards',
      icon: FaCoins,
      color: 'from-amber-500 to-orange-600',
      items: [
        {
          id: 'what-tokens',
          icon: FaCoins,
          color: 'amber',
          question: 'What are tokens?',
          answer: 'Tokens are the in-app currency. You can earn tokens through various activities and spend them on premium features like AI generation. Your token balance is shown in your profile dropdown.',
        },
        {
          id: 'earn-tokens',
          icon: FaChartLine,
          color: 'amber',
          question: 'How do I earn tokens?',
          answer: (
            <>
              <p>There are several ways to earn tokens:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Winning votes</strong> - When your public photo wins in Explore ratings, you earn 1 token</li>
                <li><strong>Referrals</strong> - Invite friends and earn 50 tokens for each signup</li>
                <li><strong>Being referred</strong> - Sign up with a referral link and get 25 bonus tokens</li>
              </ul>
              <p className="mt-2">More ways to earn coming soon!</p>
            </>
          ),
        },
        {
          id: 'spend-tokens',
          icon: HiSparkles,
          color: 'purple',
          question: 'What can I spend tokens on?',
          answer: 'Currently, tokens can be used for AI video generation in the Creations tab. Each video generation costs a certain number of tokens. More features requiring tokens will be added in the future.',
        },
      ],
    },
    {
      title: 'Referral Program',
      icon: FaGift,
      color: 'from-emerald-500 to-teal-600',
      items: [
        {
          id: 'referral-how',
          icon: FaGift,
          color: 'emerald',
          question: 'How does the referral program work?',
          answer: (
            <>
              <p>Share your unique referral link with friends. When they sign up:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>You get 50 tokens</strong> for each successful signup</li>
                <li><strong>They get 25 tokens</strong> as a welcome bonus</li>
              </ul>
              <p className="mt-2">Find your referral link in the Referrals page (click "Refer" on the home screen or "Invite Friends" in your profile).</p>
            </>
          ),
        },
        {
          id: 'referral-track',
          icon: FaUsers,
          color: 'emerald',
          question: 'Can I track my referrals?',
          answer: 'Yes! The Referrals page shows your unique link, total clicks, successful signups, tokens earned, and recent referral activity. You can also share directly to Twitter or WhatsApp.',
        },
      ],
    },
    {
      title: 'Rating & Comparisons',
      icon: FaTrophy,
      color: 'from-amber-500 to-orange-600',
      items: [
        {
          id: 'rating-modes',
          icon: FaTrophy,
          color: 'amber',
          question: 'What are the rating modes?',
          answer: (
            <>
              <p>There are two rating modes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Explore</strong> (default) - Rate public photos from the community. Your votes help rank content and earn token rewards for photo owners.</li>
                <li><strong>My Gallery</strong> - Rate your own private photos to find your personal favorites using ELO ranking.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'elo',
          icon: FaChartLine,
          color: 'cyan',
          question: 'What is ELO ranking?',
          answer: 'ELO is a rating system (like chess rankings) that calculates scores based on head-to-head wins and losses. Photos that beat highly-rated opponents gain more points. This helps surface your true favorites over time.',
        },
        {
          id: 'explore-own',
          icon: FaGlobe,
          color: 'cyan',
          question: 'Will I see my own photos in Explore?',
          answer: 'No! In Explore mode, you only see other users\' public photos. Your own photos will never appear when you\'re rating in Explore. This ensures fair voting.',
        },
      ],
    },
    {
      title: 'Bank & Organization',
      icon: FaPiggyBank,
      color: 'from-pink-500 to-rose-600',
      items: [
        {
          id: 'models',
          icon: FaPiggyBank,
          color: 'pink',
          question: 'What are models/galleries?',
          answer: 'Models (or galleries) are collections of photos. You can create multiple models to organize your content - for example, by person, theme, or category. Each model has a unique 6-character username.',
        },
        {
          id: 'upload',
          icon: FaHeart,
          color: 'pink',
          question: 'How do I upload photos?',
          answer: (
            <>
              <p>To upload photos:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to the Bank tab</li>
                <li>Select or create a model/gallery</li>
                <li>Tap the upload button (camera icon)</li>
                <li>Select photos from your device</li>
              </ol>
              <p className="mt-2">You can upload multiple photos at once.</p>
            </>
          ),
        },
        {
          id: 'public-private',
          icon: FaLock,
          color: 'purple',
          question: 'Public vs Private galleries?',
          answer: (
            <>
              <p><strong>Private galleries:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Only visible to you</li>
                <li>Can only be rated in "My Gallery" mode</li>
                <li>Complete privacy</li>
              </ul>
              <p className="mt-2"><strong>Public galleries:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Top 10 photos appear in Explore</li>
                <li>Other users can vote on your photos</li>
                <li>You earn 1 token when your photo wins</li>
              </ul>
            </>
          ),
        },
      ],
    },
    {
      title: 'AI Creations',
      icon: HiSparkles,
      color: 'from-purple-500 to-violet-600',
      items: [
        {
          id: 'ai-what',
          icon: FaRobot,
          color: 'purple',
          question: 'What can I create with AI?',
          answer: 'The Creations tab lets you generate AI videos using text prompts. You can create original video content, save your favorites, and organize them in your collection.',
        },
        {
          id: 'ai-cost',
          icon: FaCoins,
          color: 'amber',
          question: 'How much do AI generations cost?',
          answer: 'Each AI video generation costs tokens. The exact cost depends on the video length and quality settings. Your current token balance is shown before generating.',
        },
        {
          id: 'ai-save',
          icon: HiSparkles,
          color: 'purple',
          question: 'Where are my AI creations saved?',
          answer: 'AI videos are saved in the Creations tab. You can favorite them, view them anytime, and they\'re separate from your uploaded photo galleries. AI-generated content is marked with a special badge.',
        },
      ],
    },
  ];

  return (
    <Layout title="FAQ - fap bank">
      <div className="max-w-3xl mx-auto pb-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-sm mb-4 transition-colors"
          >
            <FaArrowLeft size={12} />
            Back to home
          </Link>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30"
          >
            <FaQuestionCircle className="text-2xl text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            FAQ
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            Everything you need to know about fap bank
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {faqSections.map((section, i) => (
            <a
              key={section.title}
              href={`#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {section.title}
            </a>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-2">
          {faqSections.map((section, sectionIndex) => (
            <div key={section.title} id={section.title.toLowerCase().replace(/\s+/g, '-')}>
              <SectionHeader 
                icon={section.icon} 
                title={section.title} 
                color={section.color}
              />
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <FAQItem
                    key={item.id}
                    {...item}
                    isOpen={openItems[item.id]}
                    onClick={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-white/40 text-sm mb-4">Still have questions?</p>
          <a
            href="mailto:support@fapbank.app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </Layout>
  );
}

