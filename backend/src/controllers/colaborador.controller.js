const { Colaborador, Usuario, Tarea, Evento, TipoEvento } = require('../models');

// GET /api/v1/colaboradores
async function getAll(req, res, next) {
  try {
    const colaboradores = await Colaborador.findAll({
      include: [{ model: Usuario, attributes: ['id_usuario', 'correo'] }],
    });
    res.json({ ok: true, data: colaboradores });
  } catch (err) { next(err); }
}

// GET /api/v1/colaboradores/:id
async function getById(req, res, next) {
  try {
    const colab = await Colaborador.findByPk(req.params.id, {
      include: [{ model: Usuario, attributes: ['id_usuario', 'correo'] }],
    });
    if (!colab) return res.status(404).json({ ok: false, message: 'Colaborador no encontrado' });
    res.json({ ok: true, data: colab });
  } catch (err) { next(err); }
}

// GET /api/v1/colaboradores/:id/tareas
async function getTareas(req, res, next) {
  try {
    const tareas = await Tarea.findAll({
      where: { id_responsable: req.params.id },
      include: [{
        model: Evento,
        attributes: ['id_evento', 'nombre_evento', 'estado_evento'],
        include: [{ model: TipoEvento, attributes: ['nombre'] }],
      }],
      order: [['fecha_limite', 'ASC']],
    });
    res.json({ ok: true, data: tareas });
  } catch (err) { next(err); }
}

// POST /api/v1/colaboradores
async function create(req, res, next) {
  try {
    const colab = await Colaborador.create(req.body);
    res.status(201).json({ ok: true, data: colab });
  } catch (err) { next(err); }
}

// PUT /api/v1/colaboradores/:id
async function update(req, res, next) {
  try {
    const colab = await Colaborador.findByPk(req.params.id);
    if (!colab) return res.status(404).json({ ok: false, message: 'Colaborador no encontrado' });
    await colab.update(req.body);
    res.json({ ok: true, data: colab });
  } catch (err) { next(err); }
}

// DELETE /api/v1/colaboradores/:id
async function remove(req, res, next) {
  try {
    const colab = await Colaborador.findByPk(req.params.id);
    if (!colab) return res.status(404).json({ ok: false, message: 'Colaborador no encontrado' });
    await colab.destroy();
    res.json({ ok: true, message: 'Colaborador eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, getTareas, create, update, remove };
