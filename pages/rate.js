import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';

export default function RatePage() {
  const seoProps = {
    title: "Rate Models - Head-to-Head Comparison",
    description: "Vote for your favorite models in our head-to-head comparisons. Participate in ranking the hottest content with our interactive rating system.",
    keywords: "olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, rate models, compare hot girls, vote for models, head to head comparison",
    ogType: "website"
  };

  return (
    <Layout {...seoProps}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-gradient-to-r from-pink-600/20 to-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-600/10 to-blue-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="min-h-[calc(100vh-120px)] pb-8">
        <HeadToHeadCompare />
      </div>
    </Layout>
  );
}
