import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { sendWhatsAppOrder } from '../utils/whatsapp';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PlantDetails = () => {
  const { sectionSlug, categorySlug, plantSlug } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (plantSlug) {
      fetchPlant();
    }
  }, [plantSlug]);

  const fetchPlant = async () => {
    try {
      setLoading(true);
      console.log('Fetching plant with slug:', plantSlug);

      const { data } = await api.get(`/plants/slug/${plantSlug}`);
      console.log('Plant data:', data);

      // Handle different response structures
      const plantData = data.data?.plant || data.data || data;
      setPlant(plantData);

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

  // Safely access nested properties
  const section = plant.section || {};
  const category = plant.category || {};

  return (
    <>
      <Helmet>
        <title>{plant.name || 'Plant Details'} - HomeGarden</title>
        <meta name="description" content={plant.description?.substring(0, 160) || 'Plant details'} />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plant Image */}
          <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800 aspect-square max-h-[400px]">
            {plant.image ? (
              <img
                src={plant.image}
                alt={plant.name || 'Plant'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                <span className="text-6xl text-white opacity-50">🌿</span>
              </div>
            )}
            {plant.inStock === false && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Out of Stock
              </div>
            )}
          </div>

          {/* Plant Details */}
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {plant.name || 'Unnamed Plant'}
            </h1>

            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {section?.name && (
                <Link
                  to={`/categories/${section.slug}`}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                >
                  {section.name}
                </Link>
              )}
              {category?.name && (
                <Link
                  to={`/categories/${section?.slug}/${category.slug}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                >
                  {category.name}
                </Link>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{plant.price || 0}
              </span>
            </div>

            {/* Description */}
            {plant.description && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {plant.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => sendWhatsAppOrder(plant.name || 'Plant')}
                disabled={plant.inStock === false}
                className={`flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${plant.inStock === false && 'opacity-50 cursor-not-allowed'
                  }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z" />
                </svg>
                <span>Order on WhatsApp</span>
              </button>

              <Link
                to={category?.slug ? `/categories/${section?.slug}/${category.slug}` : '/categories'}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg transition text-sm font-semibold text-center"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlantDetails;