const express = require('express');
require('dotenv').config();
const { Course, Student, Professor } = require('./models');

const app = express();

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API Server Running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: Student, as: 'students' },
        { model: Professor, as: 'professor' }
      ]
    });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/professors', async (req, res) => {
  try {
    const professors = await Professor.findAll({
      include: [{ model: Course, as: 'courses' }]
    });
    res.json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    res.status(500).json({ error: 'Failed to fetch professors' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [{ model: Course, as: 'courses' }]
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

module.exports = app;