import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - HomeGarden</title>
      </Helmet>

      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-block"
        >
          Go Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;