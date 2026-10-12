const { sequelize } = require('../utils/database/db');
const { Model, DataTypes } = require('sequelize');

class Student extends Model {}

Student.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  student_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'students',
  underscored: true,
  timestamps: true,
  modelName: 'Student'
});

module.exports = Student;