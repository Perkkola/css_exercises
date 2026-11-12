const request = require('supertest');
require('dotenv').config();

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

jest.mock('./utils/database/db', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
  },
  Sequelize: {
    DataTypes: {}
  }
}));

// Enhanced mocks for Sequelize models
jest.mock('./models', () => {
  return {
    Course: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    },
    Professor: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    }
  };
});

const { Course, Professor } = require('./models');

delete require.cache[require.resolve('./server.js')];
const app = require('./server.js');

describe('University Management API - Complete Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Health Endpoints', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'API Server Running');
    });

    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
    });
  });

  describe('Course Management', () => {
    describe('GET /api/courses', () => {
      it('should return all courses', async () => {
        const mockCourses = [
          {
            id: 1,
            name: 'Web Development',
            description: 'Learn web development',
            tags: ['web', 'javascript'],
            professor: { id: 1, name: 'John Doe', email: 'john@test.com' }
          }
        ];

        Course.findAll.mockResolvedValue(mockCourses);

        const response = await request(app).get('/api/courses');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('name', 'Web Development');
      });

      it('should handle database errors', async () => {
        Course.findAll.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/api/courses');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Failed to fetch courses');
      });
    });

    describe('GET /api/courses/:id', () => {
      it('should return a single course', async () => {
        const mockCourse = {
          id: 1,
          name: 'Web Development',
          description: 'Learn web development',
          professor: null
        };

        Course.findByPk.mockResolvedValue(mockCourse);

        const response = await request(app).get('/api/courses/1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', 'Web Development');
      });

      it('should return 404 for non-existent course', async () => {
        Course.findByPk.mockResolvedValue(null);

        const response = await request(app).get('/api/courses/999');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Course not found');
      });
    });

    describe('POST /api/courses', () => {
      it('should create a new course', async () => {
        const courseData = {
          name: 'New Course',
          description: 'Course description',
          tags: ['test']
        };

        const mockCreatedCourse = { id: 1, ...courseData };
        const mockCourseWithRelations = {
          ...mockCreatedCourse,
          professor: null
        };

        Course.create.mockResolvedValue(mockCreatedCourse);
        Course.findByPk.mockResolvedValue(mockCourseWithRelations);

        const response = await request(app)
          .post('/api/courses')
          .send(courseData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('name', 'New Course');
      });

      it('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/courses')
          .send({ name: 'Test Course' }); // missing description

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Name and description are required');
      });

      it('should validate professor exists when professor_id provided', async () => {
        Professor.findByPk.mockResolvedValue(null);

        const response = await request(app)
          .post('/api/courses')
          .send({
            name: 'Test Course',
            description: 'Test Description',
            professor_id: 999
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Professor not found');
      });
    });
  });

  describe('Professor Management', () => {
    describe('GET /api/professors', () => {
      it('should return all professors', async () => {
        const mockProfessors = [
          {
            id: 1,
            name: 'Dr. Smith',
            email: 'smith@university.edu',
            courses: []
          }
        ];

        Professor.findAll.mockResolvedValue(mockProfessors);

        const response = await request(app).get('/api/professors');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('name', 'Dr. Smith');
      });

      it('should handle database errors', async () => {
        Professor.findAll.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/api/professors');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Failed to fetch professors');
      });
    });

    describe('GET /api/professors/:id', () => {
      it('should return a single professor', async () => {
        const mockProfessor = {
          id: 1,
          name: 'Dr. Smith',
          email: 'smith@university.edu',
          courses: []
        };

        Professor.findByPk.mockResolvedValue(mockProfessor);

        const response = await request(app).get('/api/professors/1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', 'Dr. Smith');
      });

      it('should return 404 for non-existent professor', async () => {
        Professor.findByPk.mockResolvedValue(null);

        const response = await request(app).get('/api/professors/999');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Professor not found');
      });
    });

    describe('POST /api/professors', () => {
      it('should validate email format', async () => {
        const response = await request(app)
          .post('/api/professors')
          .send({
            name: 'Test Professor',
            email: 'invalid-email'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should require name and email', async () => {
        const response = await request(app)
          .post('/api/professors')
          .send({ name: 'Test Professor' }); // missing email

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Name and email are required');
      });
    });

    describe('DELETE /api/professors/:id', () => {
      it('should prevent deletion of professors with courses', async () => {
        const mockProfessor = { id: 1 };
        const mockCourses = [{ id: 1, name: 'Test Course' }];

        Professor.findByPk.mockResolvedValue(mockProfessor);
        Course.findAll.mockResolvedValue(mockCourses);

        const response = await request(app).delete('/api/professors/1');

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Cannot delete professor with assigned courses');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/courses')
        .type('json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });
  });

  describe('Integration Tests - Relationships', () => {

    it('should handle professor course assignment', async () => {
      const mockProfessor = { id: 1, name: 'Test Professor' };
      const mockCourse = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      Professor.findByPk.mockResolvedValue(mockProfessor);
      Course.findByPk.mockResolvedValue(mockCourse);

      const response = await request(app).put('/api/professors/1/courses/1');

      expect(response.status).toBe(200);
      expect(mockCourse.update).toHaveBeenCalledWith({ professor_id: '1' });
    });
  });

  describe('Data Validation', () => {
    it('should validate course creation with invalid professor', async () => {
      Professor.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/courses')
        .send({
          name: 'Test Course',
          description: 'Test Description',
          professor_id: 999
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Professor not found');
    });
  });
});

module.exports = app;