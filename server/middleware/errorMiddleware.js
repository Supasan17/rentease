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
  // If status code is 200 (OK) but an error was thrown, use the error's own
  // status (malformed JSON, for example) or default to 500 (Internal Server Error)
  let statusCode = res.statusCode === 200 ? err.status || 500 : res.statusCode;
  let message = err.message || 'Server Error';

  // Turn common database errors into client errors instead of a 500
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID or value';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'That value is already in use';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development mode for debugging
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  notFound,
  errorHandler
};
