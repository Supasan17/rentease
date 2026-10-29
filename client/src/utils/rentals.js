/**
 * Rental Helpers
 *
 * Shared rental constants (statuses, matching the server) and small
 * helpers for showing rental dates and status badges.
 */

export const RENTAL_STATUSES = ['pending', 'approved', 'rejected', 'active', 'returned', 'cancelled'];

// Tailwind classes for each status badge
export const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  active: 'bg-sky-50 text-sky-700',
  returned: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

/**
 * Format a rental date like 'Oct 29, 2026'. Rental dates are stored as
 * whole days at midnight UTC, so they are shown in UTC to avoid
 * slipping a day in other time zones.
 */
export const formatRentalDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

/**
 * Today's local date as 'YYYY-MM-DD', for date input minimums.
 */
export const getTodayString = () => new Date().toLocaleDateString('en-CA');

/**
 * Count the days in a booking, counting both the start and end day,
 * the same way the server does. Returns 0 for missing or reversed dates.
 */
export const countRentalDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const days = Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
  return days > 0 ? days : 0;
};
