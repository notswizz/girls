/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Compress responses
  compress: true,
  
  // Image optimization
  images: {
    domains: ['kmf-app.s3.us-east-2.amazonaws.com'],
    // Use modern formats
    formats: ['image/avif', 'image/webp'],
    // Minimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimized images longer
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  
  // Enable experimental features for faster loading
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  
  // Reduce JavaScript bundle size
  modularizeImports: {
    'react-icons/fa': {
      transform: 'react-icons/fa/{{member}}',
    },
    'react-icons/hi': {
      transform: 'react-icons/hi/{{member}}',
    },
  },
};

export default nextConfig;
