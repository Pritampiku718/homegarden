import express from "express";
const router = express.Router();

// Lazy load controllers to ensure env vars are loaded
router.post("/create-order", async (req, res) => {
  try {
    const { createOrder } = await import("../controllers/paymentController.js");
    return createOrder(req, res);
  } catch (error) {
    console.error("Failed to load payment controller:", error);
    res.status(500).json({ error: "Payment service unavailable" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { verifyPayment } =
      await import("../controllers/paymentController.js");
    return verifyPayment(req, res);
  } catch (error) {
    console.error("Failed to load payment controller:", error);
    res.status(500).json({ error: "Payment service unavailable" });
  }
});

export default router;
