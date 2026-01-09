import { useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Minimal FAQ Item
const FAQItem = ({ question, answer, isOpen, onClick, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.03 }}
  >
    <button
      onClick={onClick}
      className={`w-full text-left py-4 border-b border-white/5 group transition-all ${isOpen ? 'border-white/10' : ''}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className={`text-xs transition-colors ${isOpen ? 'text-pink-400' : 'text-white/20 group-hover:text-white/40'}`}
        >
          <FaChevronRight />
        </motion.div>
        <span className={`font-medium transition-colors ${isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
          {question}
        </span>
      </div>
    </button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="py-4 pl-7 pr-4 text-white/50 text-sm leading-relaxed">
            {typeof answer === 'string' ? <p>{answer}</p> : answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// Section component
const Section = ({ title, emoji, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="mb-8"
  >
    <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
      <span>{emoji}</span>
      <span>{title}</span>
    </h2>
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-4">
      {children}
    </div>
  </motion.div>
);

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({ 'what-is': true });

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout title="FAQ - fap bank">
      <div className="max-w-2xl mx-auto pb-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs mb-8 transition-colors"
          >
            <FaArrowLeft size={10} />
            <span>Back</span>
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            FAQ
          </h1>
          <p className="text-white/40 text-lg">
            Everything you need to know
          </p>
        </motion.div>

        {/* Getting Started */}
        <Section title="Getting Started" emoji="👋" delay={0.1}>
          <FAQItem
            index={0}
            question="What is fap bank?"
            isOpen={openItems['what-is']}
            onClick={() => toggleItem('what-is')}
            answer={
              <>
                <p className="mb-3">Your private vault for storing, organizing, rating, and creating content.</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Bank', desc: 'Store & organize photos' },
                    { name: 'Rate', desc: 'Head-to-head comparisons' },
                    { name: 'Creations', desc: 'AI video generation' },
                    { name: 'Explore', desc: 'Community content' },
                  ].map(f => (
                    <div key={f.name} className="p-2 rounded-lg bg-white/5">
                      <div className="text-white font-medium text-xs">{f.name}</div>
                      <div className="text-white/40 text-[11px]">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            }
          />
          <FAQItem
            index={1}
            question="Is my content private?"
            isOpen={openItems['privacy']}
            onClick={() => toggleItem('privacy')}
            answer="Yes! Your content is private by default. When creating a gallery, choose Private (only you can see) or Public (top photos appear in Explore for others to rate). You can change visibility anytime."
          />
        </Section>

        {/* Tokens */}
        <Section title="Tokens & Rewards" emoji="🪙" delay={0.15}>
          <FAQItem
            index={0}
            question="What are tokens?"
            isOpen={openItems['tokens']}
            onClick={() => toggleItem('tokens')}
            answer="Tokens are the in-app currency. Earn them through activities, spend them on AI video generation. Your balance is shown in your profile."
          />
          <FAQItem
            index={1}
            question="How do I earn tokens?"
            isOpen={openItems['earn']}
            onClick={() => toggleItem('earn')}
            answer={
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span>Photo wins in Explore</span>
                  <span className="text-amber-400 font-bold">+1 token</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span>Friend signs up (referral)</span>
                  <span className="text-amber-400 font-bold">+50 tokens</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span>Sign up via referral link</span>
                  <span className="text-amber-400 font-bold">+25 tokens</span>
                </div>
              </div>
            }
          />
          <FAQItem
            index={2}
            question="What can I spend tokens on?"
            isOpen={openItems['spend']}
            onClick={() => toggleItem('spend')}
            answer={
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span>AI Video Generation</span>
                <span className="text-pink-400 font-bold">100 tokens</span>
              </div>
            }
          />
        </Section>

        {/* Referrals */}
        <Section title="Referral Program" emoji="🎁" delay={0.2}>
          <FAQItem
            index={0}
            question="How do referrals work?"
            isOpen={openItems['referral']}
            onClick={() => toggleItem('referral')}
            answer="Share your unique link from the Referrals page. When friends sign up, you get 50 tokens and they get 25. Track clicks, signups, and earnings in real-time."
          />
          <FAQItem
            index={1}
            question="Where's my referral link?"
            isOpen={openItems['ref-link']}
            onClick={() => toggleItem('ref-link')}
            answer="Go to the Referrals page (tap 'Refer' on the home screen or 'Invite Friends' in your profile dropdown). Copy your link or share directly to Twitter/WhatsApp."
          />
        </Section>

        {/* Rating */}
        <Section title="Rating" emoji="🏆" delay={0.25}>
          <FAQItem
            index={0}
            question="What are the rating modes?"
            isOpen={openItems['modes']}
            onClick={() => toggleItem('modes')}
            answer={
              <>
                <p className="mb-2"><strong className="text-white">Explore</strong> (default) — Rate public community photos. Owners earn tokens when their photos win.</p>
                <p><strong className="text-white">My Gallery</strong> — Rate your own private photos to find your favorites.</p>
              </>
            }
          />
          <FAQItem
            index={1}
            question="What is ELO ranking?"
            isOpen={openItems['elo']}
            onClick={() => toggleItem('elo')}
            answer="A rating system (like chess) based on head-to-head wins. Beat a high-rated photo = gain more points. This surfaces your true favorites over time."
          />
          <FAQItem
            index={2}
            question="Will I see my own photos in Explore?"
            isOpen={openItems['own']}
            onClick={() => toggleItem('own')}
            answer="No. You only see other users' photos in Explore. This ensures fair voting."
          />
        </Section>

        {/* Bank */}
        <Section title="Bank & Organization" emoji="🏦" delay={0.3}>
          <FAQItem
            index={0}
            question="What are galleries/models?"
            isOpen={openItems['galleries']}
            onClick={() => toggleItem('galleries')}
            answer="Collections to organize your photos — by person, theme, or category. Each has a unique 6-character username."
          />
          <FAQItem
            index={1}
            question="How do I upload?"
            isOpen={openItems['upload']}
            onClick={() => toggleItem('upload')}
            answer="Bank tab → Select/create gallery → Tap upload button → Select photos. You can upload multiple at once."
          />
          <FAQItem
            index={2}
            question="Public vs Private?"
            isOpen={openItems['pub-priv']}
            onClick={() => toggleItem('pub-priv')}
            answer={
              <>
                <p className="mb-2"><strong className="text-white">Private:</strong> Only you can see and rate. Complete privacy.</p>
                <p><strong className="text-white">Public:</strong> Top 10 photos appear in Explore. Earn 1 token per win.</p>
              </>
            }
          />
        </Section>

        {/* AI */}
        <Section title="AI Creations" emoji="✨" delay={0.35}>
          <FAQItem
            index={0}
            question="What can I create?"
            isOpen={openItems['ai-what']}
            onClick={() => toggleItem('ai-what')}
            answer="Generate AI videos from text prompts in the Creations tab. Save favorites and view anytime."
          />
          <FAQItem
            index={1}
            question="How much does it cost?"
            isOpen={openItems['ai-cost']}
            onClick={() => toggleItem('ai-cost')}
            answer="Each AI video costs 100 tokens. Your balance is shown before generating."
          />
          <FAQItem
            index={2}
            question="Where are creations saved?"
            isOpen={openItems['ai-save']}
            onClick={() => toggleItem('ai-save')}
            answer="In the Creations tab, separate from uploaded photos. AI content is marked with a special badge."
          />
        </Section>

      </div>
    </Layout>
  );
}
