/**
 * Rental Routes
 *
 * Defines endpoints for booking items and viewing bookings.
 * All routes require a logged-in user.
 */

const express = require('express');
const router = express.Router();
const { createRental, getRentalById } = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { rentalIdRules, createRentalRules } = require('../validators/rentalValidators');

// Renters send booking requests (dates and availability are checked in the controller)
router.post('/', protect, authorize('renter'), createRentalRules, validate, createRental);

// The rental's renter, its owner or an admin may view it (checked in the controller)
router.get('/:id', protect, rentalIdRules, validate, getRentalById);

module.exports = router;
