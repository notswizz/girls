import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout title="Home">
      <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Hot or Not
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              href="/rate"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 shadow-md"
            >
              Rank Images
            </Link>
            
            <Link 
              href="/leaderboard"
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-medium hover:bg-gray-50 hover:shadow-md hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 shadow-sm"
            >
              Leaderboard
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[1, 2, 3].map((num) => (
            <div key={num} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
              <div className="h-40 bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                <span className="text-5xl font-bold text-white">{num}</span>
              </div>
              <div className="p-4 text-center">
                <div className="font-medium text-gray-700">
                  {num === 1 ? 'Rank Your Favorites' : num === 2 ? 'Compare Models' : 'View Results'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
