import express from 'express';
import {
  getSections,
  getSectionById,
  getSectionBySlug,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/sectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSections);
router.get('/slug/:slug', getSectionBySlug);
router.get('/:id', getSectionById);

// Admin routes
router.post('/', protect, createSection);
router.put('/:id', protect, updateSection);
router.delete('/:id', protect, deleteSection);

export default router;