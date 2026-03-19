import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import api from '../services/api';
import CategoryCard from '../components/CategoryCard';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [sections, setSections] = useState([]);
  const [sectionsWithCounts, setSectionsWithCounts] = useState([]);
  const [featuredPlants, setFeaturedPlants] = useState([]);
  const [stats, setStats] = useState({
    plants: 0,
    categories: 0,
    varieties: 0,
    customers: '1k+'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all sections
      const sectionsRes = await api.get('/sections');
      const allSections = sectionsRes.data.data || [];
      const firstSixSections = allSections.slice(0, 6);
      setSections(firstSixSections);

      // Fetch plants for featured section
      const plantsRes = await api.get('/plants');
      const allPlants = plantsRes.data.data || [];
      setFeaturedPlants(allPlants.slice(0, 6));

      // Fetch counts for stats
      const categoriesRes = await api.get('/categories');
      const varietiesRes = await api.get('/varieties');

      setStats({
        plants: allPlants.length,
        categories: categoriesRes.data.data?.length || 0,
        varieties: varietiesRes.data.data?.length || 0,
        customers: '1k+'
      });

      // Fetch plant counts for each section
      const sectionsWithPlantCounts = await Promise.all(
        firstSixSections.map(async (section) => {
          try {
            // Get plants in this section
            const plantsInSection = await api.get(`/plants?section=${section._id}&limit=1`);
            const plantCount = plantsInSection.data.total || 0;

            return {
              ...section,
              plantCount // Add plant count to section object
            };
          } catch (error) {
            console.error(`Error fetching plant count for section ${section.name}:`, error);
            return {
              ...section,
              plantCount: 0
            };
          }
        })
      );

      setSectionsWithCounts(sectionsWithPlantCounts);

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>HomeGarden - Premium Plants for Your Home</title>
        <meta name="description" content="Discover luxury plants for your home and garden. Premium quality fruits, flowers, indoor and outdoor plants." />
      </Helmet>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative h-[85vh] md:h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600&auto=format&fit=crop"
            alt="Luxury Garden"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        {/* Animated Particles - Reduced for mobile performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block px-4 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-semibold rounded-full mb-4 md:mb-8 border border-white/20"
            >
              🌱 Premium Nursery Since 2026
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-3 md:mb-6 leading-tight"
            >
              Bring Nature
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 block">
                Into Your Home
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-lg lg:text-xl text-gray-200 mb-6 md:mb-10 max-w-xl md:max-w-2xl leading-relaxed"
            >
              Discover our curated collection of {stats.plants}+ premium plants. Each plant is hand-picked and nurtured with care.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <Link
                to="/plants"
                className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 md:px-10 md:py-5 rounded-full text-sm md:text-base font-semibold transition-all transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 overflow-hidden text-center"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Explore Collection
                  <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>

              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 md:px-10 md:py-5 rounded-full text-sm md:text-base font-semibold transition-all border border-white/30 flex items-center justify-center"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Talk to an Expert
              </Link>
            </motion.div>

            {/* Stats - Responsive Grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-3 md:gap-8 mt-8 md:mt-16"
            >
              <div className="text-center md:text-left">
                <div className="text-xl md:text-3xl lg:text-4xl font-bold text-white">{stats.plants}+</div>
                <div className="text-[10px] md:text-xs lg:text-sm text-gray-300 uppercase tracking-wider">Plants</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl md:text-3xl lg:text-4xl font-bold text-white">{stats.categories}+</div>
                <div className="text-[10px] md:text-xs lg:text-sm text-gray-300 uppercase tracking-wider">Categories</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl md:text-3xl lg:text-4xl font-bold text-white">{stats.customers}</div>
                <div className="text-[10px] md:text-xs lg:text-sm text-gray-300 uppercase tracking-wider">Happy Customers</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator - Hidden on very small screens */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
        >
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 md:w-1 md:h-3 bg-white/80 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Categories Section - Maximum 6 Categories with View All */}
      <section className="py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-16"
          >
            <div className="text-center md:text-left max-w-2xl">
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm tracking-[0.2em] uppercase mb-2 md:mb-4 block">
                Our Collections
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-6">
                Shop by Category
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300">
                Explore our featured categories and find your perfect green companion.
              </p>
            </div>

            {/* View All Categories Link with Arrow */}
            <Link
              to="/categories"
              className="group inline-flex items-center text-green-600 dark:text-green-400 font-semibold text-sm md:text-base mt-4 md:mt-0 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <span>View All Categories</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6"
            >
              {sectionsWithCounts.map((section, index) => (
                <motion.div
                  key={section._id}
                  variants={fadeInUp}
                  custom={index}
                >
                  <CategoryCard category={section} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Plants Section - FIXED for desktop, perfect on mobile */}
      <section className="py-12 md:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-16"
          >
            <div className="text-center md:text-left max-w-2xl">
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm tracking-[0.2em] uppercase mb-2 md:mb-4 block">
                Editor's Choice
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-6">
                Featured Plants
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300">
                Hand-selected premium plants that our customers love
              </p>
            </div>

            {/* View All Plants Link with Arrow */}
            <Link
              to="/plants"
              className="group inline-flex items-center text-green-600 dark:text-green-400 font-semibold text-sm md:text-base mt-4 md:mt-0 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <span>View All Plants</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
            >
              {featuredPlants.map((plant, index) => (
                <motion.div
                  key={plant._id}
                  variants={fadeInUp}
                  custom={index}
                >
                  <PlantCard plant={plant} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section - Updated Features */}
      <section className="py-12 md:py-24 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center max-w-2xl mx-auto mb-8 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6">Why Choose HomeGarden</h2>
            <p className="text-sm md:text-base lg:text-lg text-green-100">Experience the difference with our premium service</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                icon: '🌱',
                title: 'Premium Quality',
                description: 'Every plant is hand-picked by expert horticulturists'
              },
              {
                icon: '🚚',
                title: 'Free Delivery',
                description: 'Free delivery on orders over ₹499'
              },
              {
                icon: '💚',
                title: 'Lifetime Support',
                description: 'Free expert advice for the life of your plants'
              },
              {
                icon: '🌿',
                title: 'Eco-Friendly',
                description: 'Sustainable practices and biodegradable pots'
              },
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'Competitive prices with 100% satisfaction guarantee'
              },
              {
                icon: '🏆',
                title: 'Guaranteed Health',
                description: '30-day healthy plant guarantee'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true, margin: "-30px" }}
                className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all group"
              >
                <div className="flex items-center gap-3 md:block md:text-center">
                  <div className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/20 rounded-lg md:rounded-2xl flex items-center justify-center text-2xl md:text-4xl lg:text-5xl mb-0 md:mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-xl lg:text-2xl font-bold mb-0 md:mb-2">{feature.title}</h3>
                    <p className="text-xs md:text-sm lg:text-base text-green-100 line-clamp-2">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6">Ready to Transform Your Space?</h2>
            <p className="text-sm md:text-base lg:text-lg text-green-100 mb-6 md:mb-10 px-4">
              Join thousands of happy customers who have brought nature into their homes
            </p>
            <Link
              to="/plants"
              className="group inline-flex items-center bg-white text-green-600 px-6 py-3 md:px-10 md:py-5 rounded-full text-sm md:text-base lg:text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Shopping
              <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <Link
        to="/contact"
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-green-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition-all hover:scale-110"
      >
        <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z" />
        </svg>
      </Link>
    </>
  );
};

export default Home;