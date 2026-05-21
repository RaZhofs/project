const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoEvento = sequelize.define('TIPOS_EVENTO', {
  id_tipo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
});

module.exports = TipoEvento;
