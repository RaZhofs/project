const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvitadoRsvp = sequelize.define('INVITADOS_RSVP', {
  id_rsvp: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_evento:       { type: DataTypes.INTEGER,      allowNull: false },
  nombre_invitado: { type: DataTypes.STRING(100),   allowNull: false },
  correo:          { type: DataTypes.STRING(150),   allowNull: false },
  telefono:        { type: DataTypes.STRING(30),    allowNull: true  },
  codigo_de_barra: { type: DataTypes.STRING(100),   allowNull: true  },
  estado_invitado: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Confirmado',
    validate: { isIn: [['Confirmado', 'Rechazado', 'Invitado', 'Ingresado']] },
  },
  fecha_registro:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_ingreso:   { type: DataTypes.DATE, allowNull: true  },
});

module.exports = InvitadoRsvp;
