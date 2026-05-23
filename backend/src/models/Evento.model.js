const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ESTADOS_EVENTO = ['Planificación', 'Montaje', 'Ejecución', 'Finalizado', 'Cancelado'];
const MODALIDADES    = ['Desde cero', 'Express'];

const Evento = sequelize.define('EVENTOS', {
  id_evento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_administrador: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_tipo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre_evento: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_termino: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  aforo_maximo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  estado_evento: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Planificación',
    validate: { isIn: [ESTADOS_EVENTO] },
  },
  modalidad_evento: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Desde cero',
    validate: { isIn: [MODALIDADES] },
  },
  ubicacion_texto: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  codigo_acceso: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  creado_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Evento;
