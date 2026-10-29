/**
 * Item Routes
 *
 * Defines endpoints for browsing item listings (public) and for creating,
 * updating and deleting them (owners and admins).
 */

const express = require('express');
const router = express.Router();
const {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');
const { getItemReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { uploadItemImages } = require('../middleware/uploadMiddleware');
const {
  listItemsRules,
  itemIdRules,
  createItemRules,
  updateItemRules
} = require('../validators/itemValidators');

// Public routes. GET / supports ?search=&category=&minPrice=&maxPrice=&city=&sort=&page=&limit=
router.get('/', listItemsRules, validate, getItems);

// The logged-in owner's own listings. Must come before '/:id'.
router.get('/mine', protect, authorize('owner', 'admin'), getMyItems);

// Public item details and reviews
router.get('/:id', itemIdRules, validate, getItemById);
router.get('/:id/reviews', itemIdRules, validate, getItemReviews);

// Protected routes (ownership is checked in the controller for update and delete).
// Create and update accept multipart/form-data with up to 5 files in the 'images' field.
router.post('/', protect, authorize('owner', 'admin'), uploadItemImages, createItemRules, validate, createItem);
router.put('/:id', protect, authorize('owner', 'admin'), uploadItemImages, updateItemRules, validate, updateItem);
router.delete('/:id', protect, authorize('owner', 'admin'), itemIdRules, validate, deleteItem);

module.exports = router;
