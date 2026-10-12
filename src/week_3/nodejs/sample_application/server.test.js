const request = require('supertest');
require('dotenv').config();

// Mock console methods to reduce test noise
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

// Mock the database modules (simplified)
jest.mock('./utils/database/db', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
  },
  Sequelize: {
    DataTypes: {}
  }
}));

// Mock the Course, Student, and Professor models
jest.mock('./models', () => ({
  Course: {
    findAll: jest.fn()
  },
  Student: {
    findAll: jest.fn()
  },
  Professor: {
    findAll: jest.fn()
  }
}));

const { Course, Student, Professor } = require('./models');

// Import the app after mocking
delete require.cache[require.resolve('./server.js')];
const app = require('./server.js');

describe('Express Server with Sequelize (Simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('API Server Running');
    });
  });

  describe('GET /api/health', () => {
    it('should return simple health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
    });
  });

  describe('GET /api/courses', () => {
    it('should return courses from database', async () => {
      const mockCourses = [
        { 
          id: 1, 
          name: 'JavaScript Fundamentals', 
          description: 'Learn JS basics',
          tags: ['programming', 'web'],
          students: [],
          professor: { id: 1, name: 'Dr. Smith', email: 'smith@university.edu' }
        },
        { 
          id: 2, 
          name: 'Advanced React', 
          description: 'Master React concepts',
          tags: ['react', 'frontend'],
          students: [],
          professor: { id: 2, name: 'Dr. Johnson', email: 'johnson@university.edu' }
        }
      ];

      Course.findAll.mockResolvedValue(mockCourses);

      const response = await request(app).get('/api/courses');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(Course.findAll).toHaveBeenCalledWith({
        include: [
          { model: Student, as: 'students' },
          { model: Professor, as: 'professor' }
        ]
      });
    });

    it('should handle database errors gracefully', async () => {
      Course.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/courses');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch courses');
    });
  });

  describe('GET /api/students', () => {
    it('should return students from database', async () => {
      const mockStudents = [
        { 
          id: 1, 
          name: 'John Doe', 
          student_number: 12345,
          courses: []
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          student_number: 67890,
          courses: []
        }
      ];

      Student.findAll.mockResolvedValue(mockStudents);

      const response = await request(app).get('/api/students');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(Student.findAll).toHaveBeenCalledWith({
        include: [{ model: Course, as: 'courses' }]
      });
    });

    it('should handle database errors gracefully', async () => {
      Student.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/students');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch students');
    });
  });

  describe('GET /api/professors', () => {
    it('should return professors from database', async () => {
      const mockProfessors = [
        { 
          id: 1, 
          name: 'Dr. Smith', 
          email: 'smith@university.edu',
          courses: [
            { id: 1, name: 'JavaScript Fundamentals' }
          ]
        },
        { 
          id: 2, 
          name: 'Dr. Johnson', 
          email: 'johnson@university.edu',
          courses: [
            { id: 2, name: 'Advanced React' }
          ]
        }
      ];

      Professor.findAll.mockResolvedValue(mockProfessors);

      const response = await request(app).get('/api/professors');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(Professor.findAll).toHaveBeenCalledWith({
        include: [{ model: Course, as: 'courses' }]
      });
    });

    it('should handle database errors gracefully', async () => {
      Professor.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/professors');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch professors');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body.message).toContain('/non-existent-route');
    });
  });

  describe('POST requests', () => {
    it('should return 404 for POST requests to root (no POST handler exists)', async () => {
      const response = await request(app)
        .post('/')
        .send({ test: 'data' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});

// Export app for potential use in other test files
module.exports = app;