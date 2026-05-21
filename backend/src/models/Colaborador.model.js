const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Colaborador = sequelize.define('COLABORADORES', {
  id_colaborador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre_completo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  correo_empresa: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
});

module.exports = Colaborador;
