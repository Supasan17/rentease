/**
 * Review Model
 *
 * Defines the MongoDB schema for item reviews. A renter may review an item
 * once per returned rental. Saving or deleting a review recalculates the
 * item's averageRating and numReviews.
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Review must be for an item']
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Review must belong to a rental']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a reviewer']
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// One review per rental, and fast lookups of an item's reviews
reviewSchema.index({ rental: 1 }, { unique: true });
reviewSchema.index({ item: 1, createdAt: -1 });

/**
 * Static Method:
 * Recalculates an item's averageRating (rounded to 1 decimal) and numReviews
 * from all of its reviews.
 *
 * @param {ObjectId} itemId - The item to update
 */
reviewSchema.statics.updateItemRating = async function (itemId) {
  const [stats] = await this.aggregate([
    { $match: { item: itemId } },
    {
      $group: {
        _id: '$item',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  await mongoose.model('Item').findByIdAndUpdate(itemId, {
    averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
    numReviews: stats ? stats.numReviews : 0
  });
};

/**
 * Mongoose Post Hooks:
 * Keep the item's rating summary in step whenever a review is saved or deleted.
 */
reviewSchema.post('save', async function () {
  await this.constructor.updateItemRating(this.item);
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.updateItemRating(this.item);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
