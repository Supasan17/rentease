/**
 * Review Routes
 *
 * Defines the endpoint for reviewing a returned rental.
 * An item's reviews are listed at GET /api/items/:id/reviews (see itemRoutes.js).
 */

const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createReviewRules } = require('../validators/reviewValidators');

// Renters review returned rentals (rental ownership and status are checked in the controller)
router.post('/', protect, authorize('renter'), createReviewRules, validate, createReview);

module.exports = router;
