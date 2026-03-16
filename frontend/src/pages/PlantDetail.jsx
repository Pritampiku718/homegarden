import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { sendWhatsAppOrder } from '../utils/whatsapp';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PlantDetail = () => {
  const { slug } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlant();
  }, [slug]);

  const fetchPlant = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/plants/slug/${slug}`);
      setPlant(data.data?.plant || data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load plant details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} retry={fetchPlant} />;
  if (!plant) return <ErrorMessage message="Plant not found" />;

  return (
    <>
      <Helmet>
        <title>{plant.name} - HomeGarden</title>
        <meta name="description" content={plant.description?.substring(0, 160)} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <img 
            src={plant.image} 
            alt={plant.name} 
            className="w-full rounded-lg shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold mb-4">{plant.name}</h1>
            <p className="text-2xl text-green-600 dark:text-green-400 font-bold mb-4">
              ₹{plant.price}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {plant.description}
            </p>
            <button
              onClick={() => sendWhatsAppOrder(plant.name)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              Order on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlantDetail;