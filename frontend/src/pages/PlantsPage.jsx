import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BackButton from '../components/BackButton';
import Breadcrumbs from '../components/Breadcrumbs';

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

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;
  if (!category || !section) return <ErrorMessage message="Category not found" />;

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Sections', path: '/categories' },
    { name: section.name, path: `/categories/${section.slug}` },
    { name: category.name, path: `/categories/${section.slug}/${category.slug}` },
    { name: 'All Plants' }
  ];

  return (
    <>
      <Helmet>
        <title>All {category.name} Plants - HomeGarden</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <BackButton fallbackPath={`/categories/${section.slug}/${category.slug}`} />
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          All {category.name} Plants
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {plants.length} plants found
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mb-6">
          <input
            type="text"
            placeholder="Search plants..."
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {filteredPlants.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            No plants found.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlants.map((plant) => (
              <PlantCard key={plant._id} plant={plant} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PlantsPage;