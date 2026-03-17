import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Variety = () => {
  const { sectionSlug, categorySlug } = useParams();
  const [section, setSection] = useState(null);
  const [category, setCategory] = useState(null);
  const [varieties, setVarieties] = useState([]);
  const [filteredVarieties, setFilteredVarieties] = useState([]);
  const [plantSlugs, setPlantSlugs] = useState({});
  const [plantCounts, setPlantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [sectionSlug, categorySlug]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const filtered = varieties.filter(variety =>
        variety.name.toLowerCase().includes(term) ||
        (variety.description && variety.description.toLowerCase().includes(term))
      );
      setFilteredVarieties(filtered);
    } else {
      setFilteredVarieties(varieties);
    }
  }, [searchTerm, varieties]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch section
      const sectionRes = await api.get(`/sections/slug/${sectionSlug}`);
      const sectionData = sectionRes.data.data?.section || sectionRes.data;
      setSection(sectionData);

      // Fetch category
      const categoryRes = await api.get(`/categories/slug/${categorySlug}`);
      const categoryData = categoryRes.data.data?.category || categoryRes.data;
      setCategory(categoryData);

      // Fetch varieties (subcategories) for this category
      const varietiesRes = await api.get(`/subcategories/category/${categoryData._id}`);
      const varietiesData = varietiesRes.data.data || [];
      setVarieties(varietiesData);

      // Fetch plant counts and first plant slug for each variety
      const counts = {};
      const slugMap = {};

      await Promise.all(
        varietiesData.map(async (variety) => {
          try {
            const plantsRes = await api.get(`/plants?subCategory=${variety._id}`);
            counts[variety._id] = plantsRes.data.total || 0;

            // Get the first plant's slug if available
            if (plantsRes.data.data && plantsRes.data.data.length > 0) {
              slugMap[variety._id] = plantsRes.data.data[0].slug;
            }
          } catch (err) {
            console.error(`Error fetching plants for ${variety.name}:`, err);
            counts[variety._id] = 0;
          }
        })
      );

      setPlantCounts(counts);
      setPlantSlugs(slugMap);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && filteredVarieties.length === 1) {
      const variety = filteredVarieties[0];
      const plantSlug = plantSlugs[variety._id];
      if (plantSlug) {
        navigate(`/categories/${section.slug}/${category.slug}/${plantSlug}`);
      }
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;
  if (!category || !section) return <ErrorMessage message="Category not found" />;

  const totalPlants = Object.values(plantCounts).reduce((sum, count) => sum + count, 0);
  const hasPlants = totalPlants > 0;

  return (
    <>
      <Helmet>
        <title>{category.name} - {section.name} - HomeGarden</title>
        <meta name="description" content={`Explore ${category.name} varieties at HomeGarden`} />
      </Helmet>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Category Header - Compact */}
        <div className="relative rounded-xl overflow-hidden mb-6 h-32 md:h-40">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-800" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center px-4">
              {category.name} Varieties
            </h1>
          </div>
        </div>

        {/* Stats Row - Compact */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
              <span className="text-green-700 dark:text-green-400 text-sm font-semibold">
                {varieties.length} Varieties
              </span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
              <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">
                {totalPlants} Plants
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar - Compact */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder={`Search varieties in ${category.name}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
            />
            <svg
              className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"
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
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {filteredVarieties.length} {filteredVarieties.length === 1 ? 'variety' : 'varieties'} found
          </p>
        </form>

        {/* Message if no plants available */}
        {!hasPlants && varieties.length > 0 && (
          <div className="mb-5 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              No plants available in these varieties yet. Please check back later.
            </p>
          </div>
        )}

        {/* "View All Plants" Button - Links to all plants page */}
        {hasPlants && (
          <div className="mb-5 text-center">
            <Link
              to={`/categories/${section.slug}/${category.slug}/all`}
              className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 text-sm group"
            >
              <span>View All {totalPlants} Plants in {category.name}</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* Varieties Grid */}
        {filteredVarieties.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8 text-sm">
            No varieties found.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredVarieties.map((variety) => {
              const plantSlug = plantSlugs[variety._id];
              const plantCount = plantCounts[variety._id] || 0;
              const hasPlant = !!plantSlug;

              return (
                <div key={variety._id} className="group">
                  {hasPlant ? (
                    <Link
                      to={`/categories/${section.slug}/${category.slug}/${plantSlug}`}
                      className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {variety.image ? (
                          <img
                            src={variety.image}
                            alt={variety.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <span className="text-3xl text-white opacity-50">🔖</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
                            {variety.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-white/80 text-xs">
                              {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
                            </span>
                            <span className="text-white/90 text-xs font-medium flex items-center">
                              View
                              <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm opacity-75 cursor-not-allowed">
                      <div className="relative aspect-square overflow-hidden">
                        {variety.image ? (
                          <img
                            src={variety.image}
                            alt={variety.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <span className="text-3xl text-white opacity-50">🔖</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
                            {variety.name}
                          </h3>
                          <span className="text-white/60 text-xs">
                            No plants
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Variety;