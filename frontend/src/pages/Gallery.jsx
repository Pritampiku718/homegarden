import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';

const Gallery = () => {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const { data } = await api.get('/plants?limit=12');
      setPlants(data.data || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Gallery - HomeGarden</title>
        <meta name="description" content="View our beautiful plant collection at HomeGarden." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gallery</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plants.map(plant => (
            <div key={plant._id} className="aspect-square overflow-hidden rounded-lg">
              <img 
                src={plant.image} 
                alt={plant.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Gallery;