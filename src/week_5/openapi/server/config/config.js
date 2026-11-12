require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'myappdb',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false
};

// Export single config for application use
module.exports = dbConfig;