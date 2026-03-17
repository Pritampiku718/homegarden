import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AllPlants = () => {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    if (plants.length > 0) {
      applyFilters();
    }
  }, [plants, searchTerm, priceRange, sortBy, sortOrder, showInStockOnly]);

  useEffect(() => {
    // Calculate active filter count
    let count = 0;
    if (searchTerm) count++;
    if (priceRange.min || priceRange.max) count++;
    if (sortBy !== 'name') count++;
    if (sortOrder !== 'asc') count++;
    if (showInStockOnly) count++;
    setActiveFilterCount(count);
  }, [searchTerm, priceRange, sortBy, sortOrder, showInStockOnly]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/plants');
      setPlants(data.data || []);
      setFilteredPlants(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load plants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...plants];

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(plant =>
        plant.name.toLowerCase().includes(term) ||
        (plant.description && plant.description.toLowerCase().includes(term))
      );
    }

    // Apply price range
    if (priceRange.min) {
      result = result.filter(plant => plant.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(plant => plant.price <= parseFloat(priceRange.max));
    }

    // Apply in stock filter
    if (showInStockOnly) {
      result = result.filter(plant => plant.inStock === true);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'newest') {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPlants(result);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setSortOrder('asc');
    setShowInStockOnly(false);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Helmet>
        <title>All Plants - HomeGarden</title>
        <meta name="description" content="Browse our complete collection of premium plants at HomeGarden." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sticky Header with Search and Filter */}
        <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Search Bar - 70% width */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-3.5 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Button - 30% width */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${showFilters
                    ? 'bg-green-600 text-white'
                    : activeFilterCount > 0
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="font-medium text-sm hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-green-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="container mx-auto px-4 py-4 animate-slide-down">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filter Plants</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 font-medium px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Price Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Price Range (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="min"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={handlePriceChange}
                      className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                    <input
                      type="number"
                      name="max"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={handlePriceChange}
                      className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                {/* In Stock Toggle */}
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show in stock only
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showInStockOnly}
                      onChange={(e) => setShowInStockOnly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                </label>

                {/* Sort Options */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                All Plants
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} found
              </p>
            </div>

            {/* Active Filter Tags - Mobile */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="sm:hidden text-sm text-red-600 font-medium px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Active Filter Tags - Desktop */}
          {activeFilterCount > 0 && (
            <div className="hidden sm:flex flex-wrap gap-2 mb-6">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-700 dark:text-blue-400 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full">
                  ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                  <button
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="ml-2 text-purple-700 dark:text-purple-400 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {showInStockOnly && (
                <span className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                  In Stock Only
                  <button
                    onClick={() => setShowInStockOnly(false)}
                    className="ml-2 text-green-700 dark:text-green-400 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== 'name' && (
                <span className="inline-flex items-center px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm rounded-full">
                  Sort: {sortBy}
                  <button
                    onClick={() => setSortBy('name')}
                    className="ml-2 text-orange-700 dark:text-orange-400 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Plants Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorMessage message={error} retry={fetchPlants} />
          ) : filteredPlants.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4 opacity-30">🌱</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Plants Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? `No plants match "${searchTerm}"` : 'No plants available'}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredPlants.map(plant => (
                <PlantCard key={plant._id} plant={plant} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default AllPlants;