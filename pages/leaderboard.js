import { useSession, signIn } from 'next-auth/react';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Layout title="Leaderboard">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="Leaderboard">
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-white/60 mb-8">
            Sign in to see your personal rankings for top photos and top models.
          </p>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Sign in with Google
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Leaderboard">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
        </div>
        <Leaderboard />
      </div>
    </Layout>
  );
}


