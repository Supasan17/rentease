/**
 * Rental Requests Page
 *
 * Shows booking requests for the logged-in owner's items from
 * GET /api/rentals/requests, filterable by status. Pending requests can be
 * approved or rejected, and approved or active rentals can be marked
 * returned (PATCH /api/rentals/:id/approve | reject | return).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatPrice } from '../utils/items.js';
import { RENTAL_STATUSES, formatRentalDate } from '../utils/rentals.js';

// Which actions the owner may take for each status (matches the server's rules)
const OWNER_ACTIONS = {
  pending: ['approve', 'reject'],
  approved: ['return'],
  active: ['return'],
};

const ACTION_LABELS = {
  approve: 'Approve',
  reject: 'Reject',
  return: 'Mark returned',
};

const ACTION_STYLES = {
  approve: 'bg-emerald-600 text-white hover:bg-emerald-700',
  reject: 'border border-red-200 text-red-600 hover:bg-red-50',
  return: 'border border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-700',
};

function RentalRequests() {
  const [status, setStatus] = useState('');
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchRentals = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/rentals/requests', {
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

  const handleAction = async (rental, action) => {
    if (action === 'reject' && !window.confirm('Reject this booking request?')) return;

    setActionError('');
    setBusyId(rental._id);
    try {
      const { data } = await api.patch(`/rentals/${rental._id}/${action}`);
      setRentals((prev) =>
        prev
          .map((current) => (current._id === rental._id ? { ...current, status: data.rental.status } : current))
          .filter((current) => !status || current.status === status)
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rental requests</h1>
          <p className="mt-1 text-gray-600">Booking requests for the items you rent out.</p>
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
        <p className="mt-6 text-sm text-gray-600">Loading requests...</p>
      ) : (
        !error &&
        (rentals.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="font-medium text-gray-900">No rental requests</p>
            <p className="mt-1 text-sm text-gray-600">
              {status ? `You have no ${status} rentals.` : 'Requests for your items will show up here.'}
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
                      Requested by <span className="font-medium text-gray-900">{rental.renter?.name}</span>
                      {rental.renter?.email && <span className="text-gray-500"> ({rental.renter.email})</span>}
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

                {rental.message && (
                  <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">“{rental.message}”</p>
                )}

                {OWNER_ACTIONS[rental.status] && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {OWNER_ACTIONS[rental.status].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => handleAction(rental, action)}
                        disabled={busyId === rental._id}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${ACTION_STYLES[action]}`}
                      >
                        {ACTION_LABELS[action]}
                      </button>
                    ))}
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

export default RentalRequests;
