import SEO from './components/SEO';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

/**
 * Main Layout component that wraps all pages
 * @param {boolean} fullHeight - If true, uses fixed height for full-page layouts (like Manage)
 * @param {boolean} hideBottomNav - If true, hides the bottom navigation
 */
const Layout = ({ children, title = 'fap bank', fullHeight = false, hideBottomNav = false }) => {
  return (
    <div className="min-h-screen min-h-[100dvh]">
      <SEO title={title} />
      <Header />
      
      {fullHeight ? (
        // Fixed height layout for full-page apps
        // Mobile header: 56px, Desktop header: 80px
        // Mobile bottom nav: 56px + safe area
        <main 
          className="fixed left-0 right-0 overflow-hidden"
          style={{
            top: 'calc(56px + env(safe-area-inset-top, 0px))',
            bottom: '0',
            paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Desktop adjustments */}
          <div className="h-full md:pt-6 md:pb-0" style={{ '--md-top': '80px' }}>
            {children}
          </div>
        </main>
      ) : (
        <main className="pt-20 md:pt-24 pb-24 md:pb-12 px-4">
          {children}
        </main>
      )}
      
      {/* Bottom Navigation - mobile only */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
