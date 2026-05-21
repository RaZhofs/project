const { Evento, Colaborador, EquipoColaboradores, Tarea, TipoEvento, Administrador } = require('../models');

// ── EQUIPO ────────────────────────────────────────────────────────────────

// GET /api/v1/eventos/:id/equipo
async function getEquipo(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ ok: false, message: 'Evento no encontrado' });

    const equipo = await EquipoColaboradores.findAll({
      where: { id_evento: req.params.id },
      include: [{
        model: Colaborador,
        as:    'COLABORADORES',
        attributes: ['id_colaborador', 'nombre_completo', 'correo_empresa', 'telefono'],
      }],
    });
    res.json({ ok: true, data: equipo });
  } catch (err) { next(err); }
}

// POST /api/v1/eventos/:id/equipo  { id_colaborador, permiso_nivel }
async function asignarColaborador(req, res, next) {
  try {
    const { id_colaborador, permiso_nivel = 'Lectura' } = req.body;
    const [asignacion, created] = await EquipoColaboradores.findOrCreate({
      where: { id_evento: req.params.id, id_colaborador },
      defaults: { id_evento: req.params.id, id_colaborador, permiso_nivel },
    });
    if (!created) {
      return res.status(409).json({ ok: false, message: 'El colaborador ya está asignado a este evento' });
    }
    res.status(201).json({ ok: true, data: asignacion });
  } catch (err) { next(err); }
}

// DELETE /api/v1/eventos/:id/equipo/:id_colab
async function quitarColaborador(req, res, next) {
  try {
    const deleted = await EquipoColaboradores.destroy({
      where: { id_evento: req.params.id, id_colaborador: req.params.id_colab },
    });
    if (!deleted) return res.status(404).json({ ok: false, message: 'Asignación no encontrada' });
    res.json({ ok: true, message: 'Colaborador removido del evento' });
  } catch (err) { next(err); }
}

// ── TAREAS DEL EVENTO ─────────────────────────────────────────────────────

// GET /api/v1/eventos/:id/tareas
async function getTareas(req, res, next) {
  try {
    const tareas = await Tarea.findAll({
      where: { id_evento: req.params.id },
      include: [{
        model: Colaborador,
        as: 'Responsable',
        attributes: ['id_colaborador', 'nombre_completo'],
      }],
      order: [['fecha_limite', 'ASC']],
    });
    res.json({ ok: true, data: tareas });
  } catch (err) { next(err); }
}

// POST /api/v1/eventos/:id/tareas
async function crearTarea(req, res, next) {
  try {
    const tarea = await Tarea.create({ ...req.body, id_evento: Number(req.params.id) });
    res.status(201).json({ ok: true, data: tarea });
  } catch (err) { next(err); }
}

module.exports = { getEquipo, asignarColaborador, quitarColaborador, getTareas, crearTarea };
