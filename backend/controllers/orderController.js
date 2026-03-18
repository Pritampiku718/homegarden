import Order from '../models/Order.js';

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    const requiredFields = ['customerName', 'phone', 'address', 'city', 'pincode', 'items', 'plantsTotal', 'totalAmount', 'paymentType'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return res.status(400).json({
          error: `Missing required field: ${field}`
        });
      }
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(orderData.phone)) {
      return res.status(400).json({
        error: 'Invalid phone number. Must be 10 digits.'
      });
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(orderData.pincode)) {
      return res.status(400).json({
        error: 'Invalid pincode. Must be 6 digits.'
      });
    }

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create order'
    });
  }
};

// GET /api/orders/:id (optional - for order tracking)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Failed to fetch order'
    });
  }
};

// GET /api/orders/phone/:phone (optional - for customer order history)
export const getOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    const orders = await Order.find({ phone })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders'
    });
  }
};