import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Fetch delivery info when pincode changes
  useEffect(() => {
    if (formData.pincode.length === 6) {
      fetchDeliveryInfo();
    } else {
      setDeliveryInfo(null);
      setError('');
    }
  }, [formData.pincode, plantsTotal]);

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
        console.log('📏 Distance:', res.data.distance, 'km');
        console.log('💰 Delivery Charge:', res.data.deliveryCharge);
        console.log('⏱️ Delivery Time:', res.data.deliveryTime);

        setDeliveryInfo(res.data);
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
            distance: deliveryInfo.distance,
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
              // Send WhatsApp message
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
                `Distance: ${deliveryInfo.distance} km%0A` +
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Delivery Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number * (10 digits)"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              name="address"
              placeholder="House/Area *"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              name="landmark"
              placeholder="Landmark (optional)"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                name="pincode"
                placeholder="PIN Code * (6 digits)"
                value={formData.pincode}
                onChange={handleChange}
                maxLength="6"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Calculating delivery...</span>
              </div>
            )}

            {deliveryInfo && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="font-semibold text-green-700">Delivery Available!</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{deliveryInfo.distance} km</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span className="font-medium">₹{deliveryInfo.deliveryCharge}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Delivery Time:</span>
                    <span className="font-medium">{deliveryInfo.deliveryTime}</span>
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              * Required fields. Enter your 6-digit pincode to check delivery availability.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="max-h-96 overflow-y-auto mb-4">
            {cart.map(item => (
              <div key={item.plantId} className="flex justify-between py-2 border-b">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 text-sm ml-1">x{item.quantity}</span>
                </div>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="flex justify-between">
              <span className="text-gray-600">Plants Total</span>
              <span>₹{plantsTotal}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className={deliveryInfo ? 'text-green-600' : 'text-gray-400'}>
                {deliveryInfo ? `₹${deliveryCharge}` : '—'}
              </span>
            </p>
            <div className="border-t border-dashed pt-2 mt-2">
              <p className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600">₹{totalAmount}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => handlePayment('full')}
              disabled={!deliveryInfo || loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Processing...' : `Pay Full Amount (₹${totalAmount})`}
            </button>

            <button
              onClick={() => handlePayment('advance')}
              disabled={!deliveryInfo || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Processing...' : `Pay ₹100 Advance (Remaining ₹${totalAmount - 100} on Delivery)`}
            </button>

            {!deliveryInfo && formData.pincode.length === 6 && !loading && (
              <p className="text-sm text-red-500 text-center mt-2">
                ⚠️ Please check delivery availability for pincode {formData.pincode}
              </p>
            )}
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;