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
