import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthButton from '../../AuthButton';
import { navigationItems } from '../utils/navigationItems';

/**
 * Desktop navigation component
 */
const DesktopNavigation = () => {
  const router = useRouter();

  return (
    <nav className="hidden md:flex items-center space-x-4">
      {navigationItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-300 flex items-center ${
            router.pathname === item.path
              ? 'border-cyber-pink bg-cyber-pink/20 text-white shadow-neon'
              : 'border-transparent hover:border-cyber-blue/60 text-white/80 hover:text-white hover:bg-white/5'
          }`}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
      
      {/* Auth Button */}
      <AuthButton />
    </nav>
  );
};

export default DesktopNavigation;
