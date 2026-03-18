import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PlantsPage = () => {
  const { sectionSlug, categorySlug } = useParams();
  const [section, setSection] = useState(null);
  const [category, setCategory] = useState(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlants, setFilteredPlants] = useState([]);

  useEffect(() => {
    fetchData();
  }, [sectionSlug, categorySlug]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const filtered = plants.filter(plant =>
        plant.name.toLowerCase().includes(term) ||
        (plant.description && plant.description.toLowerCase().includes(term))
      );
      setFilteredPlants(filtered);
    } else {
      setFilteredPlants(plants);
    }
  }, [searchTerm, plants]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const sectionRes = await api.get(`/sections/slug/${sectionSlug}`);
      const sectionData = sectionRes.data.data?.section || sectionRes.data;
      setSection(sectionData);

      const categoryRes = await api.get(`/categories/slug/${categorySlug}`);
      const categoryData = categoryRes.data.data?.category || categoryRes.data;
      setCategory(categoryData);

      const plantsRes = await api.get(`/plants?category=${categoryData._id}`);
      setPlants(plantsRes.data.data || []);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Optional: Add search submit behavior if needed
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;
  if (!category || !section) return <ErrorMessage message="Category not found" />;

  const totalPlants = plants.length;
  const hasPlants = totalPlants > 0;

  return (
    <>
      <Helmet>
        <title>All {category.name} Plants - HomeGarden</title>
        <meta name="description" content={`Browse all ${category.name} plants available at HomeGarden`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              All {category.name} Plants
            </h1>

            {/* Stats badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-green-100 dark:bg-green-900/40 px-3 py-1.5 rounded-lg">
                <span className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-semibold">
                  {totalPlants} {totalPlants === 1 ? 'Plant' : 'Plants'} Available
                </span>
              </div>
              {!hasPlants && (
                <div className="bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1.5 rounded-lg">
                  <span className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder={`Search plants in ${category.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white text-sm sm:text-base shadow-sm"
              />
              <svg
                className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 sm:right-4 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} found
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </form>

          {/* Plants Grid */}
          {filteredPlants.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {searchTerm
                  ? `No plants found matching "${searchTerm}"`
                  : 'No plants available in this category yet.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-green-600 dark:text-green-400 text-sm font-medium hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {filteredPlants.map((plant) => (
                <PlantCard key={plant._id} plant={plant} />
              ))}
            </div>
          )}

          {/* Back link - Simplified */}
          <div className="mt-8 sm:mt-10 text-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm sm:text-base font-medium transition-colors group"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlantsPage;