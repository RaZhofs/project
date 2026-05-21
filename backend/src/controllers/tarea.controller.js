const { Tarea, Evento, Colaborador } = require('../models');

// GET /api/v1/tareas  (uso admin — todas las tareas)
async function getAll(req, res, next) {
  try {
    const tareas = await Tarea.findAll({
      include: [
        { model: Evento,       attributes: ['id_evento', 'nombre_evento'] },
        { model: Colaborador,  as: 'Responsable', attributes: ['id_colaborador', 'nombre_completo'] },
      ],
      order: [['fecha_limite', 'ASC']],
    });
    res.json({ ok: true, data: tareas });
  } catch (err) { next(err); }
}

// GET /api/v1/tareas/:id
async function getById(req, res, next) {
  try {
    const tarea = await Tarea.findByPk(req.params.id, {
      include: [
        { model: Evento,      attributes: ['id_evento', 'nombre_evento', 'estado_evento'] },
        { model: Colaborador, as: 'Responsable', attributes: ['id_colaborador', 'nombre_completo'] },
      ],
    });
    if (!tarea) return res.status(404).json({ ok: false, message: 'Tarea no encontrada' });
    res.json({ ok: true, data: tarea });
  } catch (err) { next(err); }
}

// POST /api/v1/tareas
async function create(req, res, next) {
  try {
    const tarea = await Tarea.create(req.body);
    res.status(201).json({ ok: true, data: tarea });
  } catch (err) { next(err); }
}

// PUT /api/v1/tareas/:id   (actualiza cualquier campo, incluyendo estado_tarea)
async function update(req, res, next) {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) return res.status(404).json({ ok: false, message: 'Tarea no encontrada' });

    // Si se marca como Completada, registra la fecha automáticamente
    if (req.body.estado_tarea === 'Completada' && tarea.estado_tarea !== 'Completada') {
      req.body.fecha_completado = new Date();
    }
    if (req.body.estado_tarea && req.body.estado_tarea !== 'Completada') {
      req.body.fecha_completado = null;
    }

    await tarea.update(req.body);
    res.json({ ok: true, data: tarea });
  } catch (err) { next(err); }
}

// DELETE /api/v1/tareas/:id
async function remove(req, res, next) {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) return res.status(404).json({ ok: false, message: 'Tarea no encontrada' });
    await tarea.destroy();
    res.json({ ok: true, message: 'Tarea eliminada' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
