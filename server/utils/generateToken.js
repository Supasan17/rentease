/**
 * JWT Token Generator Helper
 * 
 * Signs a JSON Web Token (JWT) containing the user's MongoDB ID as payload.
 * The token allows stateless authentication between the client and server.
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for an authenticated user.
 * 
 * @param {string} id - The MongoDB ObjectID of the user
 * @returns {string} - Signed JWT token valid for 30 days
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
