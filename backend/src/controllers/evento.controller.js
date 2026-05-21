const { Evento, Administrador, TipoEvento, Tarea } = require('../models');

// GET /api/v1/eventos
async function getAll(req, res, next) {
  try {
    const eventos = await Evento.findAll({
      include: [
        { model: Administrador, attributes: ['id_administrador', 'nombre'] },
        { model: TipoEvento,    attributes: ['id_tipo', 'nombre'] },
      ],
    });
    res.json({ ok: true, data: eventos });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/eventos/:id
async function getById(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id, {
      include: [
        { model: Administrador, attributes: ['id_administrador', 'nombre'] },
        { model: TipoEvento,    attributes: ['id_tipo', 'nombre'] },
        { model: Tarea },
      ],
    });
    if (!evento) return res.status(404).json({ ok: false, message: 'Evento no encontrado' });
    res.json({ ok: true, data: evento });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/eventos
async function create(req, res, next) {
  try {
    const evento = await Evento.create(req.body);
    res.status(201).json({ ok: true, data: evento });
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/eventos/:id
async function update(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ ok: false, message: 'Evento no encontrado' });
    await evento.update(req.body);
    res.json({ ok: true, data: evento });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/eventos/:id
async function remove(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ ok: false, message: 'Evento no encontrado' });
    await evento.destroy();
    res.json({ ok: true, message: 'Evento eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
