/**
 * Navbar Component
 *
 * Top navigation bar with the RentEase brand and the main links.
 * Guests see login and sign-up links; logged-in users see their name and
 * role (linking to their profile) and a logout button. Owners and admins
 * also get links to list a new item and to their listings, and owners get
 * a link to their rental requests, and renters to their rentals. Collapses
 * into a toggle menu below the lg breakpoint, where the links would not fit.
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:text-emerald-600'
  }`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
        Browse
      </NavLink>
      {user ? (
        <>
          {['owner', 'admin'].includes(user.role) && (
            <>
              <NavLink to="/items/new" className={linkClass} onClick={() => setOpen(false)}>
                List an item
              </NavLink>
              <NavLink to="/my-listings" className={linkClass} onClick={() => setOpen(false)}>
                My listings
              </NavLink>
            </>
          )}
          {user.role === 'owner' && (
            <NavLink to="/rental-requests" className={linkClass} onClick={() => setOpen(false)}>
              Requests
            </NavLink>
          )}
          {user.role === 'renter' && (
            <NavLink to="/my-rentals" className={linkClass} onClick={() => setOpen(false)}>
              My rentals
            </NavLink>
          )}
          {user.role === 'admin' && (
            <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
              Admin
            </NavLink>
          )}
          <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
            Hi, <span className="font-medium text-gray-900">{user.name}</span>{' '}
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium capitalize text-emerald-700">
              {user.role}
            </span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:text-emerald-600"
          >
            Logout
          </button>
        </>
      ) : (
        !loading && (
          <>
            <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
              Sign up
            </NavLink>
          </>
        )
      )}
    </>
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-emerald-600">
          RentEase
        </Link>

        <div className="hidden items-center gap-1 lg:flex">{links}</div>

        <button
          type="button"
          className="rounded-md p-2 text-gray-700 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {open && <div className="space-y-1 border-t border-gray-100 px-4 py-2 lg:hidden">{links}</div>}
    </header>
  );
}

export default Navbar;
