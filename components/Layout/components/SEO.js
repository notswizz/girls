import Head from 'next/head';

/**
 * SEO component that handles all meta tags and head elements
 */
const SEO = ({ title = 'hot girl shit' }) => {
  return (
    <Head>
      <title>{title} | hot girl shit</title>
      <meta name="description" content="rate and compare hot girl shit" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
  );
};

export default SEO;
