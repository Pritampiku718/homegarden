import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PlantCard = ({ plant }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
    toast.success(`${plant.name || 'Plant'} added to cart!`, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: 'bold',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
      },
      icon: '🛒',
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(plant);
    navigate('/checkout');
  };

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Image Container - Premium with enhanced overlay */}
      <Link to={plantDetailUrl} className="block relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex-shrink-0">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={plant.name || 'Plant'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
            <span className="text-5xl text-white opacity-50 animate-pulse">🌿</span>
          </div>
        )}

        {/* Premium Gradient Overlay - Enhanced */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Stock Status Badge - Premium */}
        {!inStock && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-xl border border-red-400/30 animate-pulse">
              Out of Stock
            </span>
          </div>
        )}

        {/* Image Count Badge - Premium */}
        {plant.images && plant.images.length > 1 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 bg-black/40 backdrop-blur-md text-white text-xs rounded-full shadow-xl flex items-center gap-1 border border-white/30 hover:bg-black/60 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{plant.images.length}</span>
            </span>
          </div>
        )}

        {/* Premium Badge for Desktop */}
        <div className="absolute top-3 left-3 z-10 opacity-0 md:opacity-100 transition-opacity duration-300">
          <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold rounded-full shadow-lg">
            PREMIUM
          </span>
        </div>
      </Link>

      {/* Content - Premium spacing and typography */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Plant Name - Premium typography */}
        <h3 className="text-sm sm:text-base md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight md:tracking-tight">
          {plant.name || 'Unnamed Plant'}
        </h3>

        {/* Category Tags - Premium pill design */}
        <div className="flex flex-wrap gap-1 mb-2 md:gap-1.5">
          {plant.section && (
            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 text-[10px] sm:text-xs md:text-sm rounded-full font-semibold border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
              {plant.section.name}
            </span>
          )}
          {plant.category && (
            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 text-[10px] sm:text-xs md:text-sm rounded-full font-semibold border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
              {plant.category.name}
            </span>
          )}
          {plant.variety && (
            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-400 text-[10px] sm:text-xs md:text-sm rounded-full font-semibold border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
              {typeof plant.variety === 'object' ? plant.variety.name : plant.variety}
            </span>
          )}
        </div>

        {/* Description - Premium text style */}
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 md:mb-4 line-clamp-2 leading-relaxed md:leading-relaxed">
          {plant.description || 'No description available'}
        </p>

        {/* Price - Premium styling */}
        <div className="mb-3 md:mb-4">
          <span className="text-base sm:text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
            ₹{formattedPrice}
          </span>
        </div>

        {/* Action Buttons - Stacked vertically with premium enhancements */}
        <div className="flex flex-col gap-2 md:gap-3 mt-auto pt-2">
          {/* View Button - Premium Purple with shine effect */}
          <Link
            to={plantDetailUrl}
            className="group/btn relative bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs sm:text-sm md:text-base font-medium py-2.5 sm:py-3 md:py-4 px-3 md:px-4 rounded-lg md:rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-1.5 md:gap-2 shadow-md hover:shadow-xl transform hover:scale-105 md:hover:scale-105 w-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="relative">View Details</span>
          </Link>

          {/* Cart Button - Premium Green with shine effect */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`group/btn relative text-xs sm:text-sm md:text-base font-medium py-2.5 sm:py-3 md:py-4 px-3 md:px-4 rounded-lg md:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 shadow-md hover:shadow-xl transform hover:scale-105 md:hover:scale-105 w-full overflow-hidden ${inStock
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            {inStock && <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>}
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="relative">Add to Cart</span>
          </button>

          {/* Buy Button - Premium Orange with shine effect */}
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className={`group/btn relative text-xs sm:text-sm md:text-base font-medium py-2.5 sm:py-3 md:py-4 px-3 md:px-4 rounded-lg md:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 shadow-md hover:shadow-xl transform hover:scale-105 md:hover:scale-105 w-full overflow-hidden ${inStock
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            {inStock && <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>}
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="relative">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;