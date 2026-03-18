import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  name: String,
  price: Number,
  quantity: Number,
  image: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Customer details
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  landmark: { type: String, default: '' },
  city: { type: String, required: true },
  pincode: { type: String, required: true },

  // Order items
  items: [orderItemSchema],

  // Price breakdown
  plantsTotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Payment details
  paymentType: { type: String, enum: ['advance', 'full'], required: true },
  advancePaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },

  // Delivery info
  distance: { type: Number },
  deliveryTime: { type: String },

  // Payment status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'shipped', 'delivered'],
    default: 'placed'
  },

  // Razorpay details
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String }

}, { timestamps: true });

// Index for faster queries
orderSchema.index({ phone: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);