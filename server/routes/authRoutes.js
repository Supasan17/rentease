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
const validate = require('../middleware/validateMiddleware');
const { registerRules, loginRules } = require('../validators/authValidators');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
