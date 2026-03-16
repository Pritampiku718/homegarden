import { Link } from 'react-router-dom';
import { sendWhatsAppOrder } from '../utils/whatsapp';

const PlantCard = ({ plant }) => {
  // Default inStock to true if not specified
  const inStock = plant.inStock !== false;
  
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={plant.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400'}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400';
          }}
        />
        
        {/* Stock Badge */}
        {!inStock && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              OUT OF STOCK
            </span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1.5 bg-green-600 text-white font-bold rounded-full shadow-lg text-sm">
            ₹{plant.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Plant Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {plant.name}
        </h3>
        
        {/* Category Tag */}
        {plant.category && (
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
              {typeof plant.category === 'object' ? plant.category.name : plant.categoryName || 'Plant'}
            </span>
          </div>
        )}

        {/* Description - Hidden on mobile to save space, shown on desktop */}
        <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[40px]">
          {plant.description || 'No description available'}
        </p>

        {/* Actions - Fixed button layout */}
        <div className="flex items-center gap-2 mt-2">
          <Link
            to={`/plants/${plant.slug}`}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          <button
            onClick={() => sendWhatsAppOrder(plant.name)}
            disabled={!inStock}
            className={`w-12 h-11 flex items-center justify-center rounded-lg transition-colors ${
              inStock
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
            title={inStock ? "Order on WhatsApp" : "Out of stock"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.447-1.273.607-1.446c.147-.16.331-.218.532-.218.121 0 .242.011.348.021.121.011.284-.047.446.344.163.391.55 1.347.6 1.444.049.098.081.211.016.338-.065.127-.114.186-.22.301-.105.116-.221.259-.317.348-.106.093-.216.194-.093.38.122.187.546.9 1.169 1.456.806.72 1.485.944 1.696 1.049.211.105.334.087.457-.054.122-.14.526-.615.667-.826.14-.212.28-.177.47-.106.189.07 1.203.567 1.41.67.206.104.343.155.393.242.049.087.049.5-.096.905z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;