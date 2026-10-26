/**
 * Navbar Component
 *
 * Top navigation bar with the RentEase brand and the main links.
 * Collapses into a toggle menu on small screens.
 */

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:text-emerald-600'
  }`;

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
        Browse
      </NavLink>
      <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
        Login
      </NavLink>
      <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
        Sign up
      </NavLink>
    </>
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-emerald-600">
          RentEase
        </Link>

        <div className="hidden items-center gap-1 sm:flex">{links}</div>

        <button
          type="button"
          className="rounded-md p-2 text-gray-700 sm:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {open && <div className="space-y-1 border-t border-gray-100 px-4 py-2 sm:hidden">{links}</div>}
    </header>
  );
}

export default Navbar;
