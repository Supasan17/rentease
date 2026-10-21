/**
 * Request Validation Middleware
 *
 * Collects express-validator results and rejects the request with a
 * 400 response listing every failed field before it reaches the controller.
 */

const { validationResult } = require('express-validator');

/**
 * Validate request: Runs after express-validator rule chains.
 * Responds with field-level errors if any rule failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = validate;
