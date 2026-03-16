import express from 'express';
import {
  authUser,
  registerUser,
  getProfile,
  updateProfile,
  logoutUser
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authUser);

// Register route - COMMENT OUT AFTER CREATING ADMIN
//router.post('/', registerUser);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logoutUser);

export default router;