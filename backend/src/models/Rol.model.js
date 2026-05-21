const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('ROLES', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

module.exports = Rol;
