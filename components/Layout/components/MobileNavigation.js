import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaTimes } from 'react-icons/fa';
import AuthButton from '../../AuthButton';
import { navigationItems } from '../utils/navigationItems';

/**
 * Mobile navigation component including menu button and dropdown
 */
const MobileNavigation = ({ isOpen, setIsOpen }) => {
  const router = useRouter();

  return (
    <div className="md:hidden flex items-center">
      <AuthButton />
      
      {/* Mobile menu toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center p-3 rounded-full transition-all duration-300 ml-2 ${
          isOpen 
            ? 'bg-cyber-pink text-white rotate-90' 
            : 'text-white hover:bg-white/10'
        }`}
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        <span className="sr-only">Open main menu</span>
        {!isOpen ? <FaBars size={24} /> : <FaTimes size={24} />}
      </button>
      
      {/* Mobile menu dropdown */}
      <div className={`${
        isOpen 
          ? 'max-h-[80vh] opacity-100' 
          : 'max-h-0 opacity-0'
      } md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-20 left-0 right-0`}>
        <div className="max-h-[80vh] overflow-y-auto px-2 pt-2 pb-6 space-y-2 sm:px-3 border-t border-white/10 bg-cyber-dark/90 backdrop-blur-lg">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                router.pathname === item.path
                  ? 'bg-gradient-to-r from-cyber-purple to-cyber-pink text-white shadow-inner'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
