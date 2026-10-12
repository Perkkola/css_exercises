const { sequelize } = require('../utils/database/db');
const { Model, DataTypes } = require('sequelize');

class Professor extends Model {}

Professor.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    unique: true
  }
}, {
  sequelize,
  tableName: 'professors',
  underscored: true,
  timestamps: true,
  modelName: 'Professor'
});

module.exports = Professor;