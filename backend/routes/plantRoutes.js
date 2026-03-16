import express from 'express';
import {
  getPlants,
  getPlantById,
  getPlantBySlug,
  getPlantsBySection,
  getPlantsByCategory,
  createPlant,
  updatePlant,
  deletePlant
} from '../controllers/plantController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPlants);
router.get('/section/:sectionId', getPlantsBySection);
router.get('/category/:categoryId', getPlantsByCategory);
router.get('/slug/:slug', getPlantBySlug);
router.get('/:id', getPlantById);

// Admin routes (protected)
router.post('/', protect, createPlant);
router.put('/:id', protect, updatePlant);
router.delete('/:id', protect, deletePlant);

export default router;