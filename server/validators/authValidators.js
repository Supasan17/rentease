/**
 * Authentication Validation Rules
 *
 * express-validator rule chains for the register and login endpoints.
 * Used together with the validate middleware.
 */

const { body } = require('express-validator');

// Roles a user may choose at signup. Admins are created via the seed script only.
const SIGNUP_ROLES = ['renter', 'owner'];

/**
 * Rules for POST /api/auth/register
 */
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Please provide a name')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Please provide an email address')
    .isEmail().withMessage('Please provide a valid email address')
    .toLowerCase(),
  body('password')
    .notEmpty().withMessage('Please provide a password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(SIGNUP_ROLES).withMessage(`Role must be one of: ${SIGNUP_ROLES.join(', ')}`)
];

/**
 * Rules for POST /api/auth/login
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Please provide an email address')
    .isEmail().withMessage('Please provide a valid email address')
    .toLowerCase(),
  body('password')
    .notEmpty().withMessage('Please provide a password')
];

module.exports = {
  SIGNUP_ROLES,
  registerRules,
  loginRules
};
