'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert sample courses
    await queryInterface.bulkInsert('courses', [
      {
        name: 'Web Software Development',
        description: 'Client-side web applications and server-side web applications',
        tags: JSON.stringify(['programming', 'web', 'javascript', 'frontend']),
        professor_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cloud Software and Systems D',
        description: 'Cloud computing and its delivery models, manage the resources offered by cloud platforms, write software leveraging modern cloud technologies and tools.',
        tags: JSON.stringify(['cloud', 'devops', 'infrastructure', 'containers']),
        professor_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Big Data Platforms D',
        description: 'Big data and platforms w.r.t. services, stakeholders, interactions and state-of-the-art technologies, key interactions and performance design patterns in big data platforms.',
        tags: JSON.stringify(['big data', 'data platforms']),
        professor_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Scalable Systems and Data Management D',
        description: 'Design and implement scalable systems and data management solutions, understand the principles of distributed systems, data storage, and retrieval in large-scale environments.',
        tags: JSON.stringify(['distributed systems', 'data management', 'scalability']),
        professor_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('courses', null, {});
  }
};