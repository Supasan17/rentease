/**
 * Admin Dashboard Page
 *
 * Admin-only overview built on the /api/admin endpoints: summary counts, plus
 * tabs for managing users (activate / deactivate), items (delete) and viewing
 * every rental.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/items.js';
import { formatRentalDate } from '../utils/rentals.js';

const TABS = ['users', 'items', 'rentals'];

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/**
 * Scrollable table with a header row, so wide data never stretches the page.
 */
function Table({ headers, children }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const showToast = useToast();
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ users: [], items: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, usersRes, itemsRes, rentalsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/items'),
          api.get('/admin/rentals'),
        ]);
        if (!ignore) {
          setStats(statsRes.data.stats);
          setData({
            users: usersRes.data.users,
            items: itemsRes.data.items,
            rentals: rentalsRes.data.rentals,
          });
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleUser = async (user) => {
    const nextActive = !user.isActive;
    if (!nextActive && !window.confirm(`Deactivate ${user.name}? They will not be able to log in.`)) return;

    setActionError('');
    setBusyId(user._id);
    try {
      const { data: res } = await api.patch(`/admin/users/${user._id}/status`, { isActive: nextActive });
      setData((prev) => ({
        ...prev,
        users: prev.users.map((current) => (current._id === user._id ? res.user : current)),
      }));
      showToast(res.message);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    setActionError('');
    setBusyId(item._id);
    try {
      await api.delete(`/admin/items/${item._id}`);
      setData((prev) => ({ ...prev, items: prev.items.filter((current) => current._id !== item._id) }));
      setStats((prev) => ({ ...prev, items: prev.items - 1 }));
      showToast('Item deleted');
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {error}
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-gray-600">Manage users and listings, and see every rental.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Items" value={stats.items} />
        <StatCard label="Rentals" value={stats.rentals} />
        <StatCard label="Reviews" value={stats.reviews} />
      </div>

      <div className="mt-8 flex gap-1 border-b border-gray-200" role="tablist">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === name
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {name} ({data[name].length})
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {actionError}
        </div>
      )}

      {tab === 'users' && (
        <Table headers={['Name', 'Email', 'Role', 'Status', '']}>
          {data.users.map((user) => (
            <tr key={user._id}>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{user.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3 capitalize text-gray-600">{user.role}</td>
              <td className="px-4 py-3">
                <span className={user.isActive ? 'text-emerald-700' : 'text-red-600'}>
                  {user.isActive ? 'Active' : 'Deactivated'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {user._id !== currentUser._id && (
                  <button
                    type="button"
                    onClick={() => handleToggleUser(user)}
                    disabled={busyId === user._id}
                    className="whitespace-nowrap rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-emerald-500 disabled:opacity-60"
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {tab === 'items' && (
        <Table headers={['Title', 'Owner', 'Category', 'Price / day', '']}>
          {data.items.map((item) => (
            <tr key={item._id}>
              <td className="whitespace-nowrap px-4 py-3">
                <Link to={`/items/${item._id}`} className="font-medium text-gray-900 hover:text-emerald-700">
                  {item.title}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{item.owner?.name || 'Unknown'}</td>
              <td className="px-4 py-3 capitalize text-gray-600">{item.category}</td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatPrice(item.pricePerDay)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item)}
                  disabled={busyId === item._id}
                  className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {tab === 'rentals' &&
        (data.rentals.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-8 text-center text-sm text-gray-600">
            No rentals yet.
          </p>
        ) : (
          <Table headers={['Item', 'Renter', 'Owner', 'Dates', 'Total', 'Status']}>
            {data.rentals.map((rental) => (
              <tr key={rental._id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  {rental.item?.title || 'Deleted item'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{rental.renter?.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{rental.owner?.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatRentalDate(rental.startDate)} – {formatRentalDate(rental.endDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatPrice(rental.totalPrice)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={rental.status} />
                </td>
              </tr>
            ))}
          </Table>
        ))}
    </section>
  );
}

export default AdminDashboard;
