import SEO from './components/SEO';
import Header from './components/Header';

/**
 * Main Layout component that wraps all pages
 */
const Layout = ({ children, title = 'hot girl shit' }) => {
  return (
    <div className="min-h-screen">
      <SEO title={title} />
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
