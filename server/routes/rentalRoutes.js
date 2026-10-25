/**
 * Rental Routes
 *
 * Defines endpoints for booking items, listing bookings and moving them
 * through the approve / reject / return / cancel workflow.
 * All routes require a logged-in user.
 */

const express = require('express');
const router = express.Router();
const {
  createRental,
  getRentalById,
  getMyRentals,
  getRentalRequests,
  approveRental,
  rejectRental,
  returnRental,
  cancelRental
} = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  rentalIdRules,
  listRentalsRules,
  createRentalRules
} = require('../validators/rentalValidators');

// Renters send booking requests (dates and availability are checked in the controller)
router.post('/', protect, authorize('renter'), createRentalRules, validate, createRental);

// Lists for the logged-in renter and owner. Must come before '/:id'. Both support ?status=
router.get('/my', protect, authorize('renter'), listRentalsRules, validate, getMyRentals);
router.get('/requests', protect, authorize('owner'), listRentalsRules, validate, getRentalRequests);

// The rental's renter, its owner or an admin may view it (checked in the controller)
router.get('/:id', protect, rentalIdRules, validate, getRentalById);

// Status actions (the right party and the current status are checked in the controller)
router.patch('/:id/approve', protect, rentalIdRules, validate, approveRental);
router.patch('/:id/reject', protect, rentalIdRules, validate, rejectRental);
router.patch('/:id/return', protect, rentalIdRules, validate, returnRental);
router.patch('/:id/cancel', protect, rentalIdRules, validate, cancelRental);

module.exports = router;
