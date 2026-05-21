const { Evento, PresupuestoItem } = require('../models');

// GET /api/v1/eventos/:id/presupuesto
async function getItems(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ ok: false, message: 'Evento no encontrado' });

    const items = await PresupuestoItem.findAll({
      where: { id_evento: req.params.id },
      order: [['id_item', 'ASC']],
    });
    res.json({ ok: true, data: items });
  } catch (err) { next(err); }
}

// POST /api/v1/eventos/:id/presupuesto
async function crearItem(req, res, next) {
  try {
    const { descripcion, categoria, tipo, monto_estimado, monto_real, estado } = req.body;
    if (!descripcion?.trim())
      return res.status(400).json({ ok: false, message: 'La descripción es obligatoria.' });
    if (!monto_estimado && monto_estimado !== 0)
      return res.status(400).json({ ok: false, message: 'El monto estimado es obligatorio.' });

    const item = await PresupuestoItem.create({
      id_evento:      Number(req.params.id),
      descripcion:    descripcion.trim(),
      categoria:      categoria   || 'Otros',
      tipo:           tipo        || 'Egreso',
      monto_estimado: Number(monto_estimado),
      monto_real:     monto_real != null ? Number(monto_real) : null,
      estado:         estado      || 'Pendiente',
    });
    res.status(201).json({ ok: true, data: item });
  } catch (err) { next(err); }
}

// PUT /api/v1/eventos/:id/presupuesto/:id_item
async function updateItem(req, res, next) {
  try {
    const item = await PresupuestoItem.findOne({
      where: { id_item: req.params.id_item, id_evento: req.params.id },
    });
    if (!item) return res.status(404).json({ ok: false, message: 'Ítem no encontrado' });

    const { descripcion, categoria, tipo, monto_estimado, monto_real, estado } = req.body;
    await item.update({
      descripcion:    descripcion   != null ? descripcion.trim()       : item.descripcion,
      categoria:      categoria     != null ? categoria                 : item.categoria,
      tipo:           tipo          != null ? tipo                      : item.tipo,
      monto_estimado: monto_estimado != null ? Number(monto_estimado)  : item.monto_estimado,
      monto_real:     monto_real    !== undefined ? (monto_real != null ? Number(monto_real) : null) : item.monto_real,
      estado:         estado        != null ? estado                   : item.estado,
    });
    res.json({ ok: true, data: item });
  } catch (err) { next(err); }
}

// DELETE /api/v1/eventos/:id/presupuesto/:id_item
async function deleteItem(req, res, next) {
  try {
    const deleted = await PresupuestoItem.destroy({
      where: { id_item: req.params.id_item, id_evento: req.params.id },
    });
    if (!deleted) return res.status(404).json({ ok: false, message: 'Ítem no encontrado' });
    res.json({ ok: true, message: 'Ítem eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getItems, crearItem, updateItem, deleteItem };
