const { Professor, Course, Student } = require('../models');

const professorController = {
  getAllProfessors: async (req, res) => {
    try {
      const professors = await Professor.findAll({
        include: [{ model: Course, as: 'courses' }]
      });
      res.json(professors);
    } catch (error) {
      console.error('Error fetching professors:', error);
      res.status(500).json({ error: 'Failed to fetch professors' });
    }
  },

  getProfessorById: async (req, res) => {
    try {
      const { id } = req.params;
      const professor = await Professor.findByPk(id, {
        include: [{
          model: Course,
          as: 'courses',
          include: [{ model: Student, as: 'students' }]
        }]
      });

      if (!professor) {
        return res.status(404).json({ error: 'Professor not found' });
      }

      res.json(professor);
    } catch (error) {
      console.error('Error fetching professor:', error);
      res.status(500).json({ error: 'Failed to fetch professor' });
    }
  },

  createProfessor: async (req, res) => {
    try {
      const { name, email } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({
          error: 'Name and email are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      // Check if email already exists
      const existingProfessor = await Professor.findOne({
        where: { email }
      });
      if (existingProfessor) {
        return res.status(400).json({
          error: 'Email already exists'
        });
      }

      const professor = await Professor.create({
        name,
        email
      });

      // Fetch the created professor with relationships
      const createdProfessor = await Professor.findByPk(professor.id, {
        include: [{ model: Course, as: 'courses' }]
      });

      res.status(201).json(createdProfessor);
    } catch (error) {
      console.error('Error creating professor:', error);
      res.status(500).json({ error: 'Failed to create professor' });
    }
  },

  updateProfessor: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const professor = await Professor.findByPk(id);
      if (!professor) {
        return res.status(404).json({ error: 'Professor not found' });
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            error: 'Invalid email format'
          });
        }

        // Check if email already exists (but not for current professor)
        if (email !== professor.email) {
          const existingProfessor = await Professor.findOne({
            where: { email }
          });
          if (existingProfessor) {
            return res.status(400).json({
              error: 'Email already exists'
            });
          }
        }
      }

      await professor.update({
        name: name || professor.name,
        email: email || professor.email
      });

      // Fetch updated professor with relationships
      const updatedProfessor = await Professor.findByPk(id, {
        include: [{ model: Course, as: 'courses' }]
      });

      res.json(updatedProfessor);
    } catch (error) {
      console.error('Error updating professor:', error);
      res.status(500).json({ error: 'Failed to update professor' });
    }
  },

  deleteProfessor: async (req, res) => {
    try {
      const { id } = req.params;

      const professor = await Professor.findByPk(id);
      if (!professor) {
        return res.status(404).json({ error: 'Professor not found' });
      }

      // Check if professor has assigned courses
      const courses = await Course.findAll({
        where: { professor_id: id }
      });

      if (courses.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete professor with assigned courses. Please reassign or delete courses first.'
        });
      }

      await professor.destroy();
      res.json({ message: 'Professor deleted successfully' });
    } catch (error) {
      console.error('Error deleting professor:', error);
      res.status(500).json({ error: 'Failed to delete professor' });
    }
  },

  // Get courses taught by a specific professor
  getProfessorCourses: async (req, res) => {
    try {
      const { id } = req.params;

      const professor = await Professor.findByPk(id, {
        include: [{
          model: Course,
          as: 'courses',
        }]
      });

      if (!professor) {
        return res.status(404).json({ error: 'Professor not found' });
      }

      res.json(professor.courses);
    } catch (error) {
      console.error('Error fetching professor courses:', error);
      res.status(500).json({ error: 'Failed to fetch professor courses' });
    }
  },

  // Assign course to professor
  assignCourse: async (req, res) => {
    try {
      const { id, courseId } = req.params;

      const professor = await Professor.findByPk(id);
      const course = await Course.findByPk(courseId);

      if (!professor) {
        return res.status(404).json({ error: 'Professor not found' });
      }
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Update course to assign this professor
      await course.update({ professor_id: id });

      // Return updated professor with courses
      const updatedProfessor = await Professor.findByPk(id, {
        include: [{ model: Course, as: 'courses' }]
      });

      res.json(updatedProfessor);
    } catch (error) {
      console.error('Error assigning course to professor:', error);
      res.status(500).json({ error: 'Failed to assign course to professor' });
    }
  },

  // Unassign course from professor
  unassignCourse: async (req, res) => {
    try {
      const { id, courseId } = req.params;

      const professor = await Professor.findByPk(id);
      const course = await Course.findByPk(courseId);

      if (!professor) {
        return res.status(404).json({ error: 'Professor not found' });
      }
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Check if course is actually assigned to this professor
      if (course.professor_id !== parseInt(id)) {
        return res.status(400).json({
          error: 'Course is not assigned to this professor'
        });
      }

      // Update course to remove professor assignment
      await course.update({ professor_id: null });

      // Return updated professor with courses
      const updatedProfessor = await Professor.findByPk(id, {
        include: [{ model: Course, as: 'courses' }]
      });

      res.json(updatedProfessor);
    } catch (error) {
      console.error('Error unassigning course from professor:', error);
      res.status(500).json({ error: 'Failed to unassign course from professor' });
    }
  }
};

module.exports = professorController;