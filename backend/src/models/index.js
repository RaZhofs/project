const sequelize = require('../config/database');

const Rol                 = require('./Rol.model');
const Usuario             = require('./Usuario.model');
const Administrador       = require('./Administrador.model');
const Colaborador         = require('./Colaborador.model');
const EquipoColaboradores = require('./EquipoColaboradores.model');
const TipoEvento          = require('./TipoEvento.model');
const Evento              = require('./Evento.model');
const Tarea               = require('./Tarea.model');

// ── ROLES → USUARIOS ──────────────────────────────────────────────────────
Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

// ── USUARIOS → ADMINISTRADORES ────────────────────────────────────────────
Usuario.hasOne(Administrador, { foreignKey: 'id_usuario' });
Administrador.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// ── USUARIOS → COLABORADORES ──────────────────────────────────────────────
Usuario.hasOne(Colaborador, { foreignKey: 'id_usuario' });
Colaborador.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// ── TIPOS_EVENTO → EVENTOS ────────────────────────────────────────────────
TipoEvento.hasMany(Evento, { foreignKey: 'id_tipo' });
Evento.belongsTo(TipoEvento, { foreignKey: 'id_tipo' });

// ── ADMINISTRADORES → EVENTOS ─────────────────────────────────────────────
Administrador.hasMany(Evento, { foreignKey: 'id_administrador' });
Evento.belongsTo(Administrador, { foreignKey: 'id_administrador' });

// ── EVENTOS ↔ COLABORADORES (pivot EQUIPO_COLABORADORES) ──────────────────
Evento.belongsToMany(Colaborador, {
  through: EquipoColaboradores,
  foreignKey: 'id_evento',
  otherKey:   'id_colaborador',
});
Colaborador.belongsToMany(Evento, {
  through: EquipoColaboradores,
  foreignKey: 'id_colaborador',
  otherKey:   'id_evento',
});

// Asociaciones directas en la tabla pivot para poder hacer include desde EquipoColaboradores
EquipoColaboradores.belongsTo(Colaborador, { foreignKey: 'id_colaborador', as: 'COLABORADORES' });
EquipoColaboradores.belongsTo(Evento,      { foreignKey: 'id_evento',      as: 'EVENTO' });

// ── EVENTOS → TAREAS ──────────────────────────────────────────────────────
Evento.hasMany(Tarea, { foreignKey: 'id_evento' });
Tarea.belongsTo(Evento, { foreignKey: 'id_evento' });

// ── COLABORADORES → TAREAS ────────────────────────────────────────────────
Colaborador.hasMany(Tarea, { foreignKey: 'id_responsable' });
Tarea.belongsTo(Colaborador, { foreignKey: 'id_responsable', as: 'Responsable' });

module.exports = {
  sequelize,
  Rol,
  Usuario,
  Administrador,
  Colaborador,
  EquipoColaboradores,
  TipoEvento,
  Evento,
  Tarea,
};
