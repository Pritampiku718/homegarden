import express from "express";
import {
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  getSubCategoryBySlug,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategoryController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSubCategories);
router.get("/category/:categoryId", getSubCategoriesByCategory);
router.get("/slug/:slug", getSubCategoryBySlug);
router.get("/:id", getSubCategoryById);
router.post("/", protect, createSubCategory);
router.put("/:id", protect, updateSubCategory);
router.delete("/:id", protect, deleteSubCategory);

export default router;
