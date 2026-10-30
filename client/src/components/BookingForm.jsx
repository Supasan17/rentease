/**
 * Booking Form
 *
 * Lets a renter pick start and end dates for an item, shows a live price
 * total (days x price per day, plus the deposit) and sends the booking
 * request to POST /api/rentals. The server works out the final price, so
 * the total shown here is only an estimate. Visitors who are not logged in
 * are asked to log in, and owners and admins see a short note instead.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/items.js';
import { countRentalDays, formatRentalDate, getTodayString } from '../utils/rentals.js';

const INITIAL_FORM = { startDate: '', endDate: '', message: '' };

function BookingForm({ item }) {
  const { user } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);

  if (!item.isAvailable) return null;

  if (!user) {
    return (
      <p className="mt-4 text-sm text-gray-600">
        <Link to="/login" state={{ from: location }} className="font-medium text-emerald-600 hover:underline">
          Log in
        </Link>{' '}
        as a renter to book this item.
      </p>
    );
  }

  if (item.owner?._id === user._id) {
    return <p className="mt-4 text-sm text-gray-600">This is your listing, so you can't book it.</p>;
  }

  if (user.role !== 'renter') {
    return <p className="mt-4 text-sm text-gray-600">Only renter accounts can book items.</p>;
  }

  if (booking) {
    return (
      <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <p className="font-medium">Booking request sent to the owner.</p>
        <p className="mt-1">
          {formatRentalDate(booking.startDate)} – {formatRentalDate(booking.endDate)} ·{' '}
          {formatPrice(booking.totalPrice)} total, including the deposit.
        </p>
        <div className="mt-2 flex flex-wrap gap-4">
          <Link to="/my-rentals" className="font-medium text-emerald-700 hover:underline">
            View my rentals
          </Link>
          <button
            type="button"
            onClick={() => {
              setBooking(null);
              setForm(INITIAL_FORM);
            }}
            className="font-medium text-emerald-700 hover:underline"
          >
            Book other dates
          </button>
        </div>
      </div>
    );
  }

  const today = getTodayString();
  const totalDays = countRentalDays(form.startDate, form.endDate);
  const rentalCost = totalDays * item.pricePerDay;
  const total = rentalCost + (item.deposit || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.startDate) next.startDate = 'Please choose a start date';
    else if (form.startDate < today) next.startDate = 'Start date cannot be in the past';
    if (!form.endDate) next.endDate = 'Please choose an end date';
    else if (form.startDate && form.endDate < form.startDate) {
      next.endDate = 'End date cannot be before the start date';
    }
    if (form.message.length > 500) next.message = 'Message cannot exceed 500 characters';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/rentals', {
        item: item._id,
        startDate: form.startDate,
        endDate: form.endDate,
        message: form.message.trim() || undefined,
      });
      setBooking(data.rental);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 border-t border-gray-200 pt-5">
      <h2 className="text-lg font-semibold">Book this item</h2>

      {serverError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          Start date
          <input
            type="date"
            name="startDate"
            min={today}
            value={form.startDate}
            onChange={handleChange}
            className={inputClass('startDate')}
          />
          {errors.startDate && <span className="mt-1 block text-xs text-red-600">{errors.startDate}</span>}
        </label>
        <label className="block text-sm font-medium text-gray-700">
          End date
          <input
            type="date"
            name="endDate"
            min={form.startDate || today}
            value={form.endDate}
            onChange={handleChange}
            className={inputClass('endDate')}
          />
          {errors.endDate && <span className="mt-1 block text-xs text-red-600">{errors.endDate}</span>}
        </label>
      </div>

      <label className="mt-3 block text-sm font-medium text-gray-700">
        Message to the owner <span className="font-normal text-gray-500">(optional)</span>
        <textarea
          name="message"
          rows={2}
          maxLength={500}
          value={form.message}
          onChange={handleChange}
          className={inputClass('message')}
        />
        {errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message}</span>}
      </label>

      {totalDays > 0 && (
        <dl className="mt-4 space-y-1 rounded-md bg-gray-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">
              {formatPrice(item.pricePerDay)} × {totalDays} day{totalDays === 1 ? '' : 's'}
            </dt>
            <dd>{formatPrice(rentalCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Refundable deposit</dt>
            <dd>{formatPrice(item.deposit)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
            <dt>Estimated total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? 'Sending request...' : 'Request booking'}
      </button>
    </form>
  );
}

export default BookingForm;
