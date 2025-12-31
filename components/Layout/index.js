import SEO from './components/SEO';
import Header from './components/Header';

/**
 * Main Layout component that wraps all pages
 * @param {boolean} fullHeight - If true, uses fixed height for full-page layouts (like Manage)
 */
const Layout = ({ children, title = 'hot girl shit', fullHeight = false }) => {
  return (
    <div className="min-h-screen">
      <SEO title={title} />
      <Header />
      
      {fullHeight ? (
        // Fixed height layout - header is 80px (h-20)
        // No overflow-hidden here - let children handle their own overflow
        <main className="fixed top-20 left-0 right-0 bottom-0">
          {children}
        </main>
      ) : (
        <main className="pt-24 pb-12 px-4">
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;
