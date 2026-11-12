const Sequelize = require('sequelize');
const Umzug = require('umzug');
const config = require('../../config/config');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging
  }
);

// Migration configuration
const migrationConf = {
  migrations: {
    glob: 'migrations/*.js',
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize,
    tableName: 'migrations'
  },
  context: sequelize.getQueryInterface(),
  logger: console,
};

// Run all pending migrations
const runMigrations = async () => {
  const migrator = new Umzug(migrationConf);
  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

// Connect to database with automatic migrations
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    await runMigrations();
    console.log('Connected to the database');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  }
};

// Simple database connection (without migrations)
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Close database connection
const disconnectDatabase = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

module.exports = { 
  sequelize,
  connectToDatabase, 
  connectDatabase,
  disconnectDatabase
};