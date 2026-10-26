/**
 * Not Found Page
 *
 * Shown for any route that doesn't match.
 */

import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for doesn&apos;t exist.</p>
      <Link to="/" className="mt-6 inline-block font-medium text-emerald-600 hover:underline">
        Back to browsing
      </Link>
    </section>
  );
}

export default NotFound;
