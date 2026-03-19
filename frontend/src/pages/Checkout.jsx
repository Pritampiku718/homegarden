import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { sendWhatsAppMessage } from '../utils/whatsapp';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    pincode: '',
  });
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentType, setPaymentType] = useState('full');

  const plantsTotal = getCartTotal();
  const deliveryCharge = deliveryInfo?.deliveryCharge || 0;
  const totalAmount = plantsTotal + deliveryCharge;
  const advanceAmount = 100;


  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  // Fetch delivery info AND pincode details when pincode changes
  useEffect(() => {
    if (formData.pincode.length === 6) {
      fetchDeliveryInfo();
      fetchPincodeDetails();
    } else {
      setDeliveryInfo(null);
      setError('');
    }
  }, [formData.pincode, plantsTotal]);

  // Fetch city from pincode using your backend API
  const fetchPincodeDetails = async () => {
    setPincodeLoading(true);
    try {
      console.log('📍 Fetching pincode details for:', formData.pincode);

      // Call your backend API endpoint
      const res = await api.get(`/pincode/${formData.pincode}`);

      console.log('📦 Pincode details response:', res.data);

      // Auto-fill the city field with the district name
      if (res.data.city) {
        setFormData(prev => ({
          ...prev,
          city: res.data.city
        }));
        console.log('✅ City auto-filled:', res.data.city);
      }

    } catch (err) {
      console.error('❌ Pincode lookup error:', err);

      // More detailed error logging
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);

        // If pincode not found, show a helpful message but don't block checkout
        if (err.response.status === 404) {
          console.log('ℹ️ Pincode not found in database. User can enter city manually.');
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error:', err.message);
      }

      // Don't show error to user, just log it
      // City field remains editable for manual entry
    } finally {
      setPincodeLoading(false);
    }
  };

  const fetchDeliveryInfo = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📍 Fetching delivery for pincode:', formData.pincode);
      console.log('💰 Plants total:', plantsTotal);
      console.log('🔗 API URL:', `${api.defaults.baseURL}/delivery/${formData.pincode}?total=${plantsTotal}`);

      const res = await api.get(`/delivery/${formData.pincode}?total=${plantsTotal}`);

      console.log('📦 Delivery API Response:', res.data);

      if (res.data.available === false) {
        console.log('❌ Delivery not available. Message:', res.data.message);

        // Show appropriate message based on the response
        if (res.data.message) {
          setError(res.data.message);
        } else {
          setError(`Delivery is not available for pincode ${formData.pincode}. Please try a different pincode or contact support.`);
        }
        setDeliveryInfo(null);
      } else {
        console.log('✅ Delivery available!');
        console.log('💰 Delivery Charge:', res.data.deliveryCharge);
        console.log('⏱️ Delivery Time:', res.data.deliveryTime);

        // Store delivery info without showing distance to user
        setDeliveryInfo({
          deliveryCharge: res.data.deliveryCharge,
          deliveryTime: res.data.deliveryTime,
          available: true
        });
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      console.error('❌ Delivery calculation error:', err);

      // Handle different error types
      if (err.response?.status === 404) {
        setError('Delivery service is temporarily unavailable. Please try again later.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || 'Invalid pincode. Please enter a valid 6-digit pincode.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your internet connection and try again.');
      } else if (!err.response) {
        setError('Network error. Please check if the server is running.');
      } else {
        setError(err.response?.data?.error || 'Failed to calculate delivery. Please try again.');
      }

      setDeliveryInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }

    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!formData.address.trim()) {
      setError('Please enter your address');
      return false;
    }

    if (!formData.city.trim()) {
      setError('Please enter your city');
      return false;
    }

    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }

    if (!deliveryInfo) {
      setError('Please check delivery availability for your pincode first');
      return false;
    }

    return true;
  };

  const handlePayment = async (type) => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setPaymentType(type);
    const amountToPay = type === 'full' ? totalAmount : advanceAmount;

    try {
      setLoading(true);
      console.log('💰 Creating payment order for amount:', amountToPay);

      // Create Razorpay order
      const { data: order } = await api.post('/payment/create-order', {
        amount: amountToPay,
      });

      console.log('✅ Payment order created:', order);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'HomeGarden',
        description: type === 'full' ? 'Full Payment' : 'Advance Payment',
        order_id: order.orderId,
        handler: async (response) => {
          console.log('💰 Payment response:', response);

          // Prepare order data for backend
          const advancePaid = type === 'full' ? totalAmount : advanceAmount;
          const remainingAmount = type === 'full' ? 0 : totalAmount - advanceAmount;

          const orderData = {
            customerName: formData.name,
            phone: formData.phone,
            address: formData.address,
            landmark: formData.landmark || '',
            city: formData.city,
            pincode: formData.pincode,
            items: cart.map(item => ({
              plantId: item.plantId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            plantsTotal,
            deliveryCharge,
            totalAmount,
            paymentType: type,
            advancePaid,
            remainingAmount,
            distance: deliveryInfo.distance, // Still send distance to backend
            deliveryTime: deliveryInfo.deliveryTime,
          };

          try {
            // Verify payment
            const verifyRes = await api.post('/payment/verify', {
              ...response,
              orderData,
            });

            console.log('✅ Payment verified:', verifyRes.data);

            if (verifyRes.data.success) {
              // Send WhatsApp message - still include distance for admin
              const itemsList = cart
                .map(item => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
                .join('%0A');

              const message = `🌸 *New Order - HomeGarden* 🌸%0A%0A` +
                `*Customer Details:*%0A` +
                `Name: ${formData.name}%0A` +
                `Phone: ${formData.phone}%0A%0A` +
                `*Delivery Address:*%0A` +
                `${formData.address}%0A` +
                `Landmark: ${formData.landmark || '-'}%0A` +
                `${formData.city} - ${formData.pincode}%0A%0A` +
                `*Order Summary:*%0A` +
                `${itemsList}%0A%0A` +
                `*Delivery Details:*%0A` +
                `Delivery Charge: ₹${deliveryCharge}%0A` +
                `Delivery Time: ${deliveryInfo.deliveryTime}%0A%0A` +
                `*Payment Details:*%0A` +
                `Plants Total: ₹${plantsTotal}%0A` +
                `Total Amount: ₹${totalAmount}%0A` +
                `Payment Type: ${type === 'full' ? 'Full Payment' : 'Advance Payment'}%0A` +
                `Advance Paid: ₹${advancePaid}%0A` +
                `Remaining: ₹${remainingAmount} (Pay on Delivery)%0A%0A` +
                `*Order ID:* ${verifyRes.data.order._id}`;

              sendWhatsAppMessage(message);

              clearCart();
              navigate('/order-success', {
                state: {
                  orderId: verifyRes.data.order._id,
                  total: totalAmount
                }
              });
            }
          } catch (verifyError) {
            console.error('❌ Payment verification failed:', verifyError);
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: '#22c55e',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('❌ Payment error:', error);
      setError(error.response?.data?.error || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Don't render anything while checking cart
  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your purchase and bring nature home
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-xl shadow-md">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Delivery Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
              
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number * (10 digits)"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
              
              <input
                type="text"
                name="address"
                placeholder="House/Area *"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
              
              <input
                type="text"
                name="landmark"
                placeholder="Landmark (optional)"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />
                <div className="relative">
                  <input
                    type="text"
                    name="pincode"
                    placeholder="PIN Code *"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-12 transition-all"
                  />
                  {pincodeLoading && (
                    <div className="absolute right-4 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Calculating delivery...</span>
                </div>
              )}

              {deliveryInfo && (
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="font-semibold text-green-800 dark:text-green-300">Delivery Available!</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-green-200 dark:border-green-800">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Charge:</span>
                      <span className="font-bold text-green-700 dark:text-green-400">₹{deliveryInfo.deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Time:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{deliveryInfo.deliveryTime}</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                * Required fields. Enter 6-digit pincode to auto-fill city and check delivery
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Summary
              </h2>
            </div>

            <div className="p-6">
              {/* Cart Items with Images */}
              <div className="max-h-96 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.plantId} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg shadow-md"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Plants Total</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{plantsTotal}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                  <span className={`font-semibold ${deliveryInfo ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {deliveryInfo ? `₹${deliveryCharge}` : '—'}
                  </span>
                </div>

                {/* Free Shipping Progress (if applicable) */}
                {plantsTotal < 500 && plantsTotal > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                      ✨ Add ₹{500 - plantsTotal} more for FREE delivery
                    </p>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((plantsTotal / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                      ₹{totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => handlePayment('full')}
                  disabled={!deliveryInfo || loading}
                  className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay Full Amount (₹{totalAmount})
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                <button
                  onClick={() => handlePayment('advance')}
                  disabled={!deliveryInfo || loading}
                  className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Processing...' : `Pay ₹100 Advance (Remaining ₹${totalAmount - 100})`}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                {!deliveryInfo && formData.pincode.length === 6 && !loading && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-2 bg-amber-50 dark:bg-amber-900/20 py-2 px-4 rounded-lg">
                    ⚠️ Please check delivery availability for pincode {formData.pincode}
                  </p>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
                By proceeding, you agree to our{' '}
                <Link to="/terms" className="text-green-600 dark:text-green-400 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 dark:text-green-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default Checkout;