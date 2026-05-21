const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  null,
  null,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 1433,
    dialect: 'mssql',
    logging: false,
    define: {
      timestamps: false,
      freezeTableName: true,
    },
    dialectOptions: {
      authentication: {
        type: 'default',
        options: { trustedConnection: true },
      },
      options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE || undefined,
      },
    },
  }
);

module.exports = sequelize;
