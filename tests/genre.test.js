const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const Genre = require('../src/models/genreModel');
const User = require('../src/models/userModel');

describe('Genre API Tests', () => {
  let adminUser;
  let adminToken;
  let testGenre;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test_db';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await Genre.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await Genre.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Password123',
      role: 'admin'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(adminData);

    adminUser = response.body.data.user;
    adminToken = response.body.data.token;
  });

  describe('POST /api/genres', () => {
    it('should create a new genre successfully (admin only)', async () => {
      const genreData = {
        title: 'Test Genre',
        description: 'This is a test genre description for testing purposes.'
      };

      const response = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(genreData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(genreData.title);
      expect(response.body.data.description).toBe(genreData.description);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('slug');
      expect(response.body.data.isActive).toBe(true);
    });

    it('should return error for non-admin user', async () => {
      // Create regular user
      const userData = {
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        password: 'Password123'
      };

      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const userToken = userResponse.body.data.token;

      const genreData = {
        title: 'Test Genre',
        description: 'This is a test genre description.'
      };

      const response = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${userToken}`)
        .send(genreData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        title: 'T', // Too short
        description: 'Short' // Too short
      };

      const response = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/genres/active', () => {
    beforeEach(async () => {
      // Create test genres
      const genres = [
        {
          title: 'Active Genre 1',
          description: 'First active genre',
          isActive: true
        },
        {
          title: 'Active Genre 2',
          description: 'Second active genre',
          isActive: true
        },
        {
          title: 'Inactive Genre',
          description: 'Inactive genre',
          isActive: false
        }
      ];

      for (const genre of genres) {
        await request(app)
          .post('/api/genres')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(genre);
      }
    });

    it('should get only active genres (public)', async () => {
      const response = await request(app)
        .get('/api/genres/active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(genre => genre.isActive)).toBe(true);
    });
  });

  describe('GET /api/genres', () => {
    beforeEach(async () => {
      // Create test genres
      const genres = [
        { title: 'Genre 1', description: 'First genre' },
        { title: 'Genre 2', description: 'Second genre' },
        { title: 'Genre 3', description: 'Third genre' }
      ];

      for (const genre of genres) {
        await request(app)
          .post('/api/genres')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(genre);
      }
    });

    it('should get all genres with pagination (admin only)', async () => {
      const response = await request(app)
        .get('/api/genres?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.genres).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });
  });

  describe('PUT /api/genres/:id', () => {
    beforeEach(async () => {
      // Create a test genre
      const genreData = {
        title: 'Original Title',
        description: 'Original description'
      };

      const response = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(genreData);

      testGenre = response.body.data;
    });

    it('should update genre successfully (admin only)', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/genres/${testGenre._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    });
  });

  describe('DELETE /api/genres/:id', () => {
    beforeEach(async () => {
      // Create a test genre
      const genreData = {
        title: 'Genre to Delete',
        description: 'This genre will be deleted'
      };

      const response = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(genreData);

      testGenre = response.body.data;
    });

    it('should delete genre successfully (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/genres/${testGenre._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });
  });

  describe('PATCH /api/genres/:id/toggle', () => {
    beforeEach(async () => {
      // Create a test genre
      const genreData = {
        title: 'Toggle Genre',
        description: 'This genre will be toggled'
      };

      const response = await request(app)
        .post('/api/genres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(genreData);

      testGenre = response.body.data;
    });

    it('should toggle genre status successfully (admin only)', async () => {
      const response = await request(app)
        .patch(`/api/genres/${testGenre._id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });
  });
}); 