import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - HomeGarden</title>
        <meta name="description" content="Get in touch with HomeGarden for any queries." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Have questions about our plants? Want to place a bulk order? 
              We'd love to hear from you!
            </p>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="w-8">📍</span> 123 Green Street
              </p>
              <p className="flex items-center">
                <span className="w-8">📞</span> +1 234 567 890
              </p>
              <p className="flex items-center">
                <span className="w-8">✉️</span> info@homegarden.com
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows="5"
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;