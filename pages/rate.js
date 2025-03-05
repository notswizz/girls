import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';

export default function RatePage() {
  return (
    <Layout title="rate">
      <div className="container mx-auto px-4 pb-16">
        <HeadToHeadCompare />
      </div>
    </Layout>
  );
} 