/**
 * Authentication Validation Rules
 *
 * express-validator rule chains for the register, login and profile update endpoints.
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

/**
 * Rules for PUT /api/auth/me
 * All fields are optional; a new password needs the current one too.
 */
const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters')
    .bail()
    .matches(/^[0-9+()\-\s]*$/).withMessage('Phone number can only contain digits, spaces and + - ( )'),
  body('address')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  body('currentPassword')
    .if(body('newPassword').exists({ values: 'falsy' }))
    .notEmpty().withMessage('Please provide your current password to set a new one'),
  body('email')
    .not().exists().withMessage('Email cannot be changed'),
  body('role')
    .not().exists().withMessage('Role cannot be changed')
];

module.exports = {
  SIGNUP_ROLES,
  registerRules,
  loginRules,
  updateProfileRules
};
