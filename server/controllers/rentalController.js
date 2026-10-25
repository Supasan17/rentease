/**
 * Rental Controller
 *
 * Manages rental bookings. Renters request an item for a date range; the
 * request is rejected if the item is the renter's own, is unavailable, or
 * its dates overlap another pending, approved or active rental. Prices are
 * always calculated on the server (see utils/calculateRentalPrice.js).
 *
 * Status workflow:
 *   pending  -> approved | rejected   (owner)
 *   approved -> returned              (owner)
 *   active   -> returned              (owner)
 *   pending | approved -> cancelled   (renter)
 */

const Item = require('../models/Item');
const Rental = require('../models/Rental');
const { BLOCKING_STATUSES } = Rental;
const { calculateRentalPrice } = require('../utils/calculateRentalPrice');

/**
 * Checks whether the logged-in user may view the given rental.
 * Works with both populated and unpopulated renter / owner fields.
 */
const canViewRental = (user, rental) => {
  const userId = user._id.toString();
  const renterId = (rental.renter._id || rental.renter).toString();
  const ownerId = (rental.owner._id || rental.owner).toString();

  return user.role === 'admin' || renterId === userId || ownerId === userId;
};

/**
 * @desc    Create a rental booking request
 * @route   POST /api/rentals
 * @access  Private (renter)
 */
const createRental = async (req, res, next) => {
  try {
    // Fields are already validated by createRentalRules (see validators/rentalValidators.js)
    const { item: itemId, startDate, endDate, message } = req.body;

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    if (item.owner.toString() === req.user._id.toString()) {
      res.status(400);
      return next(new Error('You cannot book your own item'));
    }

    if (!item.isAvailable) {
      res.status(400);
      return next(new Error('This item is not available for rent'));
    }

    // Two date ranges overlap when each one starts on or before the other ends
    const overlapping = await Rental.findOne({
      item: item._id,
      status: { $in: BLOCKING_STATUSES },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    if (overlapping) {
      res.status(409);
      return next(new Error('This item is already booked for some of the selected dates'));
    }

    // Any price fields in the request body are ignored
    const { totalDays, rentalCost, deposit, totalPrice } = calculateRentalPrice(item, startDate, endDate);

    const rental = await Rental.create({
      item: item._id,
      renter: req.user._id,
      owner: item.owner,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      deposit,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent to the owner',
      rental,
      priceBreakdown: {
        pricePerDay: item.pricePerDay,
        totalDays,
        rentalCost,
        deposit,
        totalPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single rental by ID
 * @route   GET /api/rentals/:id
 * @access  Private (the rental's renter or owner, admin)
 */
const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('item', 'title images pricePerDay deposit location')
      .populate('renter', 'name email')
      .populate('owner', 'name email');

    if (!rental) {
      res.status(404);
      return next(new Error('Rental not found'));
    }

    if (!canViewRental(req.user, rental)) {
      res.status(403);
      return next(new Error('Not authorized to view this rental'));
    }

    res.status(200).json({
      success: true,
      rental
    });
  } catch (error) {
    next(error);
  }
};

// Fields shown when listing rentals for the renter or the owner
const ITEM_LIST_FIELDS = 'title images pricePerDay deposit location';

/**
 * Status changes each action allows: who may perform it, the statuses it
 * can start from, and the status it sets.
 */
const STATUS_ACTIONS = {
  approve: { actor: 'owner', from: ['pending'], to: 'approved' },
  reject: { actor: 'owner', from: ['pending'], to: 'rejected' },
  return: { actor: 'owner', from: ['approved', 'active'], to: 'returned' },
  cancel: { actor: 'renter', from: ['pending', 'approved'], to: 'cancelled' }
};

/**
 * Builds a controller that moves a rental to a new status, after checking
 * that the logged-in user is the right party and the current status allows it.
 *
 * @param {string} action - Key of STATUS_ACTIONS
 */
const changeRentalStatus = (action) => async (req, res, next) => {
  try {
    const { actor, from, to } = STATUS_ACTIONS[action];

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      res.status(404);
      return next(new Error('Rental not found'));
    }

    if (rental[actor].toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error(`Only the rental's ${actor} can ${action} it`));
    }

    if (!from.includes(rental.status)) {
      res.status(400);
      return next(new Error(`Cannot ${action} a rental that is ${rental.status}`));
    }

    rental.status = to;
    await rental.save();

    res.status(200).json({
      success: true,
      message: `Rental ${to}`,
      rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the logged-in renter's bookings
 * @route   GET /api/rentals/my?status=
 * @access  Private (renter)
 */
const getMyRentals = async (req, res, next) => {
  try {
    const filter = { renter: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const rentals = await Rental.find(filter)
      .populate('item', ITEM_LIST_FIELDS)
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

/**
 * @desc    Get booking requests for the logged-in owner's items
 * @route   GET /api/rentals/requests?status=
 * @access  Private (owner)
 */
const getRentalRequests = async (req, res, next) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const rentals = await Rental.find(filter)
      .populate('item', ITEM_LIST_FIELDS)
      .populate('renter', 'name email')
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

/**
 * @desc    Approve a pending rental
 * @route   PATCH /api/rentals/:id/approve
 * @access  Private (the rental's owner)
 */
const approveRental = changeRentalStatus('approve');

/**
 * @desc    Reject a pending rental
 * @route   PATCH /api/rentals/:id/reject
 * @access  Private (the rental's owner)
 */
const rejectRental = changeRentalStatus('reject');

/**
 * @desc    Mark an approved or active rental as returned
 * @route   PATCH /api/rentals/:id/return
 * @access  Private (the rental's owner)
 */
const returnRental = changeRentalStatus('return');

/**
 * @desc    Cancel a pending or approved rental
 * @route   PATCH /api/rentals/:id/cancel
 * @access  Private (the rental's renter)
 */
const cancelRental = changeRentalStatus('cancel');

module.exports = {
  createRental,
  getRentalById,
  getMyRentals,
  getRentalRequests,
  approveRental,
  rejectRental,
  returnRental,
  cancelRental
};
