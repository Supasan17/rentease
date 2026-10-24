/**
 * Rental Controller
 *
 * Manages rental bookings. Renters request an item for a date range; the
 * request is rejected if the item is the renter's own, is unavailable, or
 * its dates overlap another pending, approved or active rental. Prices are
 * always calculated on the server (see utils/calculateRentalPrice.js).
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

module.exports = {
  createRental,
  getRentalById
};
