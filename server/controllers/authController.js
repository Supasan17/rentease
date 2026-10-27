/**
 * Authentication Controller
 * 
 * Manages user registration, user login, and profile retrieval and updates.
 * Issues JSON Web Tokens (JWT) for authenticated sessions.
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { SIGNUP_ROLES } = require('../validators/authValidators');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Fields are already validated by registerRules (see validators/authValidators.js)
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email address'));
    }

    // Assign signup role (default to 'renter'). Admin can never be self-assigned.
    const userRole = SIGNUP_ROLES.includes(role) ? role : 'renter';

    // Create new user (password is automatically hashed via Mongoose pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole
    });

    // Return created user with signed JWT
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // Fields are already validated by loginRules (see validators/authValidators.js)
    const { email, password } = req.body;

    // Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Verify user exists and entered password matches the stored bcrypt hash
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private (Requires JWT token)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update currently logged-in user profile
 * @route   PUT /api/auth/me
 * @access  Private (Requires JWT token)
 */
const updateMe = async (req, res, next) => {
  try {
    // Fields are already validated by updateProfileRules (see validators/authValidators.js)
    const { name, phone, address, currentPassword, newPassword } = req.body;

    // Load the full user document (req.user has no password hash)
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone || undefined;
    if (address !== undefined) user.address = address || undefined;

    // Changing the password requires the current one
    if (newPassword) {
      if (!(await user.matchPassword(currentPassword))) {
        res.status(401);
        return next(new Error('Current password is incorrect'));
      }
      // Hashed by the Mongoose pre-save hook
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: newPassword ? 'Profile and password updated' : 'Profile updated',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe
};
