import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaFire, FaStar, FaTrophy, FaBars, FaTimes } from 'react-icons/fa';
import AuthButton from './AuthButton';

export default function Layout({ children, title = 'hot girl shit' }) {
  const router = useRouter();
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
  
  // Navigation items with icons
  const navItems = [
    { name: 'home', path: '/', icon: <FaFire className="mr-2" /> },
    { name: 'rate', path: '/rate', icon: <FaStar className="mr-2" /> },
  ];

  return (
    <div className="min-h-screen">
      <Head>
        <title>{title} | hot girl shit</title>
        <meta name="description" content="rate and compare hot girl shit" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-cyber-dark/80 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-20">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-display font-bold text-2xl animate-glow text-cyber">
                hot girl shit
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
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
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <AuthButton />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`inline-flex items-center justify-center p-3 rounded-full transition-all duration-300 ml-2 ${
                  mobileMenuOpen 
                    ? 'bg-cyber-pink text-white rotate-90' 
                    : 'text-white hover:bg-white/10'
                }`}
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                {!mobileMenuOpen ? <FaBars size={24} /> : <FaTimes size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${
          mobileMenuOpen 
            ? 'max-h-64 opacity-100' 
            : 'max-h-0 opacity-0'
        } md:hidden overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="px-2 pt-2 pb-6 space-y-2 sm:px-3 border-t border-white/10 bg-cyber-dark/90 backdrop-blur-lg">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                  router.pathname === item.path
                    ? 'bg-gradient-to-r from-cyber-purple to-cyber-pink text-white shadow-inner'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        {children}
      </main>
    </div>
  );
} 