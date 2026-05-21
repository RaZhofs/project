const sequelize = require('../config/database');

const Rol            = require('./Rol.model');
const Usuario        = require('./Usuario.model');
const Administrador  = require('./Administrador.model');
const TipoEvento     = require('./TipoEvento.model');
const Evento         = require('./Evento.model');
const Tarea          = require('./Tarea.model');

// ROLES → USUARIOS
Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

// USUARIOS → ADMINISTRADORES
Usuario.hasOne(Administrador, { foreignKey: 'id_usuario' });
Administrador.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// ADMINISTRADORES → EVENTOS
Administrador.hasMany(Evento, { foreignKey: 'id_administrador' });
Evento.belongsTo(Administrador, { foreignKey: 'id_administrador' });

// TIPOS_EVENTO → EVENTOS
TipoEvento.hasMany(Evento, { foreignKey: 'id_tipo' });
Evento.belongsTo(TipoEvento, { foreignKey: 'id_tipo' });

// EVENTOS → TAREAS
Evento.hasMany(Tarea, { foreignKey: 'id_evento' });
Tarea.belongsTo(Evento, { foreignKey: 'id_evento' });

module.exports = {
  sequelize,
  Rol,
  Usuario,
  Administrador,
  TipoEvento,
  Evento,
  Tarea,
};
