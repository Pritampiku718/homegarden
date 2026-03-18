import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST with absolute path
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug environment variables
console.log("=".repeat(60));
console.log("🔍 ENVIRONMENT VARIABLES CHECK");
console.log("=".repeat(60));
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("PORT:", process.env.PORT || "5000");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Found" : "❌ Missing");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✅ Found" : "❌ Missing");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Found (hidden)" : "❌ Missing");
console.log("NURSERY_LAT:", process.env.NURSERY_LAT ? "✅ Found" : "❌ Missing");
console.log("NURSERY_LNG:", process.env.NURSERY_LNG ? "✅ Found" : "❌ Missing");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Found" : "❌ Missing");
console.log("=".repeat(60));

// Import routes (after env vars are loaded)
import sectionRoutes from "./routes/sectionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import varietyRoutes from "./routes/varietyRoutes.js"; // Changed from subCategoryRoutes
import plantRoutes from "./routes/plantRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cloudinaryRoutes from "./routes/cloudinaryRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import pincodeRoutes from "./routes/pincodeRoutes.js";

// Initialize express
const app = express();

// CORS Configuration - PRODUCTION READY
const allowedOrigins = [
  "https://homegarden-frontend-phi.vercel.app",
  "https://homegarden-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Comprehensive CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use("/api/sections", sectionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/varieties", varietyRoutes); // Changed from /api/subcategories
app.use("/api/plants", plantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pincode", pincodeRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cors: {
      allowedOrigins,
      currentOrigin: req.headers.origin || "none",
    },
    endpoints: {
      sections: "/api/sections",
      categories: "/api/categories",
      varieties: "/api/varieties", // Changed from subcategories
      plants: "/api/plants",
      users: "/api/users",
      cloudinary: "/api/cloudinary",
      delivery: "/api/delivery/:pincode",
      payment: "/api/payment",
      orders: "/api/orders",
      pincode: "/api/pincode/:pincode",
    },
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "HomeGarden API",
    version: "1.0.0",
    description: "Nursery Website Backend",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      sections: "/api/sections",
      categories: "/api/categories",
      varieties: "/api/varieties", // Changed from subcategories
      plants: "/api/plants",
      users: "/api/users",
      cloudinary: "/api/cloudinary",
      delivery: "/api/delivery/:pincode",
      payment: "/api/payment",
      orders: "/api/orders",
      health: "/health",
      pincode: "/api/pincode/:pincode",
    },
    cors: {
      allowedOrigins,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const response = {
    success: false,
    message: err.message || "Internal server error",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy does not allow access from this origin",
      allowedOrigins,
    });
  }

  res.status(err.status || 500).json(response);
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    console.log(
      "📊 MongoDB URI:",
      process.env.MONGO_URI ? "✅ Found" : "❌ Not found",
    );

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.name === "MongooseServerSelectionError") {
      console.error("\n🔍 Troubleshooting tips:");
      console.error(
        "1. Make sure your Render IPs are whitelisted in MongoDB Atlas:",
      );
      console.error("   - Go to https://cloud.mongodb.com -> Network Access");
      console.error("   - Add these Render outbound IPs:");
      console.error("     • 74.220.48.0/24");
      console.error("     • 74.220.56.0/24");
      console.error("2. Verify your MONGO_URI environment variable is correct");
      console.error("3. Make sure your cluster is running");
    }

    if (process.env.NODE_ENV === "production") {
      console.log("🔄 Retrying connection in 5 seconds...");
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("🔴 Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected");

  if (process.env.NODE_ENV === "production") {
    console.log("🔄 Attempting to reconnect...");
    setTimeout(connectDB, 5000);
  }
});

// Connect to database
connectDB();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`📢 ${signal} received. Closing server gracefully...`);

  try {
    await mongoose.connection.close(false);
    console.log("✅ Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  gracefulShutdown("Uncaught Exception");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  gracefulShutdown("Unhandled Rejection");
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔒 CORS allowed origins:`, allowedOrigins);

  if (process.env.NODE_ENV === "production") {
    console.log("🔒 Production mode: CORS restricted to allowed origins");
    console.log("📌 Allowed origins:");
    allowedOrigins.forEach((origin) => console.log(`   • ${origin}`));
    console.log("📌 Available endpoints:");
    console.log("   • /api/sections");
    console.log("   • /api/categories");
    console.log("   • /api/varieties"); // Changed from subcategories
    console.log("   • /api/plants");
    console.log("   • /api/users");
    console.log("   • /api/cloudinary");
    console.log("   • /api/delivery/:pincode");
    console.log("   • /api/payment");
    console.log("   • /api/orders");
    console.log("   • /health");
  }
});

// Handle server errors
server.on("error", (err) => {
  console.error("❌ Server error:", err);
});

export default app;