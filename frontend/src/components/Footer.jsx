import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🌿 HomeGarden</h3>
            <p className="text-gray-300 mb-4">
              Bringing nature into your home with the finest plants.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition">Home</Link></li>
              <li><Link to="/categories" className="text-gray-300 hover:text-white transition">Categories</Link></li>
              <li><Link to="/plants" className="text-gray-300 hover:text-white transition">All Plants</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/category/fruits" className="text-gray-300 hover:text-white transition">Fruits</Link></li>
              <li><Link to="/category/flowers" className="text-gray-300 hover:text-white transition">Flowers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📞 +1 234 567 890</li>
              <li>✉️ info@homegarden.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} HomeGarden. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;