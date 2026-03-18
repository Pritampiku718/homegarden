import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { sendWhatsAppOrder } from '../utils/whatsapp';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PlantDetails = () => {
  const { sectionSlug, categorySlug, plantSlug } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

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

      // Handle different response structures
      const plantData = data.data?.plant || data.data || data;
      setPlant(plantData);

    } catch (err) {
      console.error('Error fetching plant:', err);
      setError(err.response?.data?.message || 'Failed to load plant details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchPlant} />;
  if (!plant) return <ErrorMessage message="Plant not found" />;

  // Safely access nested properties
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">

          {/* Back Button - Mobile First */}
          <div className="mb-4 sm:mb-6">
            <Link
              to={category?.slug ? `/categories/${section?.slug}/${category.slug}` : '/categories'}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm sm:text-base font-medium transition-colors group"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {category?.name || 'Category'}
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">

            {/* Plant Images Section - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800 aspect-square max-h-[500px]">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={plant.name || 'Plant'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800">
                    <span className="text-6xl sm:text-7xl text-white opacity-50">🌿</span>
                  </div>
                )}

                {/* Stock Badge */}
                {plant.inStock === false && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    Out of Stock
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery - Only show if multiple images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                          ? 'border-green-500 scale-105 shadow-md'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <img
                        src={img.url}
                        alt={`${plant.name} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Plant Details - Mobile Optimized */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {plant.name || 'Unnamed Plant'}
              </h1>

              {/* Category Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {section?.name && (
                  <Link
                    to={`/categories/${section.slug}`}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs sm:text-sm rounded-full hover:bg-green-200 dark:hover:bg-green-900/60 transition shadow-sm"
                  >
                    {section.name}
                  </Link>
                )}
                {category?.name && (
                  <Link
                    to={`/categories/${section?.slug}/${category.slug}`}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs sm:text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/60 transition shadow-sm"
                  >
                    {category.name}
                  </Link>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
                  ₹{plant.price || 0}
                </span>
                {plant.inStock !== false && (
                  <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
                    In Stock
                  </span>
                )}
              </div>

              {/* Description */}
              {plant.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {plant.description}
                  </p>
                </div>
              )}

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                {plant.category?.name && (
                  <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {plant.category.name}
                    </p>
                  </div>
                )}
                {plant.section?.name && (
                  <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Section</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {plant.section.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Stack on mobile, side by side on larger screens */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => sendWhatsAppOrder(plant.name || 'Plant')}
                  disabled={plant.inStock === false}
                  className={`flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 sm:py-4 rounded-xl transition-all text-sm sm:text-base font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${plant.inStock === false && 'opacity-50 cursor-not-allowed hover:bg-green-600'
                    }`}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z" />
                  </svg>
                  <span>Order on WhatsApp</span>
                </button>

                <Link
                  to={category?.slug ? `/categories/${section?.slug}/${category.slug}` : '/categories'}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 sm:py-4 rounded-xl transition-all text-sm sm:text-base font-semibold text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to {category?.name || 'Category'}</span>
                </Link>
              </div>

              {/* Share/Wishlist Buttons (Optional) */}
              <div className="flex items-center gap-3 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlantDetails;