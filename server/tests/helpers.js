/**
 * Test Helpers
 *
 * Small shortcuts for creating users and items through the API.
 */

const request = require('supertest');
const app = require('../server');

let counter = 0;

/**
 * Registers a user and returns their token and profile.
 */
const createUser = async (role = 'renter') => {
  counter += 1;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: `Test ${role}`, email: `${role}${counter}@test.com`, password: 'secret123', role });
  return { token: res.body.token, user: res.body.user };
};

/**
 * Creates an item as the given owner and returns the response.
 */
const createItem = (token, overrides = {}) =>
  request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Cordless Drill',
      description: 'A strong cordless drill with two batteries.',
      category: 'tools',
      pricePerDay: 500,
      deposit: 1000,
      location: { city: 'Galle', address: 'Main Street' },
      condition: 'good',
      ...overrides
    });

/**
 * Returns the date `days` from today as 'YYYY-MM-DD'.
 */
const dateFromToday = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-CA');
};

module.exports = { app, createUser, createItem, dateFromToday };
