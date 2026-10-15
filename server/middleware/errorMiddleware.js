/**
 * Centralized Error Handling Middleware
 * 
 * Intercepts unresolved routes and errors across the application,
 * returning consistent JSON responses and appropriate HTTP status codes.
 */

/**
 * Handles 404 Not Found errors for any route that does not exist.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler middleware.
 * Formats errors into a standard JSON structure with status code and error message.
 */
const errorHandler = (err, req, res, next) => {
  // If status code is 200 (OK) but an error was thrown, default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    // Include stack trace only in development mode for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
