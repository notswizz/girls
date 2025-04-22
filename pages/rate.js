import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';

export default function RatePage() {
  // SEO metadata for rating page
  const seoProps = {
    title: "Rate Models - Head-to-Head Comparison",
    description: "Vote for your favorite models in our head-to-head comparisons. Participate in ranking the hottest content with our interactive rating system.",
    keywords: "olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, rate models, compare hot girls, vote for models, head to head comparison",
    ogType: "website"
  };

  return (
    <Layout {...seoProps}>
      <div className="container mx-auto px-4 pb-16">
        <HeadToHeadCompare />
      </div>
    </Layout>
  );
} 