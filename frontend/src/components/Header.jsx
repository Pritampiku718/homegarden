import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useCart } from '../contexts/CartContext'; // Import cart context
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart(); // Get cart data
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate total items in cart
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 dark:from-green-800 dark:to-green-700 text-white shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">

        {/* Top Bar */}
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">🌿 HomeGarden</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-green-200 transition px-3 py-2 rounded-lg hover:bg-white/10">Home</Link>
            <Link to="/categories" className="hover:text-green-200 transition px-3 py-2 rounded-lg hover:bg-white/10">Categories</Link>
            <Link to="/plants" className="hover:text-green-200 transition px-3 py-2 rounded-lg hover:bg-white/10">All Plants</Link>
            <Link to="/gallery" className="hover:text-green-200 transition px-3 py-2 rounded-lg hover:bg-white/10">Gallery</Link>
            <Link to="/contact" className="hover:text-green-200 transition px-3 py-2 rounded-lg hover:bg-white/10">Contact</Link>

            {/* CART ICON - Only visible for non-admin users */}
            {!isAuthenticated && (
              <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-lg transition group">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
                {/* Tooltip */}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                  View Cart
                </span>
              </Link>
            )}

            {/* AUTH SECTION */}
            {isAuthenticated ? (
              <div className="relative group">

                {/* User Button */}
                <button className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 transition">
                  <span>👋 {user?.name?.split(' ')[0]}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    to="/admin"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-md"
              >
                Admin Login
              </Link>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Mobile Cart Icon - Only for non-admin users */}
            {!isAuthenticated && (
              <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-lg transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
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
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 bg-green-600 dark:bg-green-800 rounded-lg p-4">
            <Link to="/" className="block py-2 px-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/categories" className="block py-2 px-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Categories</Link>
            <Link to="/plants" className="block py-2 px-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>All Plants</Link>
            <Link to="/gallery" className="block py-2 px-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
            <Link to="/contact" className="block py-2 px-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Contact</Link>

            {/* Mobile Cart Link - Only for non-admin users */}
            {!isAuthenticated && (
              <Link
                to="/cart"
                className="flex items-center justify-between py-2 px-3 hover:bg-white/10 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Cart</span>
                {cartItemsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <div className="py-2 px-3 text-green-200">👋 {user?.name}</div>
                <Link to="/admin" className="block py-2 px-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-3 text-red-200 hover:bg-white/10 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="block py-2 px-3 bg-white text-green-700 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;