import express from 'express';
import { protect } from '../middleware/auth.js';

import {
  uploadImage,
  deleteImage,
  getUploadSignature
} from '../controllers/cloudinaryController.js';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Cloudinary routes are working!'
  });
});

router.post('/upload', protect, uploadImage);

router.post('/delete', protect, deleteImage);

router.get('/signature', protect, getUploadSignature);

export default router;
