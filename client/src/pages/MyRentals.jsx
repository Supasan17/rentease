/**
 * My Rentals Page
 *
 * Shows the logged-in renter's bookings from GET /api/rentals/my, filterable
 * by status. Pending and approved bookings can be cancelled after a
 * confirmation (PATCH /api/rentals/:id/cancel).
 * Returned rentals that have not been reviewed yet show a review form.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatPrice } from '../utils/items.js';
import { RENTAL_STATUSES, formatRentalDate } from '../utils/rentals.js';

// Statuses the renter may cancel from (matches the server's rules)
const CANCELLABLE_STATUSES = ['pending', 'approved'];

function MyRentals() {
  const showToast = useToast();
  const [status, setStatus] = useState('');
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchRentals = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/rentals/my', {
          params: status ? { status } : {},
        });
        if (!ignore) setRentals(data.rentals);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchRentals();
    return () => {
      ignore = true;
    };
  }, [status]);

  const handleCancel = async (rental) => {
    if (!window.confirm('Cancel this booking?')) return;

    setActionError('');
    setCancellingId(rental._id);
    try {
      const { data } = await api.patch(`/rentals/${rental._id}/cancel`);
      setRentals((prev) =>
        prev
          .map((current) => (current._id === rental._id ? { ...current, status: data.rental.status } : current))
          .filter((current) => !status || current.status === status)
      );
      showToast('Booking cancelled');
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  const markReviewed = (rentalId) => {
    setRentals((prev) =>
      prev.map((current) => (current._id === rentalId ? { ...current, reviewed: true } : current))
    );
    showToast('Thanks for your review!');
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My rentals</h1>
          <p className="mt-1 text-gray-600">Items you have booked on RentEase.</p>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm capitalize focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All</option>
            {RENTAL_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(error || actionError) && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error || actionError}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading your rentals..." />
      ) : (
        !error &&
        (rentals.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="font-medium text-gray-900">No rentals found</p>
            <p className="mt-1 text-sm text-gray-600">
              {status ? `You have no ${status} rentals.` : 'Browse the listings and book something you need.'}
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {rentals.map((rental) => (
              <li key={rental._id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    {rental.item ? (
                      <Link
                        to={`/items/${rental.item._id}`}
                        className="font-semibold text-gray-900 hover:text-emerald-700"
                      >
                        {rental.item.title}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-500">Deleted item</span>
                    )}
                    <p className="mt-1 text-sm text-gray-600">
                      Owner: <span className="font-medium text-gray-900">{rental.owner?.name}</span>
                    </p>
                  </div>
                  <StatusBadge status={rental.status} />
                </div>

                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-gray-500">Dates</dt>
                    <dd className="font-medium text-gray-900">
                      {formatRentalDate(rental.startDate)} – {formatRentalDate(rental.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Days</dt>
                    <dd className="font-medium text-gray-900">{rental.totalDays}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Total (incl. deposit)</dt>
                    <dd className="font-medium text-gray-900">
                      {formatPrice(rental.totalPrice)}
                      {rental.deposit > 0 && (
                        <span className="font-normal text-gray-500"> ({formatPrice(rental.deposit)} deposit)</span>
                      )}
                    </dd>
                  </div>
                </dl>
                {rental.status === 'returned' && rental.item && !rental.reviewed && (
                  <ReviewForm rentalId={rental._id} onReviewed={() => markReviewed(rental._id)} />
                )}
                {rental.status === 'returned' && rental.reviewed && (
                  <p className="mt-3 text-sm text-emerald-700">You reviewed this rental. Thank you!</p>
                )}


                {CANCELLABLE_STATUSES.includes(rental.status) && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleCancel(rental)}
                      disabled={cancellingId === rental._id}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cancellingId === rental._id ? 'Cancelling...' : 'Cancel booking'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ))
      )}
    </section>
  );
}

export default MyRentals;
