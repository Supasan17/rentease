/**
 * Database Connection Module
 * 
 * Uses Mongoose to connect the Express application to MongoDB.
 * The connection URI is loaded securely from environment variables.
 */

const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database.
 * If the connection fails, logs the error and exits the application process.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
