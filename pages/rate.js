import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';

export default function RatePage() {
  return (
    <Layout>
      <Head>
        <title>Rate Images | Hot or Not</title>
        <meta name="description" content="Rate and compare model images to find out who's hotter" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 pt-6 pb-12">
        <div className="container mx-auto px-4">
          <HeadToHeadCompare />
        </div>
      </div>
    </Layout>
  );
} 