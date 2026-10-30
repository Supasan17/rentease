/**
 * RentEase Backend Server Entry Point
 * 
 * Sets up Express application, middleware, static uploads serving,
 * database connection, and API health check routes.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import database connection configuration
const connectDB = require('./config/db');

// Import centralized error handling middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize MongoDB connection
connectDB();

// Create Express application instance
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for client-server communication
app.use(cors());

// Parse incoming JSON payloads in request bodies
app.use(express.json());

// Parse URL-encoded data from HTML forms
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (item images) from the /uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Root Route: Quick welcome message to verify the server is reachable.
 */
app.get('/', (req, res) => {
  res.json({
    name: 'RentEase API',
    description: 'Household Item Rental Marketplace Backend',
    version: '1.0.0'
  });
});

/**
 * Health Check Endpoint: Used to monitor API and server status.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'RentEase API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Routes
 */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Centralized error handling: Catch 404 for undefined routes
app.use(notFound);

// Centralized error handling: Global custom error handler
app.use(errorHandler);

// Define server port from environment variables, defaulting to 5000
const PORT = process.env.PORT || 5000;

// Start listening for incoming requests
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
