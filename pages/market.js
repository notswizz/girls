import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Leaderboard from '../components/Leaderboard';
import Layout from '../components/Layout';
import { useEffect } from 'react';

export default function MarketPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Layout title="Market & Leaderboard">
        <div className="flex justify-center items-center min-h-[40vh]">
          <span className="text-white/80 text-lg animate-pulse">Loading...</span>
        </div>
      </Layout>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <Layout title="Market & Leaderboard">
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-center text-cyber mb-8">Model Market & Leaderboard</h1>
        <Leaderboard marketMode />
      </div>
    </Layout>
  );
}
