import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrdersByPhone
} from '../controllers/orderController.js';

const router = express.Router();

// POST /api/orders - Create new order
router.post('/', createOrder);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// GET /api/orders/phone/:phone - Get orders by phone number
router.get('/phone/:phone', getOrdersByPhone);

export default router;