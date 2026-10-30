/**
 * Review Controller
 *
 * Manages item reviews. Only the renter of a returned rental may review it,
 * and only once. The item's rating summary is updated by the Review model.
 */

const Item = require('../models/Item');
const Rental = require('../models/Rental');
const Review = require('../models/Review');

/**
 * @desc    Review the item of a returned rental
 * @route   POST /api/reviews
 * @access  Private (the rental's renter)
 */
const createReview = async (req, res, next) => {
  try {
    // Fields are already validated by createReviewRules (see validators/reviewValidators.js)
    const { rental: rentalId, rating, comment } = req.body;

    const rental = await Rental.findById(rentalId);

    if (!rental) {
      res.status(404);
      return next(new Error('Rental not found'));
    }

    if (rental.renter.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Only the renter of this rental can review it'));
    }

    if (rental.status !== 'returned') {
      res.status(400);
      return next(new Error('You can only review a rental after it has been returned'));
    }

    if (!(await Item.exists({ _id: rental.item }))) {
      res.status(400);
      return next(new Error('This item no longer exists, so it cannot be reviewed'));
    }

    const alreadyReviewed = await Review.exists({ rental: rental._id });

    if (alreadyReviewed) {
      res.status(400);
      return next(new Error('You have already reviewed this rental'));
    }

    const review = await Review.create({
      item: rental.item,
      rental: rental._id,
      reviewer: req.user._id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review added',
      review
    });
  } catch (error) {
    // Two requests for the same rental at once: the unique index rejects the second
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('You have already reviewed this rental'));
    }
    next(error);
  }
};

/**
 * @desc    Get all reviews for an item
 * @route   GET /api/items/:id/reviews
 * @access  Public
 */
const getItemReviews = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).select('averageRating numReviews');

    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    const reviews = await Review.find({ item: item._id })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      averageRating: item.averageRating,
      numReviews: item.numReviews,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getItemReviews
};
