'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert sample professors
    await queryInterface.bulkInsert('professors', [
      {
        name: 'Mario Di Francesco',
        email: 'mario.di.francesco@aalto.fi',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Arto Hellas',
        email: 'arto.hellas@aalto.fi',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bo Zhao',
        email: 'bo.zhao@aalto.fi',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Linh Truong',
        email: 'linh.truong@aalto.fi',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('professors', null, {});
  }
};