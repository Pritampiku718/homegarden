import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - HomeGarden</title>
        <meta name="description" content="Get in touch with HomeGarden for any queries about our premium plants." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-green-100">
                Have questions about our plants? Want to place a bulk order?
                We'd love to hear from you!
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">

            {/* Contact Information - Left Column */}
            <div className="space-y-8">
              {/* Quick Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Card */}
                <a
                  href="tel:+918597511728"
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 group"
                >
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">📞</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Call Us</h3>
                  <p className="text-green-600 dark:text-green-400 font-medium">+91 8597511728</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">24/7 Available</p>
                </a>

                {/* Email Card */}
                <a
                  href="mailto:Bikramb2026@gmail.com"
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 group"
                >
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">✉️</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Us</h3>
                  <p className="text-green-600 dark:text-green-400 font-medium break-all">Bikramb2026@gmail.com</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Quick Response</p>
                </a>
              </div>

              {/* Address Card - Premium */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-8 -mt-8"></div>
                <div className="relative">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📍</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Our Nursery</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Nahata Bokchara Road,<br />
                        Near Biswas Para More,<br />
                        Pincode: 743290<br />
                        Dist: North 24 Parganas,<br />
                        West Bengal, India
                      </p>

                      {/* Google Maps Link */}
                      <a
                        href="https://maps.app.goo.gl/nDYcFMPxgpPmhYwQ6?g_st=aw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-4 text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors group"
                      >
                        <span>View on Google Maps</span>
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Monday - Saturday</span>
                    <span className="font-semibold text-gray-900 dark:text-white">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Sunday</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">10:00 AM - 2:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Right Column */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your query..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Trust Badge */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                We'll get back to you within 24 hours
              </p>
            </div>
          </div>

          {/* Map Section - Optional but nice */}
          <div className="mt-12">
            <a
              href="https://maps.app.goo.gl/nDYcFMPxgpPmhYwQ6?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative rounded-2xl overflow-hidden h-48 md:h-64 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/80 group-hover:opacity-90 transition-opacity z-10 flex items-center justify-center">
                <div className="text-center text-white">
                  <span className="text-4xl block mb-2">🗺️</span>
                  <span className="text-lg font-semibold">Click to view on Google Maps</span>
                  <p className="text-sm text-green-100">XPQ5+C54 Ichhlampur, West Bengal</p>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cdc5?w=800&auto=format"
                alt="Map location"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;