const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrador = sequelize.define('ADMINISTRADORES', {
  id_administrador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

module.exports = Administrador;
