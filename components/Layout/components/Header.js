import Link from 'next/link';
import { useState, useEffect } from 'react';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';

/**
 * Header component with logo, navigation and mobile menu
 */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-top ${
        scrolled 
          ? 'bg-black/90 backdrop-blur-xl shadow-lg border-b border-white/5' 
          : 'bg-black/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-display font-bold text-lg md:text-2xl text-cyber">
              hot girl shit
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <DesktopNavigation />
          
          {/* Mobile Navigation - hidden since we have bottom nav */}
          <div className="hidden">
            <MobileNavigation 
              isOpen={mobileMenuOpen} 
              setIsOpen={setMobileMenuOpen} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
