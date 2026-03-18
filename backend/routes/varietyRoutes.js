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

// 🟢 PUBLIC ROUTES - ORDER IS CRITICAL!
// Specific routes FIRST
router.get("/category/:categoryId", getVarietiesByCategory);  // Must come before /:id
router.get("/slug/:slug", getVarietyBySlug);                  // Must come before /:id
router.get("/", getVarieties);                                // Base route

// TEST ROUTES (temporary) - Put these at the top
router.get('/test-ping', (req, res) => {
  console.log('✅ TEST PING ENDPOINT HIT');
  res.json({ success: true, message: 'Pong!', time: new Date().toISOString() });
});

router.post('/test-no-db', (req, res) => {
  console.log('✅ TEST NO-DB ENDPOINT HIT');
  res.json({ success: true, message: 'Test endpoint working!', receivedData: req.body });
});

router.post('/test-with-auth', protect, (req, res) => {
  console.log('✅ TEST WITH AUTH ENDPOINT HIT');
  res.json({ success: true, message: 'Auth test working!', user: req.user?.email });
});

// ⚠️ PARAMETERIZED ROUTES - These go LAST
router.get("/:id", getVarietyById);                           // This catches ANY string as ID - must be last

// 🔴 PROTECTED ROUTES
router.post("/", protect, createVariety);
router.put("/:id", protect, updateVariety);
router.delete("/:id", protect, deleteVariety);

export default router;