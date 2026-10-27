/**
 * Profile Page
 *
 * Shows the logged-in user's account details and lets them edit their
 * name, phone and address, or change their password (which needs the
 * current password). Saves through PUT /api/auth/me via the auth context.
 * Server error messages are shown above each form.
 */

import { useState } from 'react';
import { getErrorMessage } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const PHONE_PATTERN = /^[0-9+()\-\s]*$/;

const validateDetails = ({ name, phone, address }) => {
  const errors = {};
  if (!name.trim()) {
    errors.name = 'Please provide a name';
  } else if (name.trim().length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  }
  if (phone.trim().length > 20) {
    errors.phone = 'Phone number cannot exceed 20 characters';
  } else if (!PHONE_PATTERN.test(phone.trim())) {
    errors.phone = 'Phone number can only contain digits, spaces and + - ( )';
  }
  if (address.trim().length > 200) {
    errors.address = 'Address cannot exceed 200 characters';
  }
  return errors;
};

const validatePassword = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = {};
  if (!currentPassword) {
    errors.currentPassword = 'Please provide your current password';
  }
  if (!newPassword) {
    errors.newPassword = 'Please provide a new password';
  } else if (newPassword.length < 6) {
    errors.newPassword = 'New password must be at least 6 characters long';
  }
  if (confirmPassword !== newPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
};

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

/**
 * Text input with a label and an error message underneath.
 */
function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input id={id} name={id} className={inputClass} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Success or error banner shown above a form.
 */
function Notice({ type, children }) {
  if (!children) return null;
  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return (
    <div className={`mt-4 rounded-md border px-4 py-3 text-sm ${styles}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

function Profile() {
  const { user, updateProfile } = useAuth();

  const [details, setDetails] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
  });
  const [detailErrors, setDetailErrors] = useState({});
  const [detailStatus, setDetailStatus] = useState({ type: '', message: '' });
  const [savingDetails, setSavingDetails] = useState(false);

  const [passwords, setPasswords] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
    setDetailErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    setDetailStatus({ type: '', message: '' });

    const errors = validateDetails(details);
    setDetailErrors(errors);
    if (Object.keys(errors).length) return;

    setSavingDetails(true);
    try {
      const data = await updateProfile({
        name: details.name.trim(),
        phone: details.phone.trim(),
        address: details.address.trim(),
      });
      setDetailStatus({ type: 'success', message: data.message });
    } catch (error) {
      setDetailStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSavingDetails(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    const errors = validatePassword(passwords);
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;

    setSavingPassword(true);
    try {
      await updateProfile({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(EMPTY_PASSWORD_FORM);
      setPasswordStatus({ type: 'success', message: 'Password changed' });
    } catch (error) {
      setPasswordStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSavingPassword(false);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My profile</h1>
        <p className="mt-2 text-gray-600">Manage your account details and password.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Account</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="mt-1 break-all font-medium text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Role</dt>
            <dd className="mt-1">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium capitalize text-emerald-700">
                {user.role}
              </span>
            </dd>
          </div>
          {memberSince && (
            <div>
              <dt className="text-gray-500">Member since</dt>
              <dd className="mt-1 font-medium text-gray-900">{memberSince}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Personal details</h2>
        <Notice type={detailStatus.type}>{detailStatus.message}</Notice>

        <form onSubmit={handleDetailSubmit} noValidate className="mt-4 space-y-4">
          <Field
            id="name"
            label="Name"
            type="text"
            autoComplete="name"
            value={details.name}
            onChange={handleDetailChange}
            error={detailErrors.name}
          />
          <Field
            id="phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            value={details.phone}
            onChange={handleDetailChange}
            error={detailErrors.phone}
          />
          <Field
            id="address"
            label="Address"
            type="text"
            autoComplete="street-address"
            value={details.address}
            onChange={handleDetailChange}
            error={detailErrors.address}
          />

          <button
            type="submit"
            disabled={savingDetails}
            className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingDetails ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <Notice type={passwordStatus.type}>{passwordStatus.message}</Notice>

        <form onSubmit={handlePasswordSubmit} noValidate className="mt-4 space-y-4">
          <Field
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.currentPassword}
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.newPassword}
          />
          <Field
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingPassword ? 'Updating...' : 'Change password'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Profile;
