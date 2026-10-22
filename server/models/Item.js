/**
 * Item Model
 *
 * Defines the MongoDB schema for rentable household items listed by owners.
 * Includes pricing, location, availability, rating summary fields and a
 * text index on title and description for keyword search.
 */

const mongoose = require('mongoose');

const ITEM_CATEGORIES = [
  'furniture',
  'electronics',
  'kitchen',
  'tools',
  'appliances',
  'sports',
  'party',
  'other'
];

const ITEM_CONDITIONS = ['new', 'like-new', 'good', 'fair'];

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: {
        values: ITEM_CATEGORIES,
        message: 'Category must be one of: ' + ITEM_CATEGORIES.join(', ')
      }
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please provide a price per day'],
      min: [0, 'Price per day cannot be negative']
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, 'Deposit cannot be negative']
    },
    images: {
      type: [String],
      default: []
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true
      },
      address: {
        type: String,
        trim: true
      }
    },
    condition: {
      type: String,
      enum: {
        values: ITEM_CONDITIONS,
        message: 'Condition must be one of: ' + ITEM_CONDITIONS.join(', ')
      },
      default: 'good'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must belong to an owner']
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Text index used for keyword search across title and description
itemSchema.index({ title: 'text', description: 'text' });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
module.exports.ITEM_CATEGORIES = ITEM_CATEGORIES;
module.exports.ITEM_CONDITIONS = ITEM_CONDITIONS;
