import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaHome, FaTrophy, FaPiggyBank } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const navItems = [
  { href: '/', icon: FaHome, label: 'Home' },
  { href: '/rate', icon: FaTrophy, label: 'Rate' },
  { href: '/manage', icon: FaPiggyBank, label: 'Bank' },
  { href: '/creations', icon: HiSparkles, label: 'Creations' },
];

export default function BottomNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (item) => currentPath === item.href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div 
        className="bg-black/90 backdrop-blur-xl border-t border-white/5"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                {/* Active background pill */}
                {active && (
                  <motion.div
                    layoutId="bottomNavPill"
                    className="absolute inset-x-2 top-1 bottom-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                
                {/* Icon with glow effect when active */}
                <div className="relative z-10">
                  <Icon 
                    size={18} 
                    className={`transition-all duration-200 ${
                      active 
                        ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' 
                        : 'text-white/30'
                    }`} 
                  />
                </div>
                
                {/* Label */}
                <span className={`relative z-10 text-[9px] mt-0.5 font-semibold transition-all duration-200 ${
                  active 
                    ? 'text-white' 
                    : 'text-white/30'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
