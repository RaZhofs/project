const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TIPOS = ['Nota', 'Avance', 'Alerta', 'Incidencia'];

const Bitacora = sequelize.define('BITACORA', {
  id_entrada: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  autor_nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  autor_rol: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  tipo_entrada: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Nota',
    validate: { isIn: [TIPOS] },
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fecha_entrada: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Bitacora;
