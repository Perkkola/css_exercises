const { Course, Professor } = require('../models');

const courseController = {
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.findAll();
      res.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(id);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  },

  createCourse: async (req, res) => {
    try {
      const { name, description, tags, professor_id } = req.body;

      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({
          error: 'Name and description are required'
        });
      }

      // Check if professor exists if professor_id is provided
      if (professor_id) {
        const professor = await Professor.findByPk(professor_id);
        if (!professor) {
          return res.status(400).json({ error: 'Professor not found' });
        }
      }

      const course = await Course.create({
        name,
        description,
        tags: tags || [],
        professor_id
      });

      // Fetch the created course with relationships
      const createdCourse = await Course.findByPk(course.id);

      res.status(201).json(createdCourse);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  },

  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, tags, professor_id } = req.body;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Check if professor exists if professor_id is provided
      if (professor_id) {
        const professor = await Professor.findByPk(professor_id);
        if (!professor) {
          return res.status(422).json({ error: 'Professor not found' });
        }
      }

      await course.update({
        name: name || course.name,
        description: description || course.description,
        tags: tags !== undefined ? tags : course.tags,
        professor_id: professor_id !== undefined ? professor_id : course.professor_id
      });

      // Fetch updated course with relationships
      const updatedCourse = await Course.findByPk(id);

      res.json(updatedCourse);
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ error: 'Failed to update course' });
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      await course.destroy();
      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  },
};

module.exports = courseController;