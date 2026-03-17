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

  // Track scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', key: 'home' },
    { to: '/categories', label: 'Categories', key: 'categories' },
    { to: '/plants', label: 'All Plants', key: 'plants' },
    { to: '/gallery', label: 'Gallery', key: 'gallery' },
    { to: '/contact', label: 'Contact', key: 'contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-gradient-to-r from-green-700 to-green-600 dark:from-green-800 dark:to-green-700 py-3 md:py-4'
        }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link
            to="/"
            className="flex items-center space-x-2 group flex-shrink-0"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform duration-300">
              🌿
            </span>
            <span
              className={`text-lg sm:text-xl md:text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'
                }`}
            >
              HomeGarden
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                className={`relative px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${isActive(link.to)
                    ? scrolled
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 font-medium'
                      : 'text-white bg-white/20 font-medium'
                    : scrolled
                      ? 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-sm lg:text-base">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section - Admin & Theme */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Admin Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* User Badge */}
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${scrolled
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-white/20 text-white'
                    }`}
                >
                  <span className="text-base">👋</span>
                  <span className="font-medium text-sm hidden lg:inline">
                    {user?.name?.split(' ')[0] || 'Admin'}
                  </span>
                </div>

                {/* Dashboard Link */}
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg transition-all duration-300 text-sm lg:text-base ${isActive('/admin')
                      ? scrolled
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-green-700'
                      : scrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                >
                  Dashboard
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-300 text-sm lg:text-base ${scrolled
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-red-500/90 hover:bg-red-600 text-white'
                    }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm lg:text-base whitespace-nowrap ${scrolled
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-green-700 hover:bg-green-50 shadow-md hover:shadow-lg'
                  }`}
              >
                Admin Login
              </Link>
            )}

            {/* Theme Toggle */}
            <div className={scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}>
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
        >
          <div
            className={`rounded-xl overflow-hidden ${scrolled
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg'
                : 'bg-green-600 dark:bg-green-800'
              }`}
          >
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                className={`block px-4 py-3 transition-all ${isActive(link.to)
                    ? scrolled
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium'
                      : 'bg-white/20 text-white font-medium'
                    : scrolled
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className={`h-px my-1 ${scrolled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/20'
              }`} />

            {/* Mobile Admin Section */}
            {isAuthenticated ? (
              <>
                <div className={`px-4 py-3 ${scrolled ? 'text-gray-600 dark:text-gray-400' : 'text-white/80'
                  }`}>
                  <span className="text-sm">Logged in as</span>
                  <p className="font-semibold">{user?.name || 'Admin'}</p>
                </div>
                <Link
                  to="/admin"
                  className={`block px-4 py-3 transition-all ${isActive('/admin')
                      ? scrolled
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium'
                        : 'bg-white/20 text-white font-medium'
                      : scrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className={`block px-4 py-3 transition-all ${scrolled
                    ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-white hover:bg-white/10'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;