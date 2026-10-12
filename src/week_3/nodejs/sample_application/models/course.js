const { sequelize } = require('../utils/database/db');
const { DataTypes, Model } = require('sequelize');

class Course extends Model {}

Course.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  sequelize,
  tableName: 'courses',
  underscored: true,
  timestamps: true,
  modelName: 'Course'
});

module.exports = Course;