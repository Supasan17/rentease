/**
 * Rental Price Calculator
 *
 * Works out a rental's price on the server from the item's own pricing.
 * Prices sent by the client are never used.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Counts rental days between two dates, including both the start and end day.
 * Times of day are ignored, so 1 Dec to 3 Dec is 3 days.
 */
const countRentalDays = (startDate, endDate) => {
  const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  return Math.round((end - start) / MS_PER_DAY) + 1;
};

/**
 * Calculates the price of renting an item for a date range.
 *
 * @param   {Object} item      - Item document with pricePerDay and deposit
 * @param   {Date}   startDate - First rental day
 * @param   {Date}   endDate   - Last rental day
 * @returns {Object} { totalDays, rentalCost, deposit, totalPrice }
 *                   where totalPrice = totalDays x pricePerDay + deposit
 */
const calculateRentalPrice = (item, startDate, endDate) => {
  const totalDays = countRentalDays(startDate, endDate);
  const deposit = item.deposit || 0;

  // Round to 2 decimal places to avoid floating point leftovers
  const rentalCost = Math.round(totalDays * item.pricePerDay * 100) / 100;
  const totalPrice = Math.round((rentalCost + deposit) * 100) / 100;

  return { totalDays, rentalCost, deposit, totalPrice };
};

module.exports = {
  countRentalDays,
  calculateRentalPrice
};
