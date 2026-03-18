import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  // Default values for safety
  const plantCount = category.plantCount || 0;
  const description = category.description || 'Explore our collection of beautiful plants';
  const imageUrl = category.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400';

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">

      {/* Image Container - Mobile Optimized */}
      <div className="relative h-56 xs:h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
        <img
          src={imageUrl}
          alt={category.name || 'Category'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400';
          }}
        />

        {/* Gradient Overlay - Always visible on mobile, fade on desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent md:opacity-80 md:group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category Badge - Mobile Optimized */}
        <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6">
          <span className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-green-600 dark:text-green-400 font-bold text-xs sm:text-sm rounded-full shadow-lg border border-white/20 dark:border-gray-700">
            {plantCount} {plantCount === 1 ? 'Plant' : 'Plants'}
          </span>
        </div>

        {/* Floating Elements - Hidden on mobile for performance */}
        <div className="hidden md:block absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      </div>

      {/* Content - Always visible on mobile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 lg:p-8 bg-gradient-to-t from-black/95 via-black/80 to-transparent">

        {/* Title */}
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
          {category.name || 'Unnamed Category'}
        </h3>

        {/* Description - Hidden on smallest screens, visible on sm and up */}
        <p className="hidden sm:block text-xs sm:text-sm md:text-base text-gray-200 mb-2 sm:mb-3 md:mb-4 line-clamp-2 drop-shadow">
          {description}
        </p>

        {/* Mobile-friendly stats row */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3 md:hidden">
          <span className="text-xs text-white/80 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
            {plantCount} plants
          </span>
        </div>

        {/* Explore Link - Mobile Optimized */}
        <Link
          to={`/categories/${category.slug}`}
          className="inline-flex items-center text-white font-semibold text-xs sm:text-sm md:text-base group/link"
        >
          <span className="border-b-2 border-white/50 group-hover/link:border-white pb-0.5 sm:pb-1 transition-colors">
            Explore Collection
          </span>
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1 sm:ml-2 transform group-hover/link:translate-x-1 sm:group-hover/link:translate-x-2 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500/50 rounded-2xl sm:rounded-3xl transition-all duration-500 pointer-events-none" />
    </div>
  );
};

export default CategoryCard;