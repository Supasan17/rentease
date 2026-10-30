/**
 * My Listings Page
 *
 * Shows the logged-in owner's items from GET /api/items/mine, each with
 * view, edit and delete buttons. Deleting asks for confirmation first and
 * then calls DELETE /api/items/:id.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice, getImageUrl } from '../utils/items.js';

function MyListings() {
  const showToast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/items/mine');
        if (!ignore) setItems(data.items);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchItems();
    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    setActionError('');
    setDeletingId(item._id);
    try {
      await api.delete(`/items/${item._id}`);
      setItems((prev) => prev.filter((current) => current._id !== item._id));
      showToast('Item deleted');
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My listings</h1>
          <p className="mt-1 text-gray-600">Items you rent out on RentEase.</p>
        </div>
        <Link
          to="/items/new"
          className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          List an item
        </Link>
      </div>

      {(error || actionError) && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error || actionError}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading your listings..." />
      ) : (
        !error &&
        (items.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="font-medium text-gray-900">You haven't listed any items yet</p>
            <p className="mt-1 text-sm text-gray-600">List something you own and start earning from it.</p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {items.map((item) => (
              <li key={item._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-20 w-full shrink-0 overflow-hidden rounded-md bg-gray-100 sm:w-28">
                  {item.images?.[0] ? (
                    <img src={getImageUrl(item.images[0])} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link to={`/items/${item._id}`} className="font-semibold text-gray-900 hover:text-emerald-700">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    <span className="capitalize">{item.category}</span> · {item.location?.city} ·{' '}
                    {formatPrice(item.pricePerDay)} / day
                  </p>
                  <p className="mt-1 text-sm">
                    {item.isAvailable ? (
                      <span className="text-emerald-700">Available</span>
                    ) : (
                      <span className="text-gray-500">Unavailable</span>
                    )}
                    <span className="text-gray-400"> · </span>
                    <span className="text-gray-600">
                      {item.numReviews > 0
                        ? `★ ${item.averageRating.toFixed(1)} (${item.numReviews})`
                        : 'No reviews'}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    to={`/items/${item._id}/edit`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-emerald-500 hover:text-emerald-700"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item._id}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === item._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ))
      )}
    </section>
  );
}

export default MyListings;
