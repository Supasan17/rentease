/**
 * Item API Tests
 */

const request = require('supertest');
const { app, createUser, createItem } = require('./helpers');

describe('item CRUD', () => {
  it('lets an owner create an item, and anyone read it', async () => {
    const { token } = await createUser('owner');
    const created = await createItem(token);
    expect(created.status).toBe(201);

    const res = await request(app).get(`/api/items/${created.body.item._id}`);
    expect(res.status).toBe(200);
    expect(res.body.item.title).toBe('Cordless Drill');
  });

  it('does not let a renter create an item', async () => {
    const { token } = await createUser('renter');
    const res = await createItem(token);
    expect(res.status).toBe(403);
  });

  it('validates new items', async () => {
    const { token } = await createUser('owner');
    const res = await createItem(token, { title: '', pricePerDay: -5 });
    expect(res.status).toBe(400);
  });

  it('lets only the item owner update it', async () => {
    const owner = await createUser('owner');
    const other = await createUser('owner');
    const { body } = await createItem(owner.token);

    const denied = await request(app)
      .put(`/api/items/${body.item._id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ pricePerDay: 1 });
    expect(denied.status).toBe(403);

    const allowed = await request(app)
      .put(`/api/items/${body.item._id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ pricePerDay: 750 });
    expect(allowed.status).toBe(200);
    expect(allowed.body.item.pricePerDay).toBe(750);
  });

  it('lets the owner delete an item with no open rentals', async () => {
    const { token } = await createUser('owner');
    const { body } = await createItem(token);

    const res = await request(app).delete(`/api/items/${body.item._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const after = await request(app).get(`/api/items/${body.item._id}`);
    expect(after.status).toBe(404);
  });

  it('answers an invalid ID with a 400', async () => {
    const res = await request(app).get('/api/items/not-an-id');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/items search and filters', () => {
  beforeEach(async () => {
    const { token } = await createUser('owner');
    await createItem(token, { title: 'Camping Tent', category: 'sports', pricePerDay: 300 });
    await createItem(token, { title: 'Party Speaker', category: 'party', pricePerDay: 900 });
    await createItem(token, { title: 'Garden Tiller', category: 'tools', pricePerDay: 1500 });
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/items?category=party');
    expect(res.body.items.map((item) => item.title)).toEqual(['Party Speaker']);
  });

  it('filters by price range', async () => {
    const res = await request(app).get('/api/items?minPrice=500&maxPrice=1000');
    expect(res.body.items.map((item) => item.title)).toEqual(['Party Speaker']);
  });

  it('sorts by price and paginates', async () => {
    const res = await request(app).get('/api/items?sort=price_asc&limit=2&page=1');
    expect(res.body.items.map((item) => item.pricePerDay)).toEqual([300, 900]);
    expect(res.body.total).toBe(3);
    expect(res.body.pages).toBe(2);
  });
});
