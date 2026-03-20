import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Add this import

const PlantDetails = () => {
  const { sectionSlug, categorySlug, plantSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (plantSlug) {
      fetchPlant();
    }
  }, [plantSlug]);

  const fetchPlant = async () => {
    try {
      setLoading(true);
      console.log('Fetching plant with slug:', plantSlug);

      const { data } = await api.get(`/plants/slug/${plantSlug}`);
      console.log('Plant data:', data);

      const plantData = data.data?.plant || data.data || data;
      setPlant(plantData);

    } catch (err) {
      console.error('Error fetching plant:', err);
      setError(err.response?.data?.message || 'Failed to load plant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(plant);
    // Add toast notification exactly like PlantCard
    toast.success(`${plant?.name || 'Plant'} added to cart!`, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: 'bold',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
      },
      icon: '🛒',
    });
  };

  const handleBuyNow = () => {
    addToCart(plant);
    navigate('/checkout');
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const images = plant?.images || (plant?.image ? [{ url: plant.image }] : []);
    if (images.length <= 1) return;

    if (touchStart - touchEnd > 50) {
      // Swipe left - next image
      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right - previous image
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  };

  const handlePreviousImage = () => {
    const images = plant?.images || (plant?.image ? [{ url: plant.image }] : []);
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    const images = plant?.images || (plant?.image ? [{ url: plant.image }] : []);
    setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchPlant} />;
  if (!plant) return <ErrorMessage message="Plant not found" />;

  const section = plant.section || {};
  const category = plant.category || {};
  const images = plant.images || (plant.image ? [{ url: plant.image }] : []);
  const mainImage = images[selectedImage]?.url || images[0]?.url || plant.image;

  return (
    <>
      <Helmet>
        <title>{plant.name || 'Plant Details'} - HomeGarden</title>
        <meta name="description" content={plant.description?.substring(0, 160) || 'Plant details'} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8 max-w-6xl">

          {/* Breadcrumb - Hidden on mobile */}
          <div className="hidden sm:block mb-6">
            <nav className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <Link to="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/plants" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Plants</Link>
              {section?.name && (
                <>
                  <span className="mx-2">/</span>
                  <Link to={`/categories/${section.slug}`} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    {section.name}
                  </Link>
                </>
              )}
              {category?.name && (
                <>
                  <span className="mx-2">/</span>
                  <Link to={`/categories/${section?.slug}/${category.slug}`} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    {category.name}
                  </Link>
                </>
              )}
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px]">
                {plant.name}
              </span>
            </nav>
          </div>

          {/* Back Button - Mobile Only */}
          <div className="mb-3 sm:hidden">
            <Link
              to={category?.slug ? `/categories/${section?.slug}/${category.slug}` : '/categories'}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm font-medium transition-colors group"
            >
              <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">

            {/* Image Gallery Section - Mobile Slider, Desktop Grid */}
            <div className="space-y-3 lg:space-y-4">
              {/* Main Image with Navigation - Mobile Slider with Dots */}
              <div
                className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 aspect-square max-h-[400px] lg:max-h-[450px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={mainImage}
                  alt={plant.name || 'Plant'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800';
                  }}
                />

                {/* Premium Badge - Smaller on mobile */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-1 lg:px-3 lg:py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] lg:text-xs font-bold rounded-full shadow-lg">
                    Premium
                  </span>
                </div>

                {/* Stock Badge */}
                {plant.inStock === false && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 lg:px-3 lg:py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] lg:text-xs font-bold rounded-full shadow-lg border border-red-400/30">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Navigation Arrows - Desktop Only */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="hidden lg:flex absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="hidden lg:flex absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Mobile: 3 Dots Indicator */}
              {images.length > 1 && (
                <div className="flex justify-center items-center gap-1.5 lg:hidden">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${selectedImage === index
                        ? 'w-4 bg-green-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Desktop Thumbnail Grid */}
              {images.length > 1 && (
                <div className="hidden lg:grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedImage === index
                        ? 'border-green-500 shadow-lg'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Plant Details - More Compact */}
            <div className="space-y-4 lg:space-y-5">

              {/* Title Section */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                  {plant.name || 'Unnamed Plant'}
                </h1>

                {/* Category Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {section?.name && (
                    <Link
                      to={`/categories/${section.slug}`}
                      className="px-2 py-1 lg:px-3 lg:py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full hover:shadow-md transition-all border border-green-200 dark:border-green-800"
                    >
                      {section.name}
                    </Link>
                  )}
                  {category?.name && (
                    <Link
                      to={`/categories/${section?.slug}/${category.slug}`}
                      className="px-2 py-1 lg:px-3 lg:py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full hover:shadow-md transition-all border border-blue-200 dark:border-blue-800"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              </div>

              {/* Price Section - More Compact */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                  <span className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">
                    ₹{plant.price || 0}
                  </span>
                </div>
                {plant.inStock !== false && (
                  <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                    In Stock
                  </span>
                )}
              </div>

              {/* Description - Compact */}
              {plant.description && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3 lg:line-clamp-none">
                    {plant.description}
                  </p>
                </div>
              )}

              {/* Quick Info Cards - Compact */}
              <div className="grid grid-cols-2 gap-2">
                {plant.category?.name && (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {plant.category.name}
                    </p>
                  </div>
                )}
                {plant.section?.name && (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Section</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {plant.section.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Compact */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={plant.inStock === false}
                  className={`group relative flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm ${plant.inStock === false && 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={plant.inStock === false}
                  className={`group relative flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm ${plant.inStock === false && 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </button>
              </div>

              {/* Back Link - Compact */}
              <div className="pt-2 text-center">
                <Link
                  to={category?.slug ? `/categories/${section?.slug}/${category.slug}` : '/categories'}
                  className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors group text-xs"
                >
                  <svg className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to {category?.name || 'Category'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlantDetails;