/**
 * Register Page
 *
 * Sign-up form where new users choose to join as a renter or an owner.
 * Uses the same rules as the server's registerRules, then posts to
 * /api/auth/register, saves the returned JWT and goes back to browsing.
 * Server error messages are shown above the form.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { TOKEN_KEY, getErrorMessage } from '../api/axios.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Roles a user may pick at signup (admins are created by the seed script)
const ROLE_OPTIONS = [
  { value: 'renter', label: 'Renter', hint: 'I want to rent items' },
  { value: 'owner', label: 'Owner', hint: 'I want to list my items' },
];

const validate = ({ name, email, password, confirmPassword, role }) => {
  const errors = {};
  if (!name.trim()) {
    errors.name = 'Please provide a name';
  } else if (name.trim().length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  }
  if (!email.trim()) {
    errors.email = 'Please provide an email address';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Please provide a valid email address';
  }
  if (!password) {
    errors.password = 'Please provide a password';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  if (!ROLE_OPTIONS.some((option) => option.value === role)) {
    errors.role = 'Please choose renter or owner';
  }
  return errors;
};

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'renter',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      navigate('/');
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <p className="mt-2 text-gray-600">Join RentEase to rent household items or earn from your own.</p>

      {serverError && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700">I am joining as</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-md border px-3 py-2 ${
                  form.role === option.value
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                    : 'border-gray-300 hover:border-emerald-400'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={form.role === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="block font-medium">{option.label}</span>
                <span className="block text-xs text-gray-500">{option.hint}</span>
              </label>
            ))}
          </div>
          {fieldErrors.role && <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>}
        </fieldset>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-emerald-600 hover:underline">
          Log in
        </Link>
      </p>
    </section>
  );
}

export default Register;
