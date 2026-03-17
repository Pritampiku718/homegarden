import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white overflow-hidden">
      {/* Decorative Background Elements - Optimized for all screens */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-green-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Premium Header with Gradient - Centered */}
        <div className="text-center mb-10 md:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent inline-block">
            🌿 HomeGarden
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg mt-2 max-w-2xl mx-auto px-4">
            Bringing nature into your home with the finest plants since 2026
          </p>
        </div>

        {/* Desktop Grid Layout - 4 columns on large screens, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">

          {/* Brand Column - Left aligned on desktop, center on mobile */}
          <div className="text-center sm:text-left space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 pb-2 border-b-2 border-green-500 inline-block">
              About Us
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-sm mx-auto sm:mx-0">
              HomeGarden is your trusted partner in bringing nature closer to home.
              We offer premium quality plants with expert care support.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="text-center sm:text-left space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 pb-2 border-b-2 border-green-500 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/categories", label: "Categories" },
                { to: "/plants", label: "All Plants" },
                { to: "/gallery", label: "Gallery" },
                { to: "/contact", label: "Contact" }
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-all flex items-center justify-center sm:justify-start group"
                  >
                    <span className="w-0 group-hover:w-4 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column */}
          <div className="text-center sm:text-left space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 pb-2 border-b-2 border-green-500 inline-block">
              Categories
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/category/fruits", label: "🍎 Fruits" },
                { to: "/category/flowers", label: "🌸 Flowers" },
                { to: "/category/indoor-plants", label: "🏠 Indoor Plants" },
                { to: "/category/outdoor-plants", label: "🌳 Outdoor Plants" }
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-all flex items-center justify-center sm:justify-start group"
                  >
                    <span className="w-0 group-hover:w-4 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column - Premium Card Style */}
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 pb-2 border-b-2 border-green-500 inline-block text-center sm:text-left w-full sm:w-auto">
              Contact Us
            </h3>

            {/* Contact Cards Grid - 2 columns on tablet, 1 on mobile/desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">

              {/* Phone Card */}
              <a
                href="tel:+918597511728"
                className="bg-gray-800/50 hover:bg-gray-700 rounded-xl p-4 transition-all transform hover:scale-105 border border-gray-700 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                    <span className="text-green-400 text-xl">📞</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Call Us</p>
                    <p className="text-sm font-medium text-white">+91 8597511728</p>
                  </div>
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:Bikramb2026@gmail.com"
                className="bg-gray-800/50 hover:bg-gray-700 rounded-xl p-4 transition-all transform hover:scale-105 border border-gray-700 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                    <span className="text-green-400 text-xl">✉️</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email Us</p>
                    <p className="text-sm font-medium text-white break-all">Bikramb2026@gmail.com</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Address Card - Full width */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 text-xl">📍</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Nursery Address</p>
                  <p className="text-sm text-white leading-relaxed">
                    Nahata Bokchara Road,<br />
                    Near Biswas Para More,<br />
                    Pincode: 743290<br />
                    Dist: North 24 Parganas,<br />
                    West Bengal, India
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Link - Premium Button */}
            <a
              href="https://maps.app.goo.gl/nDYcFMPxgpPmhYwQ6?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl p-4 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-200">Open in</p>
                  <p className="text-base font-semibold text-white">Google Maps</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🗺️</span>
                </div>
              </div>
              <p className="text-xs text-green-200 mt-2 truncate">
                XPQ5+C54 Ichhlampur, West Bengal
              </p>
            </a>
          </div>
        </div>

        {/* Bottom Bar - Premium Divider */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright - Centered on mobile, left on desktop */}
            <p className="text-sm text-gray-400 text-center lg:text-left order-2 lg:order-1">
              © {currentYear} HomeGarden. All rights reserved.
            </p>

            {/* Premium Badges - Flex wrap for responsiveness */}
            <div className="flex flex-wrap items-center justify-center gap-3 order-1 lg:order-2">
              <span className="px-4 py-2 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                🚚 Free Delivery over ₹499
              </span>
              <span className="px-4 py-2 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                💚 100% Fresh Guarantee
              </span>
              <span className="px-4 py-2 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                🌱 Expert Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;