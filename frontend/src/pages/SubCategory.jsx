import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BackButton from '../components/BackButton';
import Breadcrumbs from '../components/Breadcrumbs';

const SubCategory = () => {
  const { sectionSlug, categorySlug } = useParams();
  const [section, setSection] = useState(null);
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [plantCounts, setPlantCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [sectionSlug, categorySlug]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const filtered = subCategories.filter(sub =>
        sub.name.toLowerCase().includes(term) ||
        (sub.description && sub.description.toLowerCase().includes(term))
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(subCategories);
    }
  }, [searchTerm, subCategories]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const sectionRes = await api.get(`/sections/slug/${sectionSlug}`);
      const sectionData = sectionRes.data.data?.section || sectionRes.data;
      setSection(sectionData);

      const categoryRes = await api.get(`/categories/slug/${categorySlug}`);
      const categoryData = categoryRes.data.data?.category || categoryRes.data;
      setCategory(categoryData);

      const subRes = await api.get(`/subcategories/category/${categoryData._id}`);
      const subData = subRes.data.data || [];
      setSubCategories(subData);

      const counts = {};

      await Promise.all(
        subData.map(async (sub) => {
          try {
            const plantsRes = await api.get(`/plants?subCategory=${sub._id}&limit=1`);
            counts[sub._id] = plantsRes.data.total || 0;
          } catch (err) {
            console.error(`Error fetching plant count for ${sub.name}:`, err);
            counts[sub._id] = 0;
          }
        })
      );

      setPlantCounts(counts);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && filteredSubCategories.length === 1) {
      navigate(`/categories/${section.slug}/${category.slug}/${filteredSubCategories[0].slug}`);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;
  if (!category || !section) return <ErrorMessage message="Category not found" />;

  const totalPlants = Object.values(plantCounts).reduce((sum, count) => sum + count, 0);

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Sections', path: '/categories' },
    { name: section.name, path: `/categories/${section.slug}` },
    { name: category.name }
  ];

  return (
    <>
      <Helmet>
        <title>{category.name} - {section.name} - HomeGarden</title>
        <meta name="description" content={`Explore ${category.name} varieties at HomeGarden`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath={`/categories/${section.slug}`} />
        <Breadcrumbs items={breadcrumbItems} />

        {/* Category Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-40 md:h-56">
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
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              {category.name}
            </h1>
          </div>
        </div>

        {/* Category Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
              <span className="text-green-700 dark:text-green-400 font-semibold">
                {subCategories.length} Varieties
              </span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
              <span className="text-blue-700 dark:text-blue-400 font-semibold">
                {totalPlants} Plants
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={`Search varieties in ${category.name}...`}
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
            {filteredSubCategories.length} {filteredSubCategories.length === 1 ? 'variety' : 'varieties'} found
          </p>
        </form>

        {/* "View All Plants" Option */}
        {filteredSubCategories.length > 0 && (
          <div className="mb-6">
            <Link
              to={`/categories/${section.slug}/${category.slug}/all`}
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 group"
            >
              <span>View All Plants in {category.name}</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}

        {filteredSubCategories.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            No varieties found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubCategories.map((subCat) => (
              <Link
                key={subCat._id}
                to={`/categories/${section.slug}/${category.slug}/${subCat.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  {subCat.image ? (
                    <img
                      src={subCat.image}
                      alt={subCat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <span className="text-5xl text-white opacity-50">🔖</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {subCat.name}
                    </h3>
                    <div className="flex items-center text-white/80 text-xs mb-2">
                      <span>{plantCounts[subCat._id] || 0} plants</span>
                    </div>
                    <div className="flex items-center text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform">
                      <span>View Plants</span>
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

export default SubCategory;