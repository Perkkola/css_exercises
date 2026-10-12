const Course = require('./course');
const Student = require('./student');
const Professor = require('./professor');

// Set up associations
Professor.hasMany(Course, { 
  foreignKey: 'professor_id',
  as: 'courses'
});

Course.belongsTo(Professor, { 
  foreignKey: 'professor_id',
  as: 'professor'
});

Course.belongsToMany(Student, { 
  through: 'course_students', 
  as: 'students',
  foreignKey: 'courseId',
  otherKey: 'studentId'
});

Student.belongsToMany(Course, { 
  through: 'course_students', 
  as: 'courses',
  foreignKey: 'studentId', 
  otherKey: 'courseId'
});

module.exports = {
  Course,
  Student,
  Professor,
};