import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, getCartTotal } = useCart();
  const total = getCartTotal();
  const FREE_SHIPPING_THRESHOLD = 500;
  const amountNeededForFreeShipping = FREE_SHIPPING_THRESHOLD - total;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4 opacity-30">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Looks like you haven't added any plants to your cart yet.
        </p>
        <Link
          to="/plants"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div
              key={item.plantId}
              className="flex flex-col sm:flex-row items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />

              <div className="flex-1 sm:ml-4 mt-3 sm:mt-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-green-600 dark:text-green-400 font-bold text-xl mt-1">
                      ₹{item.price}
                    </p>
                  </div>

                  <div className="flex items-center mt-3 sm:mt-0">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.plantId, item.quantity - 1)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 bg-white dark:bg-gray-800 font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.plantId, item.quantity + 1)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.plantId)}
                      className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary - Right Column */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{total}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {total >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-green-600 dark:text-green-400">FREE</span>
                  ) : (
                    'Calculated at checkout'
                  )}
                </span>
              </div>

              {/* Free Shipping Progress - NEW */}
              {total < FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                    ✨ Add ₹{amountNeededForFreeShipping} more for FREE delivery
                  </p>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    {Math.round((total / FREE_SHIPPING_THRESHOLD) * 100)}% towards free shipping
                  </p>
                </div>
              )}

              {/* Free Shipping Achieved - NEW */}
              {total >= FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">Congratulations! You get FREE delivery</span>
                  </p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600 dark:text-green-400">₹{total}</span>
              </div>

              {/* Delivery Estimate - NEW */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Delivery charges calculated at checkout based on your location.
              </p>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-lg font-semibold transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping Link */}
            <Link
              to="/plants"
              className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mt-4 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;