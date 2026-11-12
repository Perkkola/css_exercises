const express = require('express');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const jsYaml = require('js-yaml');
const fs = require('fs');
const { courseController, professorController } = require('./controllers');

const app = express();

app.use(require('cors')());
app.use(express.json());

// OpenAPI Documentation
const openApiDocument = jsYaml.safeLoad(
  fs.readFileSync('openapi.yaml', 'utf-8'),
);
const options = { explorer: true };
app.use('/api-docs', swaggerUi.serve,
  swaggerUi.setup(openApiDocument, options));

app.get('/api/health', (req, res) => {
  res.json({ message: 'OK' });
});

// Course Routes
app.get('/api/courses', courseController.getAllCourses);
app.get('/api/courses/:id', courseController.getCourseById);
app.post('/api/courses', courseController.createCourse);
app.put('/api/courses/:id', courseController.updateCourse);
app.delete('/api/courses/:id', courseController.deleteCourse);

// Professor Routes
app.get('/api/professors', professorController.getAllProfessors);
app.get('/api/professors/:id', professorController.getProfessorById);
app.post('/api/professors', professorController.createProfessor);
app.put('/api/professors/:id', professorController.updateProfessor);
app.delete('/api/professors/:id', professorController.deleteProfessor);
app.get('/api/professors/:id/courses', professorController.getProfessorCourses);
app.put('/api/professors/:id/courses/:courseId', professorController.assignCourse);
app.delete('/api/professors/:id/courses/:courseId', professorController.unassignCourse);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

module.exports = app;