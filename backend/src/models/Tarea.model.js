const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PRIORIDADES   = ['Alta', 'Media', 'Baja'];
const ESTADOS_TAREA = ['Pendiente', 'En Proceso', 'Completada'];

const Tarea = sequelize.define('TAREAS', {
  id_tarea: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // FK a COLABORADORES se agrega en Fase 2
  id_responsable: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prioridad: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'Media',
    validate: { isIn: [PRIORIDADES] },
  },
  estado_tarea: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: { isIn: [ESTADOS_TAREA] },
  },
  fecha_limite: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_completado: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Tarea;
