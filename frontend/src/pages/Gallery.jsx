import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Gallery = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plantsRes, categoriesRes] = await Promise.all([
        api.get('/plants?limit=50'),
        api.get('/categories')
      ]);
      setPlants(plantsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = filter === 'all'
    ? plants
    : plants.filter(plant => plant.category?._id === filter);

  const openLightbox = (plant) => {
    setSelectedImage(plant);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <Helmet>
        <title>Gallery - HomeGarden</title>
        <meta name="description" content="View our beautiful plant collection at HomeGarden." />
      </Helmet>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white dark:bg-gray-300 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white dark:bg-gray-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative z-10">
          <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-white">
              Our Plant Gallery
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-green-100 dark:text-green-200 max-w-2xl mx-auto lg:mx-0">
              Explore our beautiful collection of premium plants. Each image captures the essence and beauty of nature.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed with full dark mode background */}
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 lg:mb-12">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Filter by:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-xl">
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {filteredPlants.length} {filteredPlants.length === 1 ? 'Photo' : 'Photos'}
                </span>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex justify-center py-12 md:py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 auto-rows-auto">
                {filteredPlants.map((plant, index) => {
                  const isLarge = index % 5 === 0 || index % 7 === 0;
                  const rowSpan = isLarge ? 'md:row-span-2' : 'row-span-1';
                  const colSpan = isLarge ? 'md:col-span-1' : 'col-span-1';

                  return (
                    <div
                      key={plant._id}
                      onClick={() => openLightbox(plant)}
                      className={`group relative overflow-hidden rounded-xl md:rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-gray-800 ${rowSpan} ${colSpan} aspect-square md:aspect-auto bg-gray-100 dark:bg-gray-800`}
                    >
                      <img
                        src={plant.images?.[0]?.url || plant.images?.[0] || plant.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400'}
                        alt={plant.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400';
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                          <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base lg:text-lg line-clamp-1 drop-shadow-md">
                            {plant.name || 'Unnamed Plant'}
                          </h3>
                          {plant.category && (
                            <p className="text-white/80 text-[10px] sm:text-xs mt-0.5 md:mt-1 drop-shadow">
                              {plant.category.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price Badge */}
                      {plant.price && (
                        <div className="absolute top-2 right-2 bg-green-600 dark:bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg font-medium">
                          ₹{plant.price}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredPlants.length === 0 && (
                <div className="text-center py-16 md:py-20 lg:py-24">
                  <div className="text-7xl md:text-8xl mb-4 opacity-30 dark:opacity-20">🖼️</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No Images Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-md mx-auto">
                    No plants available in this category. Try selecting a different category.
                  </p>
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                      View All Photos
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 dark:bg-black/98 flex items-center justify-center p-2 sm:p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white bg-black/50 hover:bg-black/70 dark:bg-gray-800/50 dark:hover:bg-gray-800 rounded-full p-2 sm:p-3 transition-all z-20 backdrop-blur-sm"
            aria-label="Close"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[85vh] md:max-h-[90vh] overflow-hidden rounded-xl md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.images?.[0]?.url || selectedImage.images?.[0] || selectedImage.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200'}
              alt={selectedImage.name}
              className="w-full h-full object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                {selectedImage.name}
              </h2>
              {selectedImage.category && (
                <p className="text-white/80 text-sm sm:text-base drop-shadow">
                  {selectedImage.category.name}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = filteredPlants.findIndex(p => p._id === selectedImage._id);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredPlants.length - 1;
              setSelectedImage(filteredPlants[prevIndex]);
            }}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 dark:bg-gray-800/50 dark:hover:bg-gray-800 rounded-full p-2 sm:p-3 transition-all backdrop-blur-sm z-20"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = filteredPlants.findIndex(p => p._id === selectedImage._id);
              const nextIndex = currentIndex < filteredPlants.length - 1 ? currentIndex + 1 : 0;
              setSelectedImage(filteredPlants[nextIndex]);
            }}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 dark:bg-gray-800/50 dark:hover:bg-gray-800 rounded-full p-2 sm:p-3 transition-all backdrop-blur-sm z-20"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 dark:bg-gray-800/50 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium z-20">
            {filteredPlants.findIndex(p => p._id === selectedImage._id) + 1} / {filteredPlants.length}
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;