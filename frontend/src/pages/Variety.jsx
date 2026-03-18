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
      setError(null);

      // Fetch section
      const sectionRes = await api.get(`/sections/slug/${sectionSlug}`);
      const sectionData = sectionRes.data.data?.section || sectionRes.data;

      if (!sectionData || !sectionData._id) {
        throw new Error('section_not_found');
      }
      setSection(sectionData);

      // Fetch category
      const categoryRes = await api.get(`/categories/slug/${categorySlug}`);
      const categoryData = categoryRes.data.data?.category || categoryRes.data;

      if (!categoryData || !categoryData._id) {
        throw new Error('category_not_found');
      }
      setCategory(categoryData);

      console.log('✅ Category found:', categoryData.name);
      console.log('Category ID:', categoryData._id);

      // Fetch varieties for this category
      const varietiesRes = await api.get(`/varieties/category/${categoryData._id}`);
      const varietiesData = varietiesRes.data.data || [];
      console.log('📦 Varieties found:', varietiesData.length);

      setVarieties(varietiesData);

      // Only fetch plant counts if there are varieties
      if (varietiesData.length > 0) {
        const counts = {};
        const slugMap = {};

        await Promise.all(
          varietiesData.map(async (variety) => {
            try {
              const plantsRes = await api.get(`/plants?variety=${variety._id}`);
              counts[variety._id] = plantsRes.data.total || 0;

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
      }

    } catch (err) {
      console.error('Error in fetchData:', err);

      if (err.message === 'section_not_found') {
        setError('Section not found. Please check the URL.');
      } else if (err.message === 'category_not_found') {
        setError('Category not found. Please check the URL.');
      } else if (err.response?.status === 404) {
        // Check if it's the varieties endpoint that returned 404
        if (err.config?.url?.includes('/varieties/')) {
          // This is fine - just means no varieties
          console.log('No varieties found for this category');
          setVarieties([]);
          return; // Don't set error
        } else {
          setError('The requested page could not be found.');
        }
      } else {
        setError('Failed to load data. Please try again.');
      }
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

  const handleRetry = () => {
    fetchData();
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Show error only for section/category not found
  if (error) return <ErrorMessage message={error} retry={handleRetry} />;

  // If section or category is missing (shouldn't happen if no error)
  if (!category || !section) {
    return <ErrorMessage message="Category not found" retry={handleRetry} />;
  }

  const totalPlants = Object.values(plantCounts).reduce((sum, count) => sum + count, 0);
  const hasVarieties = varieties.length > 0;
  const hasPlants = totalPlants > 0;

  return (
    <>
      <Helmet>
        <title>{category.name} Varieties - {section.name} - HomeGarden</title>
        <meta name="description" content={`Explore ${category.name} varieties at HomeGarden`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">

          {/* Category Header */}
          <div className="relative rounded-xl overflow-hidden mb-4 sm:mb-6 h-28 sm:h-32 md:h-40 shadow-md">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-800 dark:from-green-700 dark:to-green-900" />
            )}
            <div className="absolute inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center px-3 drop-shadow-lg">
                {category.name} Varieties
              </h1>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="bg-green-100 dark:bg-green-900/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm flex-1 sm:flex-none text-center">
                <span className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-semibold">
                  {varieties.length} {varieties.length === 1 ? 'Variety' : 'Varieties'}
                </span>
              </div>
              {hasPlants && (
                <div className="bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm flex-1 sm:flex-none text-center">
                  <span className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold">
                    {totalPlants} {totalPlants === 1 ? 'Plant' : 'Plants'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Only show if there are varieties */}
          {hasVarieties && (
            <form onSubmit={handleSearch} className="mb-4 sm:mb-5">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder={`Search varieties in ${category.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white text-sm sm:text-base shadow-sm"
                />
                <svg
                  className="absolute left-3 sm:left-4 top-3.5 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500"
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
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
                {filteredVarieties.length} {filteredVarieties.length === 1 ? 'variety' : 'varieties'} found
              </p>
            </form>
          )}

          {/* No Varieties Message */}
          {!hasVarieties ? (
            <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No Varieties Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                There are no varieties available in {category.name} yet.
                Please check back later or explore other categories.
              </p>
              <Link
                to={`/categories/${section.slug}`}
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Categories
              </Link>
            </div>
          ) : (
            <>
              {/* Message if no plants available */}
              {!hasPlants && varieties.length > 0 && (
                <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center">
                  <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                    🌱 No plants available in these varieties yet. Please check back later.
                  </p>
                </div>
              )}

              {/* "View All Plants" Button */}
              {hasPlants && (
                <div className="mb-4 sm:mb-5 text-center">
                  <Link
                    to={`/categories/${section.slug}/${category.slug}/all`}
                    className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 text-xs sm:text-sm shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                  >
                    <span>View All {totalPlants} Plants in {category.name}</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Varieties Grid */}
              {filteredVarieties.length === 0 && searchTerm ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    No varieties found matching "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-green-600 dark:text-green-400 text-sm font-medium hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                  {filteredVarieties.map((variety) => {
                    const plantSlug = plantSlugs[variety._id];
                    const plantCount = plantCounts[variety._id] || 0;
                    const hasPlant = !!plantSlug;

                    return (
                      <div key={variety._id} className="group">
                        {hasPlant ? (
                          <Link
                            to={`/categories/${section.slug}/${category.slug}/${plantSlug}`}
                            className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full border border-gray-100 dark:border-gray-700"
                          >
                            <div className="relative aspect-square overflow-hidden">
                              {variety.image ? (
                                <img
                                  src={variety.image}
                                  alt={variety.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800 flex items-center justify-center">
                                  <span className="text-2xl sm:text-3xl text-white opacity-70">🌸</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5">
                                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 line-clamp-1 drop-shadow-md">
                                  {variety.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/90 text-[10px] sm:text-xs font-medium bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                    {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
                                  </span>
                                  <span className="text-white/90 text-[10px] sm:text-xs font-medium flex items-center bg-green-600/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                    View
                                    <svg className="w-2 h-2 sm:w-3 sm:h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm opacity-60 cursor-not-allowed h-full border border-gray-100 dark:border-gray-700">
                            <div className="relative aspect-square overflow-hidden">
                              {variety.image ? (
                                <img
                                  src={variety.image}
                                  alt={variety.name}
                                  className="w-full h-full object-cover grayscale"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800 flex items-center justify-center">
                                  <span className="text-2xl sm:text-3xl text-white opacity-50">🌸</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5">
                                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 line-clamp-1 drop-shadow-md">
                                  {variety.name}
                                </h3>
                                <span className="text-white/70 text-[10px] sm:text-xs font-medium bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-sm inline-block">
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
            </>
          )}

          {/* Back link */}
          <div className="mt-8 sm:mt-10 text-center">
            <Link
              to={`/categories/${section.slug}`}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm sm:text-base font-medium transition-colors group"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {category.name} Categories
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Variety;