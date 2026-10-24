/**
 * Rental Controller
 *
 * Manages rental bookings. Renters request an item for a date range; the
 * request is rejected if the item is the renter's own, is unavailable, or
 * its dates overlap another pending, approved or active rental.
 */

const Item = require('../models/Item');
const Rental = require('../models/Rental');
const { BLOCKING_STATUSES } = Rental;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

    // Both the start and end dates count as rental days
    const totalDays = Math.round((endDate - startDate) / MS_PER_DAY) + 1;

    const rental = await Rental.create({
      item: item._id,
      renter: req.user._id,
      owner: item.owner,
      startDate,
      endDate,
      totalDays,
      totalPrice: totalDays * item.pricePerDay,
      deposit: item.deposit,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent to the owner',
      rental
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRental
};
