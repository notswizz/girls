import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import MarketCard from '../components/MarketCard';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

export default function MarketPage() {
  const { status } = useSession();
  const router = useRouter();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      fetch('/api/models')
        .then(res => res.json())
        .then(data => {
          setModels(data.models || []);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load market data');
          setLoading(false);
        });
    }
  }, [status]);

  const handleReveal = (model) => {
    // TODO: show reveal dialog/modal or call API
    alert(`Reveal Instagram for @${model.username}`);
  };

  if (status === 'loading' || loading) {
    return (
      <Layout title="Market">
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
    <Layout title="Market">
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-center text-cyber mb-8">Model Market</h1>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {models.map(model => (
            <MarketCard key={model._id} model={model} onReveal={handleReveal} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
