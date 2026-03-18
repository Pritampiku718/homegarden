import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryCounts, setCategoryCounts] = useState({});
  const [plantCounts, setPlantCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const filtered = sections.filter(section =>
        section.name.toLowerCase().includes(term) ||
        (section.description && section.description.toLowerCase().includes(term))
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections(sections);
    }
  }, [searchTerm, sections]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const sectionsRes = await api.get('/sections');
      const sectionsData = sectionsRes.data.data || [];
      setSections(sectionsData);

      const counts = {};
      const plantCountsObj = {};

      await Promise.all(
        sectionsData.map(async (section) => {
          try {
            const categoriesRes = await api.get(`/categories/section/${section._id}`);
            counts[section._id] = categoriesRes.data.data?.length || 0;

            const plantsRes = await api.get(`/plants?section=${section._id}&limit=1`);
            plantCountsObj[section._id] = plantsRes.data.total || 0;
          } catch (err) {
            console.error(`Error fetching counts for ${section.name}:`, err);
            counts[section._id] = 0;
            plantCountsObj[section._id] = 0;
          }
        })
      );

      setCategoryCounts(counts);
      setPlantCounts(plantCountsObj);

    } catch (err) {
      setError('Failed to load sections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && filteredSections.length === 1) {
      navigate(`/categories/${filteredSections[0].slug}`);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;

  return (
    <>
      <Helmet>
        <title>All Sections - HomeGarden</title>
        <meta name="description" content="Browse all plant sections at HomeGarden" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">

          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              All Sections
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select a section to explore our collection
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8 sm:mb-10 lg:mb-12">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 sm:pl-14 pr-12 py-4 sm:py-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white text-base sm:text-lg shadow-lg"
              />
              <svg
                className="absolute left-4 sm:left-5 top-4 sm:top-5 w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500"
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
                  className="absolute right-4 sm:right-5 top-4 sm:top-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3 text-center font-medium">
              {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'} found
            </p>
          </form>

          {/* Sections Grid */}
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl">
                No sections match your search "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-green-600 dark:text-green-400 text-base font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredSections.map((section) => (
                <Link
                  key={section._id}
                  to={`/categories/${section.slug}`}
                  className="group relative block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                >
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    {/* Image */}
                    {section.image ? (
                      <img
                        src={section.image}
                        alt={section.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 flex items-center justify-center">
                        <span className="text-5xl sm:text-6xl text-white opacity-50">🌿</span>
                      </div>
                    )}

                    {/* Gradient Overlay - Ensures text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg">
                        {section.name}
                      </h2>

                      {/* Stats with backdrop blur */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium border border-white/10">
                          {categoryCounts[section._id] || 0} Categories
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="inline-flex items-center px-2.5 py-1 bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium border border-white/10">
                          {plantCounts[section._id] || 0} Plants
                        </span>
                      </div>

                      {/* View Button */}
                      <div className="flex items-center text-white text-sm sm:text-base font-medium group-hover:translate-x-2 transition-transform">
                        <span className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl shadow-lg inline-flex items-center">
                          View Categories
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
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

export default Sections;