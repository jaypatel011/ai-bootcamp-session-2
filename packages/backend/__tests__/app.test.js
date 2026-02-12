const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (data = { name: 'Temp Item' }) => {
  const itemData = {
    name: data.name || 'Temp Item',
    description: data.description || '',
    due_date: data.due_date || null,
    priority: data.priority || 'medium'
  };
  
  const response = await request(app)
    .post('/api/items')
    .send(itemData)
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('due_date');
      expect(item).toHaveProperty('priority');
      expect(item).toHaveProperty('completed');
      expect(item).toHaveProperty('created_at');
    });

    it('should filter items by priority', async () => {
      const response = await request(app).get('/api/items?filter=high');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(item => {
        expect(item.priority).toBe('high');
      });
    });

    it('should filter items by completion status', async () => {
      const response = await request(app).get('/api/items?completed=false');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(item => {
        expect(item.completed).toBe(0);
      });
    });

    it('should sort items by priority', async () => {
      const response = await request(app).get('/api/items?sort=priority');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item with all fields', async () => {
      const newItem = {
        name: 'Test Item',
        description: 'Test description',
        due_date: '2026-03-15',
        priority: 'high'
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.description).toBe(newItem.description);
      expect(response.body.due_date).toBe(newItem.due_date);
      expect(response.body.priority).toBe(newItem.priority);
      expect(response.body.completed).toBe(0);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should create item with defaults when optional fields missing', async () => {
      const newItem = { name: 'Simple Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.description).toBe('');
      expect(response.body.priority).toBe('medium');
      expect(response.body.completed).toBe(0);
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test', priority: 'invalid' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Priority must be low, medium, or high');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const item = await createItem({ name: 'Original Name' });

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        due_date: '2026-04-01',
        priority: 'low'
      };

      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send(updateData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.due_date).toBe(updateData.due_date);
      expect(response.body.priority).toBe(updateData.priority);
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ name: 'Test' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 if name is missing', async () => {
      const item = await createItem({ name: 'Test Item' });

      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ description: 'No name' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('PATCH /api/items/:id/toggle', () => {
    it('should toggle item completion status', async () => {
      const item = await createItem({ name: 'Toggle Test' });
      expect(item.completed).toBe(0);

      // Toggle to completed
      const response1 = await request(app)
        .patch(`/api/items/${item.id}/toggle`);

      expect(response1.status).toBe(200);
      expect(response1.body.completed).toBe(1);

      // Toggle back to incomplete
      const response2 = await request(app)
        .patch(`/api/items/${item.id}/toggle`);

      expect(response2.status).toBe(200);
      expect(response2.body.completed).toBe(0);
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app)
        .patch('/api/items/999999/toggle');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .patch('/api/items/abc/toggle');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem({ name: 'Item To Be Deleted' });

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });
});