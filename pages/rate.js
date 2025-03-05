import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import HeadToHeadCompare from '../components/HeadToHeadCompare';
import { motion } from 'framer-motion';

export default function RatePage() {
  return (
    <Layout title="rate">
      <div className="container mx-auto px-4 pb-16">
        <HeadToHeadCompare />
      </div>
    </Layout>
  );
} 