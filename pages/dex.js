import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function DexPage() {
  const [swaps, setSwaps] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [revealHistory, setRevealHistory] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    fetch('/api/dex')
      .then(res => res.json())
      .then(data => {
        setSwaps(data.swaps || 0);
        setTokens(data.tokens || 0);
        setRevealHistory(data.revealHistory || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data.models || []));
  }, []);

  const handleSwap = async () => {
    setMessage('');
    const res = await fetch('/api/dex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'swap' })
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Swap failed');
      return;
    }
    setSwaps(data.swaps);
    setTokens(data.tokens);
    setMessage('Swapped 10 swaps for 1 token!');
  };

  const handleBuyReveal = async () => {
    setMessage('');
    if (!selectedModel) {
      setMessage('Select a model to reveal!');
      return;
    }
    const res = await fetch('/api/dex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'buy', modelId: selectedModel })
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Purchase failed');
      return;
    }
    setTokens(data.tokens);
    setRevealHistory(data.revealHistory || []);
    setMessage('Reveal purchased!');
  };

  if (loading) {
    return <Layout title="DEX Swap"><div className="text-center py-16">Loading...</div></Layout>;
  }

  return (
    <Layout title="DEX Swap">
      <div className="max-w-xl mx-auto mt-12 bg-white/80 rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-cyber mb-6">Swap Ratings for Tokens</h1>
        <div className="mb-4 flex justify-between text-lg">
          <span>Available Swaps: <span className="font-bold">{swaps}</span></span>
          <span>Tokens: <span className="font-bold">{tokens}</span></span>
        </div>
        <div className="my-6">
          <button className="btn-cyber px-6 py-3 rounded-full mr-4" onClick={handleSwap}>
            Swap 10 Swaps → 1 Token
          </button>
        </div>
        <div className="mb-4">
          <select
            className="border rounded px-3 py-2 w-full mb-2"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
          >
            <option value="">Select a model to reveal</option>
            {models.map(m => (
              <option key={m._id} value={m._id}>
                @{m.username} {m.elo ? `(ELO: ${Math.round(m.elo)})` : ''}
              </option>
            ))}
          </select>
          <button className="btn-hot px-6 py-3 rounded-full w-full" onClick={handleBuyReveal}>
            Buy Reveal (1 Token)
          </button>
        </div>
        {message && <div className="mt-4 text-cyber-pink font-semibold">{message}</div>}
        <div className="mt-8 text-gray-500 text-sm">
          <p>1 Token = 10 Ratings/Swaps</p>
          <p>Use tokens to buy Instagram reveals!</p>
        </div>
        <div className="mt-10 text-left">
          <h2 className="text-lg font-bold mb-2 text-cyber">Purchased Reveals</h2>
          {revealHistory.length === 0 ? (
            <div className="text-gray-500 italic">No reveals purchased yet.</div>
          ) : (
            <ul className="space-y-2">
              {revealHistory.map((r, i) => {
                const model = models.find(m => m._id === r.modelId);
                return (
                  <li key={i} className="bg-white/60 rounded p-2 flex justify-between items-center">
                    <span>@{model?.username || r.modelId}</span>
                    <span className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
