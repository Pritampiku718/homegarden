import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../contexts/CartContext';

const AllPlants = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPlants, setTotalPlants] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVariety, setSelectedVariety] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Filtered dropdown options
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredVarieties, setFilteredVarieties] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Update filtered categories when section changes
  useEffect(() => {
    if (selectedSection !== 'all') {
      const filtered = categories.filter(cat => cat.section?._id === selectedSection);
      setFilteredCategories(filtered);
      if (!filtered.some(cat => cat._id === selectedCategory)) {
        setSelectedCategory('all');
        setSelectedVariety('all');
      }
    } else {
      setFilteredCategories(categories);
    }
  }, [selectedSection, categories]);

  // Update filtered varieties when category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      const filtered = varieties.filter(varie => varie.category?._id === selectedCategory);
      setFilteredVarieties(filtered);
      if (!filtered.some(varie => varie._id === selectedVariety)) {
        setSelectedVariety('all');
      }
    } else if (selectedSection !== 'all') {
      const filtered = varieties.filter(varie => varie.section?._id === selectedSection);
      setFilteredVarieties(filtered);
    } else {
      setFilteredVarieties(varieties);
    }
  }, [selectedCategory, selectedSection, varieties]);

  useEffect(() => {
    if (plants.length > 0) {
      applyFilters();
    }
  }, [plants, searchTerm, selectedSection, selectedCategory, selectedVariety, priceRange, sortBy, sortOrder, showInStockOnly]);

  useEffect(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedSection !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedVariety !== 'all') count++;
    if (priceRange.min || priceRange.max) count++;
    if (sortBy !== 'name') count++;
    if (sortOrder !== 'asc') count++;
    if (showInStockOnly) count++;
    setActiveFilterCount(count);
  }, [searchTerm, selectedSection, selectedCategory, selectedVariety, priceRange, sortBy, sortOrder, showInStockOnly]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plantsRes, sectionsRes, categoriesRes, varietiesRes] = await Promise.all([
        api.get('/plants', { params: { limit: 100 } }),
        api.get('/sections'),
        api.get('/categories'),
        api.get('/varieties')
      ]);

      setPlants(plantsRes.data.data || []);
      setFilteredPlants(plantsRes.data.data || []);
      setTotalPlants(plantsRes.data.total || 0);
      setSections(sectionsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setVarieties(varietiesRes.data.data || []);
      setFilteredCategories(categoriesRes.data.data || []);
      setFilteredVarieties(varietiesRes.data.data || []);

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

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(plant =>
        plant.name.toLowerCase().includes(term) ||
        (plant.description && plant.description.toLowerCase().includes(term))
      );
    }

    if (selectedSection !== 'all') {
      result = result.filter(plant => plant.section?._id === selectedSection);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(plant => plant.category?._id === selectedCategory);
    }

    if (selectedVariety !== 'all') {
      result = result.filter(plant => plant.variety?._id === selectedVariety);
    }

    if (priceRange.min) {
      result = result.filter(plant => plant.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(plant => plant.price <= parseFloat(priceRange.max));
    }

    if (showInStockOnly) {
      result = result.filter(plant => plant.inStock === true);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'section') {
        comparison = (a.section?.name || '').localeCompare(b.section?.name || '');
      } else if (sortBy === 'category') {
        comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
      } else if (sortBy === 'variety') {
        comparison = (a.variety?.name || '').localeCompare(b.variety?.name || '');
      } else if (sortBy === 'newest') {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPlants(result);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSection('all');
    setSelectedCategory('all');
    setSelectedVariety('all');
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
              {/* Search Bar */}
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

              {/* Filter Button */}
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
                {/* Section Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Section
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setSelectedCategory('all');
                      setSelectedVariety('all');
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Sections</option>
                    {sections.map(section => (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedVariety('all');
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={selectedSection === 'all' && filteredCategories.length === 0}
                  >
                    <option value="all">All Categories</option>
                    {filteredCategories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variety Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Variety
                  </label>
                  <select
                    value={selectedVariety}
                    onChange={(e) => setSelectedVariety(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={selectedCategory === 'all' && selectedSection === 'all' && filteredVarieties.length === 0}
                  >
                    <option value="all">All Varieties</option>
                    {filteredVarieties.map(variety => (
                      <option key={variety._id} value={variety._id}>
                        {variety.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                      <option value="section">Section</option>
                      <option value="category">Category</option>
                      <option value="variety">Variety</option>
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
                Showing {filteredPlants.length} of {totalPlants} plants
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
              {selectedSection !== 'all' && (
                <span className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                  Section: {sections.find(s => s._id === selectedSection)?.name}
                  <button
                    onClick={() => setSelectedSection('all')}
                    className="ml-2 text-green-700 dark:text-green-400 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full">
                  Category: {categories.find(c => c._id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-purple-700 dark:text-purple-400 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedVariety !== 'all' && (
                <span className="inline-flex items-center px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm rounded-full">
                  Variety: {varieties.find(v => v._id === selectedVariety)?.name}
                  <button
                    onClick={() => setSelectedVariety('all')}
                    className="ml-2 text-orange-700 dark:text-orange-400 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-sm rounded-full">
                  ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                  <button
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="ml-2 text-pink-700 dark:text-pink-400 hover:text-pink-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {showInStockOnly && (
                <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-full">
                  In Stock Only
                  <button
                    onClick={() => setShowInStockOnly(false)}
                    className="ml-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== 'name' && (
                <span className="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm rounded-full">
                  Sort: {sortBy}
                  <button
                    onClick={() => setSortBy('name')}
                    className="ml-2 text-amber-700 dark:text-amber-400 hover:text-amber-900"
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
            <ErrorMessage message={error} retry={fetchData} />
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
                <div key={plant._id}>
                  <PlantCard plant={plant} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Animation */}
      <style>{`
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