import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
      {/* Image Container */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Category Badge */}
        <div className="absolute top-6 left-6">
          <span className="px-6 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-green-600 dark:text-green-400 font-bold text-sm rounded-full shadow-lg">
            {category.plantCount || 12}+ Plants
          </span>
        </div>

        {/* Floating Elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <h3 className="text-3xl font-bold text-white mb-2">
          {category.name}
        </h3>
        <p className="text-gray-200 mb-4 line-clamp-2">
          {category.description}
        </p>
        <Link
          to={`/category/${category.slug}`}
          className="inline-flex items-center text-white font-semibold group/link"
        >
          <span className="border-b-2 border-white/50 group-hover/link:border-white pb-1 transition-colors">
            Explore Collection
          </span>
          <svg 
            className="w-5 h-5 ml-2 transform group-hover/link:translate-x-2 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500/50 rounded-3xl transition-all duration-500 pointer-events-none" />
    </div>
  );
};

export default CategoryCard;