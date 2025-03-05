import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children, title = 'Hot or Not' }) {
  const router = useRouter();
  
  // Navigation items
  const navItems = [
    { name: 'Rate', path: '/' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Head>
        <title>{title} | Hot or Not</title>
        <meta name="description" content="Rate images in this fun Hot or Not game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Hot or Not
              </Link>
            </div>
            
            <nav className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === item.path
                      ? 'bg-pink-100 text-pink-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Hot or Not. All rights reserved.
            </div>
            
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700 text-sm">
                Terms of Service
              </Link>
              <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 