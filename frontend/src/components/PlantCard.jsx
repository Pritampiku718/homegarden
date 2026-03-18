import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const PlantCard = ({ plant }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const inStock = plant.inStock !== false;

  // Premium fallback images
  const fallbackImages = [
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&auto=format',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&auto=format',
    'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=400&auto=format'
  ];

  const sectionSlug = plant.section?.slug || '';
  const categorySlug = plant.category?.slug || '';
  const plantSlug = plant.slug || '';

  const plantDetailUrl = sectionSlug && categorySlug && plantSlug
    ? `/categories/${sectionSlug}/${categorySlug}/${plantSlug}`
    : `/plants/${plantSlug}`;

  const formattedPrice = new Intl.NumberFormat('en-IN').format(plant.price || 0);

  useEffect(() => {
    getImageUrl();
  }, [plant]);

  const getImageUrl = () => {
    try {
      if (plant.images && Array.isArray(plant.images) && plant.images.length > 0) {
        const firstImage = plant.images[0];
        if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
          setImgSrc(firstImage);
        } else if (firstImage?.url?.startsWith('http')) {
          setImgSrc(firstImage.url);
        } else {
          setImgSrc(fallbackImages[0]);
        }
      } else if (plant.image?.startsWith('http')) {
        setImgSrc(plant.image);
      } else {
        setImgSrc(fallbackImages[0]);
      }
    } catch (error) {
      setImgSrc(fallbackImages[0]);
    }
  };

  const handleImageError = () => {
    const nextIndex = (fallbackIndex + 1) % fallbackImages.length;
    setFallbackIndex(nextIndex);
    setImgSrc(fallbackImages[nextIndex]);
    setImageError(true);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(plant);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(plant);
    navigate('/checkout');
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 h-full flex flex-col">

      {/* Image Container */}
      <Link to={plantDetailUrl} className="block relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex-shrink-0">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={plant.name || 'Plant'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
            <span className="text-5xl text-white opacity-50">🌿</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Stock Status Badge */}
        {!inStock && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg border border-red-400/30">
              Out of Stock
            </span>
          </div>
        )}

        {/* Image Count Badge */}
        {plant.images && plant.images.length > 1 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full shadow-lg flex items-center gap-1 border border-white/20">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{plant.images.length}</span>
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Plant Name - Full name visible */}
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
          {plant.name || 'Unnamed Plant'}
        </h3>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {plant.section && (
            <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs sm:text-sm rounded-full font-medium border border-green-200 dark:border-green-800">
              {plant.section.name}
            </span>
          )}
          {plant.category && (
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs sm:text-sm rounded-full font-medium border border-blue-200 dark:border-blue-800">
              {plant.category.name}
            </span>
          )}
          {plant.variety && (
            <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs sm:text-sm rounded-full font-medium border border-purple-200 dark:border-purple-800">
              {typeof plant.variety === 'object' ? plant.variety.name : plant.variety}
            </span>
          )}
        </div>

        {/* Description - 2 lines max */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-1">
          {plant.description || 'No description available'}
        </p>

        {/* Price */}
        <div className="mb-4">
          <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
            ₹{formattedPrice}
          </span>
        </div>

        {/* Action Buttons - Fixed with proper padding */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* View Button - Premium Purple */}
          <Link
            to={plantDetailUrl}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 px-3 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </Link>

          {/* Cart Button - Premium Green */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`text-sm sm:text-base font-medium py-2.5 sm:py-3 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 ${inStock
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Cart</span>
          </button>

          {/* Buy Button - Premium Orange */}
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className={`text-sm sm:text-base font-medium py-2.5 sm:py-3 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 ${inStock
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;