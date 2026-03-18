import express from "express";
import { getDeliveryInfo } from "../controllers/deliveryController.js";

console.log("🚚 Loading delivery routes module...");

const router = express.Router();

// Log when routes are being set up
console.log("🚚 Setting up delivery routes...");

// GET /api/delivery/:pincode?total=xxx
router.get(
  "/:pincode",
  (req, res, next) => {
    console.log("🚚 Delivery route hit for pincode:", req.params.pincode);
    next();
  },
  getDeliveryInfo,
);

// Add a test route
router.get("/test", (req, res) => {
  console.log("🚚 Test route hit!");
  res.json({
    success: true,
    message: "Delivery routes are working!",
    timestamp: new Date().toISOString(),
  });
});

console.log("✅ Delivery routes set up successfully");

export default router;
