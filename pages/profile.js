import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import UserProfile from '../components/UserProfile';
import { FaLock, FaInfoCircle } from 'react-icons/fa';

export default function ProfilePage() {
  const { status } = useSession();
  const loading = status === 'loading';

  return (
    <Layout title="profile">
      <Head>
        <title>profile | hot girl shit</title>
        <meta name="description" content="Your profile on hot girl shit" />
      </Head>

      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 p-4 bg-cyber-blue/20 border border-cyber-blue/40 rounded-lg text-white">
          <div className="flex items-start">
            <FaInfoCircle className="text-cyber-blue text-xl mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-1">Profile Page</h3>
              <p className="text-white/80">
                Your profile information is now available in the dropdown menu when you click on your name in the header.
                This page is kept for reference but is no longer linked in the navigation.
              </p>
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-bold mb-8 text-center text-cyber">
          Your Profile
        </h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-t-cyber-pink border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/80">Loading your profile...</p>
          </div>
        ) : (
          <UserProfile />
        )}
      </div>
    </Layout>
  );
}

// Add server-side authentication check
export async function getServerSideProps(context) {
  return {
    props: {}
  };
} 