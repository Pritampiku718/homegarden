import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track scroll progress for reading indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-bounce">
          🔴 You are offline - Some features may be unavailable
        </div>
      )}

      {/* Back to Top Button - appears after scrolling */}
      {scrollProgress > 20 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-110 animate-fade-in"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Header - REMOVED the sticky wrapper div, just render Header directly */}
      <Header />

      {/* Main Content - Added padding top to account for fixed header */}
      <main className="flex-grow pt-20 md:pt-24">
        {/* Page Transition Effect */}
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Premium Toast Configuration */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          },
          success: {
            icon: '✅',
            style: {
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              borderLeft: '4px solid #34d399',
            },
          },
          error: {
            icon: '❌',
            style: {
              background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              borderLeft: '4px solid #f87171',
            },
          },
          loading: {
            icon: '⏳',
            style: {
              background: 'linear-gradient(135deg, #7b1fa2 0%, #9333ea 100%)',
              borderLeft: '4px solid #c084fc',
            },
          },
        }}
      />

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layout;