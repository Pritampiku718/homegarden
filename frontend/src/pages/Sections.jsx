import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BackButton from '../components/BackButton';
import Breadcrumbs from '../components/Breadcrumbs';

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

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Sections' }
  ];

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;

  return (
    <>
      <Helmet>
        <title>All Sections - HomeGarden</title>
        <meta name="description" content="Browse all plant sections at HomeGarden" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath="/" />
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          All Sections
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select a section to explore our collection
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
            />
            <svg
              className="absolute left-4 top-4 w-5 h-5 text-gray-400"
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
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'} found
          </p>
        </form>

        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No sections match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSections.map((section) => (
              <Link
                key={section._id}
                to={`/categories/${section.slug}`}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative h-64 overflow-hidden">
                  {section.image ? (
                    <img
                      src={section.image}
                      alt={section.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-6xl text-white opacity-50">🌿</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {section.name}
                    </h2>
                    <div className="flex items-center space-x-3 text-white/80 text-sm mb-2">
                      <span>{categoryCounts[section._id] || 0} Categories</span>
                      <span>•</span>
                      <span>{plantCounts[section._id] || 0} Plants</span>
                    </div>
                    <div className="flex items-center text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform">
                      <span>View Categories</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </>
  );
};

export default Sections;