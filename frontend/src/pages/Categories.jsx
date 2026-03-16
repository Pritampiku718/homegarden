import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Categories = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sections');
      console.log('Sections data:', data);
      setSections(data.data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  
  if (error) return (
    <div className="container mx-auto px-4 py-16">
      <ErrorMessage message={error} retry={fetchSections} />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>All Categories - HomeGarden</title>
        <meta name="description" content="Browse all plant categories at HomeGarden - Fruits, Flowers, Indoor Plants, Outdoor Plants and more." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 dark:from-green-800 dark:to-green-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Categories</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Explore our wide range of plant categories, each carefully curated for your home and garden
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-16">
        {sections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No categories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sections.map((section) => (
              <Link
                key={section._id}
                to={`/category/${section.slug}`}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image Container */}
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
                  
                  {/* Category Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {section.name}
                    </h2>
                    <div className="flex items-center text-white/80 text-sm">
                      <span>Explore Collection →</span>
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

export default Categories;