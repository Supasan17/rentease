/**
 * Admin Validation Rules
 *
 * express-validator rule chains for the admin endpoints.
 * Used together with the validate middleware.
 */

const { body, param } = require('express-validator');

/**
 * Rules for PATCH /api/admin/users/:id/status
 */
const userStatusRules = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
  body('isActive')
    .isBoolean({ strict: true }).withMessage('isActive must be true or false')
];

/**
 * Rules for DELETE /api/admin/items/:id
 */
const itemIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid item ID')
];

module.exports = {
  userStatusRules,
  itemIdRules
};
