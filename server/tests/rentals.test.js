/**
 * Rental and Review API Tests
 */

const request = require('supertest');
const { app, createUser, createItem, dateFromToday } = require('./helpers');

const auth = (req, token) => req.set('Authorization', `Bearer ${token}`);

const book = (token, itemId, from, to, extra = {}) =>
  auth(request(app).post('/api/rentals'), token).send({
    item: itemId,
    startDate: dateFromToday(from),
    endDate: dateFromToday(to),
    ...extra
  });

describe('rentals', () => {
  let owner;
  let renter;
  let item;

  beforeEach(async () => {
    owner = await createUser('owner');
    renter = await createUser('renter');
    item = (await createItem(owner.token)).body.item;
  });

  it('calculates the price on the server and ignores the request', async () => {
    const res = await book(renter.token, item._id, 1, 3, { totalPrice: 1 });
    expect(res.status).toBe(201);
    expect(res.body.rental.totalDays).toBe(3);
    expect(res.body.rental.totalPrice).toBe(3 * 500 + 1000);
  });

  it('rejects past dates and reversed dates', async () => {
    expect((await book(renter.token, item._id, -2, 1)).status).toBe(400);
    expect((await book(renter.token, item._id, 5, 2)).status).toBe(400);
  });

  it('rejects overlapping dates but allows others', async () => {
    await book(renter.token, item._id, 1, 5);
    const other = await createUser('renter');
    expect((await book(other.token, item._id, 4, 6)).status).toBe(409);
    expect((await book(other.token, item._id, 6, 8)).status).toBe(201);
  });

  it('frees the dates again after a cancellation', async () => {
    const { body } = await book(renter.token, item._id, 1, 5);
    await auth(request(app).patch(`/api/rentals/${body.rental._id}/cancel`), renter.token);
    expect((await book(renter.token, item._id, 1, 5)).status).toBe(201);
  });

  it('only lets the owner approve', async () => {
    const { body } = await book(renter.token, item._id, 1, 2);
    const denied = await auth(request(app).patch(`/api/rentals/${body.rental._id}/approve`), renter.token);
    expect(denied.status).toBe(403);

    const allowed = await auth(request(app).patch(`/api/rentals/${body.rental._id}/approve`), owner.token);
    expect(allowed.status).toBe(200);
    expect(allowed.body.rental.status).toBe('approved');
  });

  it('blocks status changes the workflow does not allow', async () => {
    const { body } = await book(renter.token, item._id, 1, 2);
    const early = await auth(request(app).patch(`/api/rentals/${body.rental._id}/return`), owner.token);
    expect(early.status).toBe(400);
  });

  it('does not let an owner delete an item with an open rental', async () => {
    await book(renter.token, item._id, 1, 2);
    const res = await auth(request(app).delete(`/api/items/${item._id}`), owner.token);
    expect(res.status).toBe(400);
  });

  it('allows one review after return and updates the rating', async () => {
    const { body } = await book(renter.token, item._id, 1, 2);
    const rentalId = body.rental._id;

    const early = await auth(request(app).post('/api/reviews'), renter.token).send({ rental: rentalId, rating: 5 });
    expect(early.status).toBe(400);

    await auth(request(app).patch(`/api/rentals/${rentalId}/approve`), owner.token);
    await auth(request(app).patch(`/api/rentals/${rentalId}/return`), owner.token);

    const review = await auth(request(app).post('/api/reviews'), renter.token).send({ rental: rentalId, rating: 4 });
    expect(review.status).toBe(201);

    const twice = await auth(request(app).post('/api/reviews'), renter.token).send({ rental: rentalId, rating: 1 });
    expect(twice.status).toBe(400);

    const { body: reviews } = await request(app).get(`/api/items/${item._id}/reviews`);
    expect(reviews.averageRating).toBe(4);
    expect(reviews.numReviews).toBe(1);

    const list = await auth(request(app).get('/api/rentals/my'), renter.token);
    expect(list.body.rentals[0].reviewed).toBe(true);
  });
});
