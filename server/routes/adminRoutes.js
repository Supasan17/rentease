/**
 * Admin Routes
 *
 * Defines the admin-only endpoints for users, items, rentals and stats.
 * Every route requires a logged-in admin.
 */

const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserStatus,
  getAllItems,
  getAllRentals
} = require('../controllers/adminController');
const { deleteItem } = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { userStatusRules, itemIdRules } = require('../validators/adminValidators');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', userStatusRules, validate, updateUserStatus);
router.get('/items', getAllItems);
router.delete('/items/:id', itemIdRules, validate, deleteItem);
router.get('/rentals', getAllRentals);

module.exports = router;
