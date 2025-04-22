import Head from 'next/head';
import { useRouter } from 'next/router';

/**
 * Enhanced SEO component that handles all meta tags and head elements
 * for improved search engine optimization and social sharing
 */
const SEO = ({ 
  title = 'hot girl shit',
  description = 'Rate, compare, and discover the hottest models in our head-to-head matchups with our cyberpunk-inspired platform.',
  keywords = 'model rating, olivia ponton, jordyn jones, fapello, onlyfans, boutinella, livvy dunne, madison pettis, jasmine skye, millie bobby brown, hannah ann sluss, hot girls, influencers, compare models, bikini models, instagram models',
  ogImage = '/og-image.jpg', 
  ogType = 'website'
}) => {
  const router = useRouter();
  const canonicalUrl = `https://hotgirlshit.com${router.asPath}`;
  const siteName = 'hot girl shit';
  
  // Format the title consistently
  const formattedTitle = `${title} | ${siteName}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": "https://hotgirlshit.com",
            "description": description,
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://hotgirlshit.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </Head>
  );
};

export default SEO;
