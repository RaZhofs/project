const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RestriccionInvitado = sequelize.define('RESTRICCIONES_INVITADO', {
  id_restriccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_rsvp:     { type: DataTypes.INTEGER,      allowNull: false },
  tipo:        {
    type: DataTypes.STRING(30),
    allowNull: false,
    validate: { isIn: [['Alergia', 'Movilidad', 'Dieta']] },
  },
  descripcion: { type: DataTypes.TEXT,         allowNull: true  },
}, { freezeTableName: true, timestamps: false });

module.exports = RestriccionInvitado;
