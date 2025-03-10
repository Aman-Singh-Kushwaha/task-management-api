import request from 'supertest';
import app from '../src/app';
import { signToken } from '../src/controllers/auth.controller';
import User from '../src/models/User.model';
import Task from '../src/models/Task.model';

describe('Task Routes', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123'
    });
    userId = user._id.toString();
    userToken = signToken(userId, 'user');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    adminId = admin._id.toString();
    adminToken = signToken(adminId, 'admin');
  });

  describe('POST /api/v1/tasks', () => {
    const validTask = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    };

    it('should create task with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', [`token=${userToken}`])
        .send(validTask);

      expect(res.status).toBe(201);
      expect(res.body.data.task).toHaveProperty('title', validTask.title);
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        {
          title: 'Task 1',
          description: 'Description 1',
          dueDate: new Date(Date.now() + 86400000),
          owner: userId
        },
        {
          title: 'Task 2',
          description: 'Description 2',
          dueDate: new Date(Date.now() + 86400000),
          owner: adminId
        }
      ]);
    });

    it('should get user specific tasks', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Cookie', [`token=${userToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(1);
    });

    it('should get all tasks for admin', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?page=1&limit=1')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(1);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });
  });
});