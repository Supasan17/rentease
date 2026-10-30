/**
 * App Root Component
 *
 * Defines the client routes. Every page renders inside the shared Layout,
 * and pages that need a logged-in user sit behind ProtectedRoute.
 */

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import ItemForm from './pages/ItemForm.jsx';
import MyListings from './pages/MyListings.jsx';
import RentalRequests from './pages/RentalRequests.jsx';
import MyRentals from './pages/MyRentals.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute roles={['owner', 'admin']} />}>
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id/edit" element={<ItemForm />} />
          <Route path="/my-listings" element={<MyListings />} />
        </Route>
        <Route element={<ProtectedRoute roles={['owner']} />}>
          <Route path="/rental-requests" element={<RentalRequests />} />
        </Route>
        <Route element={<ProtectedRoute roles={['renter']} />}>
          <Route path="/my-rentals" element={<MyRentals />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
