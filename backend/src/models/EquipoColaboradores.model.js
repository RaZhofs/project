const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipoColaboradores = sequelize.define('EQUIPO_COLABORADORES', {
  id_evento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  id_colaborador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  permiso_nivel: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Lectura',
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = EquipoColaboradores;
