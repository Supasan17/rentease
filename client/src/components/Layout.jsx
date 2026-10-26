/**
 * Layout Component
 *
 * Shared page shell: navbar on top, the current route in the middle
 * and the footer at the bottom.
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
