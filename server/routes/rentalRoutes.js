/**
 * Rental Routes
 *
 * Defines endpoints for booking items. All routes require a logged-in user.
 */

const express = require('express');
const router = express.Router();
const { createRental } = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createRentalRules } = require('../validators/rentalValidators');

// Renters send booking requests (dates and availability are checked in the controller)
router.post('/', protect, authorize('renter'), createRentalRules, validate, createRental);

module.exports = router;
