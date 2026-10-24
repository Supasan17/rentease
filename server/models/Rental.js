/**
 * Rental Model
 *
 * Defines the MongoDB schema for rental bookings. A renter books an owner's
 * item for a date range; the owner then approves or rejects the request and
 * later marks the item as returned. Price fields are always calculated on
 * the server from the item's pricing.
 */

const mongoose = require('mongoose');

const RENTAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'active',
  'returned',
  'cancelled'
];

// Statuses that keep the item's dates reserved (used for the overlap check)
const BLOCKING_STATUSES = ['pending', 'approved', 'active'];

const rentalSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Rental must be for an item']
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rental must have a renter']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rental must have an owner']
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date']
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date']
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'A rental must be at least 1 day long']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, 'Deposit cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: RENTAL_STATUSES,
        message: 'Status must be one of: ' + RENTAL_STATUSES.join(', ')
      },
      default: 'pending'
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

/**
 * Mongoose Pre-Validate Hook:
 * Makes sure the end date is not before the start date.
 */
rentalSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date cannot be before the start date');
  }
  next();
});

// Speeds up the date overlap check and the renter / owner rental lists
rentalSchema.index({ item: 1, status: 1, startDate: 1, endDate: 1 });
rentalSchema.index({ renter: 1, createdAt: -1 });
rentalSchema.index({ owner: 1, createdAt: -1 });

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;
module.exports.RENTAL_STATUSES = RENTAL_STATUSES;
module.exports.BLOCKING_STATUSES = BLOCKING_STATUSES;
