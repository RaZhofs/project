const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TIPOS    = ['Ingreso', 'Egreso'];
const ESTADOS  = ['Pendiente', 'Aprobado', 'Ejecutado'];
const CATEGORIAS = [
  'Infraestructura', 'Marketing', 'Personal',
  'Catering', 'Tecnología', 'Logística', 'Otros',
];

const PresupuestoItem = sequelize.define('PRESUPUESTO_ITEMS', {
  id_item: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { isIn: [CATEGORIAS] },
  },
  tipo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'Egreso',
    validate: { isIn: [TIPOS] },
  },
  monto_estimado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  monto_real: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: { isIn: [ESTADOS] },
  },
});

module.exports = PresupuestoItem;
