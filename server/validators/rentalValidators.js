/**
 * Rental Validation Rules
 *
 * express-validator rule chains for creating rental bookings.
 * Used together with the validate middleware.
 */

const { body } = require('express-validator');

/**
 * Returns today's date at midnight UTC, based on the server's local date,
 * so it can be compared with booking dates sent as 'YYYY-MM-DD'.
 */
const getToday = () => new Date(new Date().toLocaleDateString('en-CA'));

/**
 * Rules for POST /api/rentals
 */
const createRentalRules = [
  body('item')
    .notEmpty().withMessage('Please provide the item to rent')
    .isMongoId().withMessage('Invalid item ID'),
  body('startDate')
    .notEmpty().withMessage('Please provide a start date')
    .isISO8601({ strict: true }).withMessage('Start date must be a valid date (YYYY-MM-DD)')
    .toDate()
    .custom((value) => {
      if (value < getToday()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('endDate')
    .notEmpty().withMessage('Please provide an end date')
    .isISO8601({ strict: true }).withMessage('End date must be a valid date (YYYY-MM-DD)')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.startDate instanceof Date && value < req.body.startDate) {
        throw new Error('End date cannot be before the start date');
      }
      return true;
    }),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
];

module.exports = {
  createRentalRules
};
