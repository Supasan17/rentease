/**
 * Item Validation Rules
 *
 * express-validator rule chains for creating, updating and looking up items.
 * Used together with the validate middleware.
 */

const { body, param, query } = require('express-validator');
const { ITEM_CATEGORIES, ITEM_CONDITIONS } = require('../models/Item');

const SORT_VALUES = ['newest', 'oldest', 'price_asc', 'price_desc', 'rating'];

/**
 * Rules for GET /api/items (search, filters, sorting and pagination)
 */
const listItemsRules = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search text cannot exceed 100 characters'),
  query('category')
    .optional({ values: 'falsy' })
    .isIn(ITEM_CATEGORIES).withMessage(`Category must be one of: ${ITEM_CATEGORIES.join(', ')}`),
  query('minPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('minPrice must be a non-negative number')
    .toFloat(),
  query('maxPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('maxPrice must be a non-negative number')
    .toFloat()
    .custom((value, { req }) => {
      const minPrice = parseFloat(req.query.minPrice);
      if (!Number.isNaN(minPrice) && value < minPrice) {
        throw new Error('maxPrice cannot be less than minPrice');
      }
      return true;
    }),
  query('city')
    .optional()
    .trim(),
  query('sort')
    .optional({ values: 'falsy' })
    .isIn(SORT_VALUES).withMessage(`Sort must be one of: ${SORT_VALUES.join(', ')}`),
  query('page')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 }).withMessage('Page must be a positive whole number')
    .toInt(),
  query('limit')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be a whole number between 1 and 50')
    .toInt()
];

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
  listItemsRules,
  itemIdRules,
  createItemRules,
  updateItemRules
};
