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
      <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Our Plant Gallery
            </h1>
            <p className="text-lg text-green-100">
              Explore our beautiful collection of premium plants. Each image captures the essence and beauty of nature.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPlants.length} {filteredPlants.length === 1 ? 'photo' : 'photos'}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Masonry Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 auto-rows-auto">
              {filteredPlants.map((plant, index) => {
                // Calculate random heights for masonry effect
                const isLarge = index % 5 === 0 || index % 7 === 0;
                const rowSpan = isLarge ? 'row-span-2' : 'row-span-1';

                return (
                  <div
                    key={plant._id}
                    onClick={() => openLightbox(plant)}
                    className={`group relative overflow-hidden rounded-xl cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${rowSpan}`}
                  >
                    {/* Image */}
                    <img
                      src={plant.images?.[0] || plant.image}
                      alt={plant.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1">
                          {plant.name}
                        </h3>
                        {plant.category && (
                          <p className="text-white/80 text-xs mt-1">
                            {plant.category.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {plant.price ? `₹${plant.price}` : 'View'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredPlants.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-30">🖼️</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Images Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No plants available in this category.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.images?.[0] || selectedImage.image}
              alt={selectedImage.name}
              className="w-full h-full object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.name}</h2>
              <div className="flex flex-wrap gap-4">
                {selectedImage.category && (
                  <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                    {selectedImage.category.name}
                  </span>
                )}
                {selectedImage.price && (
                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                    ₹{selectedImage.price}
                  </span>
                )}
                {selectedImage.section && (
                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                    {selectedImage.section.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = filteredPlants.findIndex(p => p._id === selectedImage._id);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredPlants.length - 1;
              setSelectedImage(filteredPlants[prevIndex]);
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {filteredPlants.findIndex(p => p._id === selectedImage._id) + 1} / {filteredPlants.length}
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;