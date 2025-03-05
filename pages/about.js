import Head from 'next/head';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Head>
        <title>About | Hot or Not</title>
      </Head>
      
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        About Hot or Not
      </h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="prose lg:prose-lg mx-auto">
          <p>
            Welcome to Hot or Not, a fun and interactive platform where users can rate images on a scale of 1-3.
          </p>
          
          <h2>How It Works</h2>
          <p>
            It's simple! Browse through images and rate them on a scale of 1-3, with 3 being the highest rating.
            Our algorithm calculates scores based on user ratings, and the highest-rated images appear on the leaderboard.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            We aim to create a fun, respectful community where users can share and rate images in a positive environment.
            Our platform is designed to be engaging and user-friendly, with a focus on creating a positive experience for all users.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            Have questions, suggestions, or feedback? We'd love to hear from you! 
            Please reach out to us at <a href="mailto:contact@hotornot.example.com" className="text-pink-500 hover:text-pink-700">contact@hotornot.example.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
} 