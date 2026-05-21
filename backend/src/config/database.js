const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    dialect: 'mssql',
    logging: false,
    define: {
      timestamps: false,
      freezeTableName: true,
    },
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE || undefined,
      },
    },
  }
);

module.exports = sequelize;
