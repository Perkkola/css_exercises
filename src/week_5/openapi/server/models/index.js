const Course = require('./course');
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

module.exports = {
  Course,
  Professor,
};