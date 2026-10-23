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
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { uploadItemImages } = require('../middleware/uploadMiddleware');
const {
  itemIdRules,
  createItemRules,
  updateItemRules
} = require('../validators/itemValidators');

// Public routes
router.get('/', getItems);
router.get('/:id', itemIdRules, validate, getItemById);

// Protected routes (ownership is checked in the controller for update and delete).
// Create and update accept multipart/form-data with up to 5 files in the 'images' field.
router.post('/', protect, authorize('owner', 'admin'), uploadItemImages, createItemRules, validate, createItem);
router.put('/:id', protect, authorize('owner', 'admin'), uploadItemImages, updateItemRules, validate, updateItem);
router.delete('/:id', protect, authorize('owner', 'admin'), itemIdRules, validate, deleteItem);

module.exports = router;
