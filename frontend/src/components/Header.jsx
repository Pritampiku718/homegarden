import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  // Track scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set active link based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveLink('home');
    else if (path === '/categories') setActiveLink('categories');
    else if (path === '/plants') setActiveLink('plants');
    else if (path === '/gallery') setActiveLink('gallery');
    else if (path === '/contact') setActiveLink('contact');
    else if (path.startsWith('/admin')) setActiveLink('admin');
    else setActiveLink('');
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠', key: 'home' },
    { to: '/categories', label: 'Categories', icon: '📚', key: 'categories' },
    { to: '/plants', label: 'All Plants', icon: '🌱', key: 'plants' },
    { to: '/gallery', label: 'Gallery', icon: '🖼️', key: 'gallery' },
    { to: '/contact', label: 'Contact', icon: '📞', key: 'contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg py-2'
            : 'bg-gradient-to-r from-green-700 to-green-600 dark:from-green-800 dark:to-green-700 py-3'
          }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo with Animation */}
            <Link
              to="/"
              className="flex items-center space-x-2 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-2xl sm:text-3xl transform group-hover:rotate-12 transition-transform duration-300">
                🌿
              </span>
              <span className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'
                }`}>
                HomeGarden
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.to}
                  className={`relative px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 group ${activeLink === link.key
                      ? scrolled
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'text-white bg-white/20'
                      : scrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </span>
                  {/* Active Indicator */}
                  {activeLink === link.key && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-green-600 dark:bg-green-400' : 'bg-white'
                      }`} />
                  )}
                </Link>
              ))}

              {/* Admin Section */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l-2 border-white/20">
                  <div className="relative group">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${scrolled
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-white/20 text-white'
                      }`}>
                      <span className="text-lg">👋</span>
                      <span className="font-medium text-sm hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                    </div>
                  </div>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg transition-all duration-300 ${activeLink === 'admin'
                        ? scrolled
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-green-700'
                        : scrolled
                          ? 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <span className="flex items-center space-x-1">
                      <span className="text-lg">📊</span>
                      <span className="font-medium text-sm hidden lg:inline">Dashboard</span>
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 ${scrolled
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-red-500/90 hover:bg-red-600 text-white'
                      }`}
                  >
                    <span className="flex items-center space-x-1">
                      <span className="text-lg">🚪</span>
                      <span className="font-medium text-sm hidden lg:inline">Logout</span>
                    </span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className={`ml-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${scrolled
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl'
                    }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">🔐</span>
                    <span className="hidden lg:inline">Admin Login</span>
                  </span>
                </Link>
              )}

              {/* Theme Toggle */}
              <div className={`ml-2 ${scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-300 ${scrolled
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-white hover:bg-white/10'
                  }`}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu - Premium Slide Down */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}
          >
            <div className={`rounded-2xl overflow-hidden ${scrolled
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl'
                : 'bg-green-600 dark:bg-green-800'
              }`}>
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.to}
                  className={`flex items-center space-x-3 px-4 py-3 transition-all ${activeLink === link.key
                      ? scrolled
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-white/20 text-white'
                      : scrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium flex-1">{link.label}</span>
                  {activeLink === link.key && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
              ))}

              {/* Divider */}
              <div className={`h-px my-2 ${scrolled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/20'
                }`} />

              {/* Mobile Admin Section */}
              {isAuthenticated ? (
                <>
                  <div className={`px-4 py-3 ${scrolled ? 'text-gray-600 dark:text-gray-400' : 'text-white/80'
                    }`}>
                    <span className="text-sm">Logged in as</span>
                    <p className="font-semibold">{user?.name}</p>
                  </div>
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-3 px-4 py-3 transition-all ${scrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">📊</span>
                    <span className="font-medium flex-1">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-left transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <span className="text-xl">🚪</span>
                    <span className="font-medium flex-1">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  className={`flex items-center space-x-3 px-4 py-3 transition-all ${scrolled
                      ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      : 'text-white hover:bg-white/10'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">🔐</span>
                  <span className="font-medium flex-1">Admin Login</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className={`h-${scrolled ? '16' : '20'} transition-all duration-300`} />
    </>
  );
};

export default Header;