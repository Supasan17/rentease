/**
 * Item Controller
 *
 * Manages household item listings: public browsing, creation by owners,
 * and updates or deletion restricted to the item's owner or an admin.
 * Item images are uploaded with uploadItemImages and stored as '/uploads/<file>'.
 */

const Item = require('../models/Item');
const {
  removeUploadedFiles,
  removeImages,
  getUploadedImagePaths
} = require('../middleware/uploadMiddleware');

// Fields a client may set on create or update. Owner and rating fields are server-managed.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'category',
  'pricePerDay',
  'deposit',
  'condition',
  'isAvailable'
];

// Sort options accepted by GET /api/items (?sort=)
const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { pricePerDay: 1 },
  price_desc: { pricePerDay: -1 },
  rating: { averageRating: -1, numReviews: -1 }
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

/**
 * Checks whether the logged-in user may modify the given item.
 */
const canModifyItem = (user, item) =>
  user.role === 'admin' || item.owner.toString() === user._id.toString();

/**
 * Escapes special characters so user input can be used safely inside a RegExp.
 */
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Get items with search, filters, sorting and pagination
 * @route   GET /api/items?search=&category=&minPrice=&maxPrice=&city=&sort=&page=&limit=
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    // Query values are already validated and converted by listItemsRules
    const { search, category, minPrice, maxPrice, city, sort } = req.query;
    const page = req.query.page || 1;
    const limit = Math.min(req.query.limit || DEFAULT_LIMIT, MAX_LIMIT);

    const filter = {};

    // Keyword search uses the text index on title and description
    if (search) filter.$text = { $search: search };

    if (category) filter.category = category;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerDay = {};
      if (minPrice !== undefined) filter.pricePerDay.$gte = minPrice;
      if (maxPrice !== undefined) filter.pricePerDay.$lte = maxPrice;
    }

    // City match is case-insensitive and exact (ignoring surrounding spaces)
    if (city) filter['location.city'] = new RegExp(`^${escapeRegex(city)}$`, 'i');

    const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('owner', 'name')
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      items,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the logged-in user's own item listings
 * @route   GET /api/items/mine
 * @access  Private (owner, admin)
 */
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });

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
 * @desc    Get a single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name email');

    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new item listing
 * @route   POST /api/items
 * @access  Private (owner, admin)
 */
const createItem = async (req, res, next) => {
  try {
    // Fields are already validated by createItemRules (see validators/itemValidators.js)
    const data = {};
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });

    data.location = {
      city: req.body.location.city,
      address: req.body.location.address
    };

    // The logged-in user always becomes the owner
    data.owner = req.user._id;

    data.images = getUploadedImagePaths(req);

    const item = await Item.create(data);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    removeUploadedFiles(req);
    next(error);
  }
};

/**
 * @desc    Update an item
 * @route   PUT /api/items/:id
 * @access  Private (item owner, admin)
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      removeUploadedFiles(req);
      res.status(404);
      return next(new Error('Item not found'));
    }

    if (!canModifyItem(req.user, item)) {
      removeUploadedFiles(req);
      res.status(403);
      return next(new Error('Not authorized to update this item'));
    }

    // Apply only the fields that were sent
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    if (req.body.location) {
      if (req.body.location.city !== undefined) item.location.city = req.body.location.city;
      if (req.body.location.address !== undefined) item.location.address = req.body.location.address;
    }

    // Newly uploaded images replace the existing ones
    const newImages = getUploadedImagePaths(req);
    const oldImages = newImages.length > 0 ? [...item.images] : [];
    if (newImages.length > 0) item.images = newImages;

    const updatedItem = await item.save();

    // Remove the replaced image files only after the update is saved
    removeImages(oldImages);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    removeUploadedFiles(req);
    next(error);
  }
};

/**
 * @desc    Delete an item
 * @route   DELETE /api/items/:id
 * @access  Private (item owner, admin)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    if (!canModifyItem(req.user, item)) {
      res.status(403);
      return next(new Error('Not authorized to delete this item'));
    }

    await item.deleteOne();

    removeImages(item.images);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
