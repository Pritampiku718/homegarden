import express from "express";
import {
  getVarieties,
  getVarietiesByCategory,
  getVarietyById,
  getVarietyBySlug,
  createVariety,
  updateVariety,
  deleteVariety,
} from "../controllers/varietyController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getVarieties);
router.get("/category/:categoryId", getVarietiesByCategory);
router.get("/slug/:slug", getVarietyBySlug);
router.get("/:id", getVarietyById);

// Protected routes (require authentication)
router.post("/", protect, createVariety);
router.put("/:id", protect, updateVariety);
router.delete("/:id", protect, deleteVariety);

export default router;