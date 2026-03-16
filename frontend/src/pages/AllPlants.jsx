import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AllPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/plants');
      setPlants(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load plants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>All Plants - HomeGarden</title>
        <meta name="description" content="Browse our complete collection of plants at HomeGarden." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Plants</h1>
        
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} retry={fetchPlants} />}
        
        {!loading && !error && (
          <>
            {plants.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-300 py-12">
                No plants available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {plants.map(plant => <PlantCard key={plant._id} plant={plant} />)}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AllPlants;