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
  const [subCategoryCounts, setSubCategoryCounts] = useState({});
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

      const subCounts = {};
      const plantCountsObj = {};

      await Promise.all(
        categoriesData.map(async (cat) => {
          try {
            const subRes = await api.get(`/subcategories/category/${cat._id}`);
            subCounts[cat._id] = subRes.data.data?.length || 0;

            const plantsRes = await api.get(`/plants?category=${cat._id}&limit=1`);
            plantCountsObj[cat._id] = plantsRes.data.total || 0;
          } catch (err) {
            console.error(`Error fetching counts for ${cat.name}:`, err);
            subCounts[cat._id] = 0;
            plantCountsObj[cat._id] = 0;
          }
        })
      );

      setSubCategoryCounts(subCounts);
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

      <div className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-64">
          {section.image ? (
            <img
              src={section.image}
              alt={section.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-800" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
              {section.name}
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={`Search categories in ${section.name}...`}
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
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
          </p>
        </form>

        {filteredCategories.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            No categories found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category._id}
                to={`/categories/${section.slug}/${category.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-5xl text-white opacity-50">📂</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {category.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-white/80 text-xs mb-2">
                      <span>{subCategoryCounts[category._id] || 0} varieties</span>
                      <span>•</span>
                      <span>{plantCounts[category._id] || 0} plants</span>
                    </div>
                    <div className="flex items-center text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform">
                      <span>View Varieties</span>
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

export default CategoryPage;