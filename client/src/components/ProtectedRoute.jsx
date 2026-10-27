/**
 * ProtectedRoute Component
 *
 * Wraps routes that need a logged-in user. Guests are sent to the login
 * page (and brought back afterwards). If `roles` is given, users without
 * one of those roles see an access-denied message instead.
 *
 * Usage: <Route element={<ProtectedRoute roles={['owner', 'admin']} />}>...</Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the saved session to be restored before deciding
  if (loading) {
    return <p className="py-12 text-center text-gray-500">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return (
      <section className="py-12 text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-gray-600">Your account does not have permission to view this page.</p>
      </section>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
