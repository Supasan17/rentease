/**
 * Authentication Routes
 * 
 * Defines endpoints for registering, logging in, and retrieving
 * profile data of authenticated users.
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
