/**
 * Item Helpers
 *
 * Shared item constants (categories, conditions and sort options, matching
 * the server)
 * and small formatting helpers for prices and image URLs.
 */

export const CATEGORIES = [
  'furniture',
  'electronics',
  'kitchen',
  'tools',
  'appliances',
  'sports',
  'party',
  'other',
];

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

// Uploaded images are served by the API server at /uploads, outside /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

/**
 * Turn a stored image path like '/uploads/abc.jpg' into a full URL.
 * Full URLs are returned unchanged.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  return /^https?:\/\//.test(path) ? path : `${SERVER_URL}${path}`;
};

/**
 * Format an amount in Sri Lankan rupees, e.g. 1500 -> 'Rs. 1,500'.
 */
export const formatPrice = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-LK', { maximumFractionDigits: 2 })}`;
