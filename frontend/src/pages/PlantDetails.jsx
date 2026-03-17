import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { sendWhatsAppOrder } from '../utils/whatsapp';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BackButton from '../components/BackButton';
import Breadcrumbs from '../components/Breadcrumbs';
import PlantCard from '../components/PlantCard';

const PlantDetails = () => {
  const { sectionSlug, categorySlug, plantSlug } = useParams();

  // Debug: log the params
  console.log('PlantDetails params:', { sectionSlug, categorySlug, plantSlug });

  const [plant, setPlant] = useState(null);
  const [section, setSection] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedPlants, setRelatedPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (plantSlug) {
      fetchPlant();
    } else {
      setError('No plant slug provided');
      setLoading(false);
    }
  }, [plantSlug]);

  const fetchPlant = async () => {
    try {
      setLoading(true);
      console.log('Fetching plant with slug:', plantSlug);

      const { data } = await api.get(`/plants/slug/${plantSlug}`);
      console.log('Plant API response:', data);

      const plantData = data.data?.plant || data.data;
      setPlant(plantData);

      if (plantData.section) setSection(plantData.section);
      if (plantData.category) setCategory(plantData.category);
      if (data.data?.relatedPlants) setRelatedPlants(data.data.relatedPlants);

    } catch (err) {
      console.error('Error fetching plant:', err);
      setError(err.response?.data?.message || 'Failed to load plant details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchPlant} />;
  if (!plant) return <ErrorMessage message="Plant not found" />;

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Sections', path: '/categories' },
    ...(section ? [{ name: section.name, path: `/categories/${section.slug}` }] : []),
    ...(category ? [{ name: category.name, path: `/categories/${section?.slug}/${category.slug}` }] : []),
    { name: plant.name }
  ];

  return (
    <>
      <Helmet>
        <title>{plant.name} - HomeGarden</title>
        <meta name="description" content={plant.description?.substring(0, 160)} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath={category ? `/categories/${section?.slug}/${category.slug}` : '/categories'} />
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plant Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <img
              src={plant.image}
              alt={plant.name}
              className="w-full h-full object-cover"
            />
            {!plant.inStock && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                Out of Stock
              </div>
            )}
          </div>

          {/* Plant Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {plant.name}
            </h1>

            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {section && (
                <Link
                  to={`/categories/${section.slug}`}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                >
                  {section.name}
                </Link>
              )}
              {category && (
                <Link
                  to={`/categories/${section?.slug}/${category.slug}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                >
                  {category.name}
                </Link>
              )}
            </div>

            {/* Price */}
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
              ₹{plant.price}
            </p>

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {plant.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => sendWhatsAppOrder(plant.name)}
                disabled={!plant.inStock}
                className={`flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl transition text-lg font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${!plant.inStock && 'opacity-50 cursor-not-allowed'
                  }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z" />
                </svg>
                <span>Order on WhatsApp</span>
              </button>

              <Link
                to={`/categories/${section?.slug}/${category?.slug}`}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-8 py-4 rounded-xl transition text-lg font-semibold text-center"
              >
                Back to {category?.name}
              </Link>
            </div>
          </div>
        </div>

        {/* Related Plants */}
        {relatedPlants.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPlants.map((relatedPlant) => (
                <PlantCard key={relatedPlant._id} plant={relatedPlant} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlantDetails;