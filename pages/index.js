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
              Compare Images
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="h-40 bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <div className="p-4 text-center">
              <div className="font-medium text-gray-700">Compare Images</div>
              <div className="text-sm text-gray-500 mt-1">Select your favorite</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="h-40 bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="p-4 text-center">
              <div className="font-medium text-gray-700">Pick Winners</div>
              <div className="text-sm text-gray-500 mt-1">One-on-one matches</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="h-40 bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="p-4 text-center">
              <div className="font-medium text-gray-700">View Results</div>
              <div className="text-sm text-gray-500 mt-1">Check the leaderboard</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
