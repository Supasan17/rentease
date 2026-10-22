/**
 * Item Validation Rules
 *
 * express-validator rule chains for creating, updating and looking up items.
 * Used together with the validate middleware.
 */

const { body, param } = require('express-validator');
const { ITEM_CATEGORIES, ITEM_CONDITIONS } = require('../models/Item');

/**
 * Rules for routes with an :id parameter
 */
const itemIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid item ID')
];

/**
 * Rules for POST /api/items
 */
const createItemRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Please provide a title')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Please provide a description')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Please provide a category')
    .isIn(ITEM_CATEGORIES).withMessage(`Category must be one of: ${ITEM_CATEGORIES.join(', ')}`),
  body('pricePerDay')
    .notEmpty().withMessage('Please provide a price per day')
    .isFloat({ min: 0 }).withMessage('Price per day must be a non-negative number')
    .toFloat(),
  body('deposit')
    .optional()
    .isFloat({ min: 0 }).withMessage('Deposit must be a non-negative number')
    .toFloat(),
  body('location.city')
    .trim()
    .notEmpty().withMessage('Please provide a city'),
  body('location.address')
    .optional()
    .trim(),
  body('condition')
    .optional()
    .isIn(ITEM_CONDITIONS).withMessage(`Condition must be one of: ${ITEM_CONDITIONS.join(', ')}`),
  body('isAvailable')
    .optional()
    .isBoolean().withMessage('isAvailable must be true or false')
    .toBoolean()
];

/**
 * Rules for PUT /api/items/:id (every field is optional, but must be valid if sent)
 */
const updateItemRules = [
  ...itemIdRules,
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(ITEM_CATEGORIES).withMessage(`Category must be one of: ${ITEM_CATEGORIES.join(', ')}`),
  body('pricePerDay')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price per day must be a non-negative number')
    .toFloat(),
  body('deposit')
    .optional()
    .isFloat({ min: 0 }).withMessage('Deposit must be a non-negative number')
    .toFloat(),
  body('location.city')
    .optional()
    .trim()
    .notEmpty().withMessage('City cannot be empty'),
  body('location.address')
    .optional()
    .trim(),
  body('condition')
    .optional()
    .isIn(ITEM_CONDITIONS).withMessage(`Condition must be one of: ${ITEM_CONDITIONS.join(', ')}`),
  body('isAvailable')
    .optional()
    .isBoolean().withMessage('isAvailable must be true or false')
    .toBoolean()
];

module.exports = {
  itemIdRules,
  createItemRules,
  updateItemRules
};
