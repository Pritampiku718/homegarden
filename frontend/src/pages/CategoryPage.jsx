import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CategoryPage = () => {
  const { sectionSlug } = useParams();
  const [section, setSection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [varietyCounts, setVarietyCounts] = useState({});
  const [plantCounts, setPlantCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [sectionSlug]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        (cat.description && cat.description.toLowerCase().includes(term))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const sectionRes = await api.get(`/sections/slug/${sectionSlug}`);
      const sectionData = sectionRes.data.data?.section || sectionRes.data;
      setSection(sectionData);

      const categoriesRes = await api.get(`/categories/section/${sectionData._id}`);
      const categoriesData = categoriesRes.data.data || [];
      setCategories(categoriesData);

      const varietyCountsObj = {};
      const plantCountsObj = {};

      await Promise.all(
        categoriesData.map(async (cat) => {
          try {
            const varietyRes = await api.get(`/varieties/category/${cat._id}`);
            varietyCountsObj[cat._id] = varietyRes.data.data?.length || 0;

            const plantsRes = await api.get(`/plants?category=${cat._id}&limit=1`);
            plantCountsObj[cat._id] = plantsRes.data.total || 0;
          } catch (err) {
            console.error(`Error fetching counts for ${cat.name}:`, err);
            varietyCountsObj[cat._id] = 0;
            plantCountsObj[cat._id] = 0;
          }
        })
      );

      setVarietyCounts(varietyCountsObj);
      setPlantCounts(plantCountsObj);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && filteredCategories.length === 1) {
      navigate(`/categories/${section.slug}/${filteredCategories[0].slug}`);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;
  if (!section) return <ErrorMessage message="Section not found" />;

  return (
    <>
      <Helmet>
        <title>{section.name} - HomeGarden</title>
        <meta name="description" content={`Explore ${section.name} categories at HomeGarden`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">

          {/* Section Header - Mobile Optimized with better overlay */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 md:mb-8 h-32 sm:h-40 md:h-48 lg:h-64 shadow-lg">
            {section.image ? (
              <img
                src={section.image}
                alt={section.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-800 dark:from-green-700 dark:to-green-900" />
            )}
            <div className="absolute inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4 drop-shadow-lg">
                {section.name}
              </h1>
            </div>
          </div>

          {/* Stats Row - Mobile Optimized */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="bg-green-100 dark:bg-green-900/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm flex-1 sm:flex-none text-center">
                <span className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-semibold">
                  {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
                </span>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm flex-1 sm:flex-none text-center">
                <span className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold">
                  {Object.values(plantCounts).reduce((a, b) => a + b, 0)} Plants
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder={`Search categories in ${section.name}...`}
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
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
            </p>
          </form>

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                No categories found matching "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredCategories.map((category) => (
                <Link
                  key={category._id}
                  to={`/categories/${section.slug}/${category.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                >
                  <div className="relative h-40 xs:h-44 sm:h-48 md:h-56 overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 flex items-center justify-center">
                        <span className="text-4xl sm:text-5xl text-white opacity-50">📂</span>
                      </div>
                    )}

                    {/* Gradient Overlay - Improved for text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Content - Optimized for all screen sizes */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 drop-shadow-md line-clamp-1">
                        {category.name}
                      </h3>

                      {/* Stats with better contrast */}
                      <div className="flex items-center flex-wrap gap-2 text-white/90 text-xs sm:text-sm mb-1 sm:mb-2">
                        <span className="bg-black/40 dark:bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                          {varietyCounts[category._id] || 0} varieties
                        </span>
                        <span className="text-white/60 hidden xs:inline">•</span>
                        <span className="bg-black/40 dark:bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                          {plantCounts[category._id] || 0} plants
                        </span>
                      </div>

                      {/* Call to action */}
                      <div className="flex items-center text-white text-xs sm:text-sm font-medium group-hover:translate-x-2 transition-transform">
                        <span className="bg-green-600/80 dark:bg-green-500/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                          View Varieties
                        </span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;