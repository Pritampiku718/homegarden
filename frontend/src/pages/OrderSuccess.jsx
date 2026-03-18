import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [countdown, setCountdown] = useState(10);

  // Get order details from location state or localStorage
  useEffect(() => {
    // Try to get order from navigation state
    const stateOrder = window.history.state?.usr?.order;

    // Or from localStorage (as backup)
    const storedOrder = localStorage.getItem('lastOrder');

    if (stateOrder) {
      setOrderDetails(stateOrder);
      // Clear from localStorage if exists
      localStorage.removeItem('lastOrder');
    } else if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    } else {
      // No order found, redirect to home after 3 seconds
      setTimeout(() => navigate('/'), 3000);
    }
  }, [navigate]);

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  if (!orderDetails) {
    return (
      <>
        <Helmet>
          <title>Order Success - HomeGarden</title>
        </Helmet>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </>
    );
  }

  const {
    _id,
    customerName,
    totalAmount,
    plantsTotal,
    deliveryCharge,
    paymentType,
    advancePaid,
    remainingAmount,
    items = [],
    createdAt
  } = orderDetails;

  const orderDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <Helmet>
        <title>Order Successful - HomeGarden</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for shopping with HomeGarden
          </p>
        </div>

        {/* Order Confirmation Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Order ID Banner */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <p className="text-white/80 text-sm">Order ID</p>
            <p className="text-white font-mono text-lg font-semibold">{_id}</p>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Customer Details</h3>
              <p className="text-gray-900 dark:text-white font-semibold">{customerName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Order placed on {orderDate}</p>
            </div>

            {/* Items List */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Order Summary</h3>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Plants Total</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{plantsTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Delivery Charge</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-green-600 dark:text-green-400">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Payment Type</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {paymentType === 'full' ? 'Full Payment' : 'Advance Payment'}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Advance Paid</p>
                <p className="font-semibold text-gray-900 dark:text-white">₹{advancePaid}</p>
              </div>
            </div>

            {remainingAmount > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <span className="font-semibold">Remaining Amount: ₹{remainingAmount}</span>
                  <br />
                  Please pay this amount at the time of delivery.
                </p>
              </div>
            )}

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z" />
                </svg>
                <span>Contact us on WhatsApp</span>
              </span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center"
          >
            Continue Shopping
          </Link>
          <Link
            to="/plants"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
          >
            Browse More Plants
          </Link>
        </div>

        {/* Auto-redirect Message */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Redirecting to home in {countdown} seconds...
        </p>
      </div>
    </>
  );
};

export default OrderSuccess;