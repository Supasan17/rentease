/**
 * Database Seed Script
 *
 * Clears the database and inserts sample data for local development:
 * 1 admin, 2 owners, 2 renters and 12 items. Run it with `npm run seed`.
 *
 * This is the only way to create an admin account, because public signup
 * cannot choose the admin role. Every seed account uses the password
 * 'password123', so never run this against a production database.
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load server/.env no matter which folder the script is run from
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Item = require('../models/Item');
const Rental = require('../models/Rental');
const Review = require('../models/Review');
const { createSeedImage } = require('./seedImages');

const SEED_PASSWORD = 'password123';

const users = [
  { name: 'Admin User', email: 'admin@gmail.com', role: 'admin' },
  { name: 'Nimal Perera', email: 'nimal@gmail.com', role: 'owner' },
  { name: 'Ayesha Fernando', email: 'ayesha@gmail.com', role: 'owner' },
  { name: 'Kasun Silva', email: 'kasun@gmail.com', role: 'renter' },
  { name: 'Dilini Jayasinghe', email: 'dilini@gmail.com', role: 'renter' }
];

// ownerEmail links each item to one of the seed owners above
const items = [
  {
    ownerEmail: 'nimal@gmail.com',
    title: 'Cordless Power Drill',
    description: '18V cordless drill with two batteries, a charger and a set of drill bits.',
    category: 'tools',
    pricePerDay: 800,
    deposit: 3000,
    location: { city: 'Colombo', address: 'Nugegoda' },
    condition: 'like-new'
  },
  {
    ownerEmail: 'nimal@gmail.com',
    title: 'Pressure Washer',
    description: '1600W pressure washer, good for cars, driveways and garden furniture.',
    category: 'tools',
    pricePerDay: 1500,
    deposit: 5000,
    location: { city: 'Colombo', address: 'Dehiwala' },
    condition: 'good'
  },
  {
    ownerEmail: 'nimal@gmail.com',
    title: 'Projector with Screen',
    description: 'Full HD projector with a 100 inch pull-down screen and HDMI cable.',
    category: 'electronics',
    pricePerDay: 2500,
    deposit: 10000,
    location: { city: 'Colombo', address: 'Rajagiriya' },
    condition: 'good'
  },
  {
    ownerEmail: 'nimal@gmail.com',
    title: 'Folding Party Tables (set of 4)',
    description: 'Four 6 ft folding tables, ideal for birthdays, almsgivings and events.',
    category: 'party',
    pricePerDay: 2000,
    deposit: 4000,
    location: { city: 'Colombo', address: 'Maharagama' },
    condition: 'good'
  },
  {
    ownerEmail: 'nimal@gmail.com',
    title: 'Camping Tent (4 person)',
    description: 'Waterproof dome tent for four people. Packs into a carry bag.',
    category: 'sports',
    pricePerDay: 1200,
    deposit: 4000,
    location: { city: 'Gampaha', address: 'Kadawatha' },
    condition: 'like-new'
  },
  {
    ownerEmail: 'nimal@gmail.com',
    title: 'Wet and Dry Vacuum Cleaner',
    description: '20 litre wet and dry vacuum with blower function and attachments.',
    category: 'appliances',
    pricePerDay: 1000,
    deposit: 3500,
    location: { city: 'Gampaha', address: 'Ja-Ela' },
    condition: 'fair'
  },
  {
    ownerEmail: 'ayesha@gmail.com',
    title: 'Stand Mixer',
    description: '5 litre stand mixer with whisk, dough hook and flat beater.',
    category: 'kitchen',
    pricePerDay: 900,
    deposit: 4000,
    location: { city: 'Kandy', address: 'Peradeniya' },
    condition: 'like-new'
  },
  {
    ownerEmail: 'ayesha@gmail.com',
    title: 'Large Rice Cooker (5 L)',
    description: 'Commercial size rice cooker that serves about 30 people.',
    category: 'kitchen',
    pricePerDay: 600,
    deposit: 2000,
    location: { city: 'Kandy', address: 'Katugastota' },
    condition: 'good'
  },
  {
    ownerEmail: 'ayesha@gmail.com',
    title: 'Bluetooth Party Speaker',
    description: 'Portable 100W speaker with lights and a wireless microphone.',
    category: 'electronics',
    pricePerDay: 1800,
    deposit: 6000,
    location: { city: 'Kandy', address: 'Kandy town' },
    condition: 'good'
  },
  {
    ownerEmail: 'ayesha@gmail.com',
    title: 'Baby Cot',
    description: 'Wooden baby cot with mattress. Can be taken apart for transport.',
    category: 'furniture',
    pricePerDay: 500,
    deposit: 3000,
    location: { city: 'Galle', address: 'Karapitiya' },
    condition: 'good'
  },
  {
    ownerEmail: 'ayesha@gmail.com',
    title: 'Mountain Bike',
    description: '21 speed mountain bike with a helmet and lock included.',
    category: 'sports',
    pricePerDay: 1000,
    deposit: 8000,
    location: { city: 'Galle', address: 'Unawatuna' },
    condition: 'fair'
  },
  {
    ownerEmail: 'ayesha@gmail.com',
    title: 'Portable Air Cooler',
    description: 'Evaporative air cooler with remote control and a 3 speed fan.',
    category: 'appliances',
    pricePerDay: 700,
    deposit: 3000,
    location: { city: 'Galle', address: 'Galle Fort' },
    condition: 'new',
    isAvailable: false
  }
];

/**
 * Deletes all data, then inserts the seed users and items.
 */
const seed = async () => {
  await connectDB();

  try {
    await Promise.all([
      Review.deleteMany({}),
      Rental.deleteMany({}),
      Item.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('Cleared users, items, rentals and reviews');

    // create() (not insertMany) runs the pre-save hook that hashes passwords
    const createdUsers = await User.create(
      users.map((user) => ({ ...user, password: SEED_PASSWORD }))
    );

    const ownerIds = {};
    createdUsers.forEach((user) => {
      ownerIds[user.email] = user._id;
    });

    const createdItems = await Item.insertMany(
      items.map(({ ownerEmail, ...item }) => ({
        ...item,
        images: [createSeedImage(item)],
        owner: ownerIds[ownerEmail]
      }))
    );

    console.log(`Inserted ${createdUsers.length} users and ${createdItems.length} items`);
    console.log(`Seed accounts (password: ${SEED_PASSWORD}):`);
    createdUsers.forEach((user) => console.log(`  ${user.role.padEnd(6)} ${user.email}`));
  } catch (error) {
    console.error(`Seed Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
