/**
 * Authentication and Authorization Middleware
 * 
 * - protect: Verifies the JWT bearer token and attaches the authenticated user to req.user.
 * - authorize: Checks user roles for Role-Based Access Control (RBAC).
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: Ensures the incoming request includes a valid Bearer JWT.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header is provided with 'Bearer' format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(' ')[1];

      // Verify the JWT signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID embedded in token payload, excluding the hashed password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      return next();
    } catch (error) {
      console.error(`Auth Middleware Error: ${error.message}`);
      res.status(401);
      return next(new Error('Not authorized, token failed or expired'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

/**
 * Authorize roles: Restricts route access to specific roles.
 * Example usage: authorize('admin') or authorize('owner', 'admin')
 * 
 * @param  {...string} roles - Permitted user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource`)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
