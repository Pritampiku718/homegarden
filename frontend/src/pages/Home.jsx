import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { demoCategories, demoPlants, testimonials } from '../data/demoData';
import CategoryCard from '../components/CategoryCard';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredPlants, setFeaturedPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with demo data
    setTimeout(() => {
      setCategories(demoCategories);
      setFeaturedPlants(demoPlants.filter(p => p.isFeatured).slice(0, 4));
      setLoading(false);
    }, 1000);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>HomeGarden - Premium Plants for Your Home</title>
        <meta name="description" content="Discover luxury plants for your home and garden. Premium quality fruits, flowers, indoor and outdoor plants." />
      </Helmet>

      {/* Hero Section - Cinematic Experience */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background (fallback image) */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600&auto=format&fit=crop"
            alt="Luxury Garden"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Animated Particles Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 5}s`
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
            className="max-w-4xl"
          >
            <motion.span 
              variants={fadeInUp}
              className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md text-white text-sm font-semibold rounded-full mb-8 border border-white/20"
            >
              🌱 Premium Nursery Since 2020
            </motion.span>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-7xl md:text-8xl font-bold text-white mb-6 leading-tight"
            >
              Bring Nature Into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 block">
                Your Home
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed"
            >
              Discover our curated collection of 200+ premium plants. Each plant is hand-picked and nurtured with care to bring life and beauty to your space.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap gap-4"
            >
              <Link 
                to="/plants" 
                className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-full font-semibold transition-all transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Explore Collection
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              
              <Link 
                to="/contact" 
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-10 py-5 rounded-full font-semibold transition-all border border-white/30 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Talk to an Expert
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-3 gap-8 mt-16"
            >
              <div>
                <div className="text-3xl font-bold text-white">200+</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider">Plant Varieties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">15k+</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider">Customer Rating</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/80 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Categories Section - Luxury Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-green-600 dark:text-green-400 font-semibold text-sm tracking-[0.2em] uppercase mb-4 block">
              Our Collections
            </span>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore our carefully curated categories, each featuring premium plants suited for every space and skill level.
            </p>
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
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  variants={fadeInUp}
                  custom={index}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Plants Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-green-600 dark:text-green-400 font-semibold text-sm tracking-[0.2em] uppercase mb-4 block">
              Editor's Pick
            </span>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Plants
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Hand-selected premium plants that our customers love
            </p>
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
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
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

      {/* Features Section - Premium */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">Why Choose HomeGarden</h2>
            <p className="text-xl text-green-100">Experience the difference with our premium service</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: '🌱',
                title: 'Premium Quality',
                description: 'Every plant is hand-picked and nurtured by expert horticulturists'
              },
              {
                icon: '🚚',
                title: 'White-Glove Delivery',
                description: 'Plants delivered in custom packaging with care instructions'
              },
              {
                icon: '💚',
                title: 'Lifetime Support',
                description: 'Free expert advice for the life of your plants'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-green-100 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-green-600 dark:text-green-400 font-semibold text-sm tracking-[0.2em] uppercase mb-4 block">
              Testimonials
            </span>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join thousands of happy plant parents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow relative"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-6xl text-green-200 dark:text-green-900/30 font-serif">"</div>
                
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 italic relative z-10">
                  "{testimonial.comment}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Space?</h2>
            <p className="text-xl text-green-100 mb-10">
              Join thousands of happy customers who have brought nature into their homes
            </p>
            <Link
              to="/plants"
              className="group inline-flex items-center bg-white text-green-600 px-10 py-5 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Shopping
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;