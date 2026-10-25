/**
 * Review Validation Rules
 *
 * express-validator rule chains for creating reviews.
 * Used together with the validate middleware.
 */

const { body } = require('express-validator');

/**
 * Rules for POST /api/reviews
 */
const createReviewRules = [
  body('rental')
    .notEmpty().withMessage('Please provide the rental to review')
    .isMongoId().withMessage('Invalid rental ID'),
  body('rating')
    .notEmpty().withMessage('Please provide a rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be a whole number from 1 to 5')
    .toInt(),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
];

module.exports = {
  createReviewRules
};
