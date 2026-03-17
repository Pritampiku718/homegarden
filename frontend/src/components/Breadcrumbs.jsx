import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Breadcrumbs = ({ items }) => {
  const location = useLocation();

  // Remove duplicates by converting to Map with path as key
  const uniqueItems = Array.from(
    new Map(items.map(item => [item.path || item.name, item])).values()
  );

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 overflow-x-auto pb-2">
      {uniqueItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
          {index > 0 && <span className="text-gray-400 dark:text-gray-600">/</span>}
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;