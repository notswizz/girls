import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaHome, FaTrophy, FaGlobe, FaPiggyBank } from 'react-icons/fa';

const navItems = [
  { href: '/', icon: FaHome, label: 'Home' },
  { href: '/rate', icon: FaTrophy, label: 'Rate' },
  { href: '/rate?tab=explore', icon: FaGlobe, label: 'Explore' },
  { href: '/manage', icon: FaPiggyBank, label: 'Bank' },
];

export default function BottomNav() {
  const router = useRouter();
  const currentPath = router.pathname;
  const currentTab = router.query.tab;

  const isActive = (item) => {
    if (item.href === '/rate?tab=explore') {
      return currentPath === '/rate' && currentTab === 'explore';
    }
    if (item.href === '/rate') {
      return currentPath === '/rate' && currentTab !== 'explore';
    }
    return currentPath === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Nav background with blur */}
      <div 
        className="bg-black/95 backdrop-blur-xl border-t border-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-[56px]">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                {/* Active indicator line */}
                {active && (
                  <motion.div
                    layoutId="bottomNavLine"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                {/* Icon */}
                <Icon 
                  size={20} 
                  className={`transition-colors ${
                    active 
                      ? 'text-white' 
                      : 'text-white/40'
                  }`} 
                />
                
                {/* Label */}
                <span className={`text-[9px] mt-0.5 font-medium transition-colors ${
                  active 
                    ? 'text-white' 
                    : 'text-white/40'
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

