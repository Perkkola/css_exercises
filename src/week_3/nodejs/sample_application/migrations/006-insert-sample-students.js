'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert sample students
    await queryInterface.bulkInsert('students', [
      {
        name: 'Tuomas',
        student_number: 12345,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Matti',
        student_number: 67890,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Charlie',
        student_number: 11111,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Diana',
        student_number: 22222,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Luis',
        student_number: 33333,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('students', null, {});
  }
};