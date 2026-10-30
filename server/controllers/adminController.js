/**
 * Admin Controller
 *
 * Admin-only management: listing users and activating or deactivating them,
 * listing items and rentals, and summary counts for the dashboard.
 * Items are deleted through the shared deleteItem controller (see adminRoutes.js).
 */

const User = require('../models/User');
const Item = require('../models/Item');
const Rental = require('../models/Rental');
const Review = require('../models/Review');

/**
 * Turns a [{ _id, count }] aggregation result into a { key: count } object.
 */
const toCounts = (groups) =>
  groups.reduce((counts, group) => ({ ...counts, [group._id]: group.count }), {});

/**
 * @desc    Get summary counts for the admin dashboard
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 */
const getStats = async (req, res, next) => {
  try {
    const [users, items, rentals, reviews, usersByRole, rentalsByStatus] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Rental.countDocuments(),
      Review.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Rental.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users,
        items,
        rentals,
        reviews,
        usersByRole: toCounts(usersByRole),
        rentalsByStatus: toCounts(rentalsByStatus)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all users, newest first
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate or deactivate a user
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (admin)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      res.status(400);
      return next(new Error('You cannot change the status of your own account'));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all items, newest first
 * @route   GET /api/admin/items
 * @access  Private (admin)
 */
const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all rentals, newest first
 * @route   GET /api/admin/rentals
 * @access  Private (admin)
 */
const getAllRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.find()
      .populate('item', 'title')
      .populate('renter', 'name email')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserStatus,
  getAllItems,
  getAllRentals
};
