import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import sectionRoutes from './routes/sectionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Initialize express
const app = express();

// Get allowed origins from environment variable or use defaults
const getAllowedOrigins = () => {
  // For production, use the frontend URL from environment variable
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL || 'https://your-frontend.vercel.app';
    return [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'];
  }
  // For development, allow all origins
  return '*';
};

// CORS configuration - PRODUCTION READY
const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('CORS policy does not allow access from this origin'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (optional - can be removed in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/sections', sectionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/users', userRoutes);

// Health check route - IMPORTANT for Render to know your app is healthy
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'HomeGarden API',
    version: '1.0.0',
    description: 'Nursery Website Backend',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      sections: '/api/sections',
      categories: '/api/categories',
      plants: '/api/plants',
      users: '/api/users',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Don't expose stack traces in production
  const response = {
    success: false,
    message: err.message || 'Internal server error'
  };
  
  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy does not allow access from this origin'
    });
  }
  
  res.status(err.status || 500).json(response);
});

// MongoDB connection with better error handling for production
const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📊 MongoDB URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not found');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
    });
    
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n🔍 Troubleshooting tips for production:');
      console.error('1. Make sure your Render IPs are whitelisted in MongoDB Atlas:');
      console.error('   - Go to https://cloud.mongodb.com -> Network Access');
      console.error('   - Add these Render outbound IPs (check Render dashboard -> Connect -> Outbound):');
      console.error('   - Also add your own IP for admin access');
      console.error('2. Verify your MONGO_URI environment variable is correct in Render dashboard');
      console.error('3. Make sure your cluster is running and not paused');
      console.error('4. Check if you have the correct username and password in the connection string');
    }
    
    // Don't exit immediately in production, retry connection
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected');
  
  // Attempt to reconnect in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Attempting to reconnect...');
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
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('Uncaught Exception');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  gracefulShutdown('Unhandled Rejection');
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Production mode: CORS restricted to allowed origins');
  }
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

export default app;