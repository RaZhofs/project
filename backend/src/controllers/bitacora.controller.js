const { Evento, Bitacora } = require('../models');

// GET /api/v1/eventos/:id/bitacora
async function getEntradas(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ ok: false, message: 'Evento no encontrado' });

    const entradas = await Bitacora.findAll({
      where: { id_evento: req.params.id },
      order: [['fecha_entrada', 'DESC']],
    });
    res.json({ ok: true, data: entradas });
  } catch (err) { next(err); }
}

// POST /api/v1/eventos/:id/bitacora  { contenido, tipo_entrada, autor_nombre, autor_rol }
async function crearEntrada(req, res, next) {
  try {
    const { contenido, tipo_entrada = 'Nota', autor_nombre, autor_rol } = req.body;
    if (!contenido?.trim()) {
      return res.status(400).json({ ok: false, message: 'El contenido es obligatorio.' });
    }
    const entrada = await Bitacora.create({
      id_evento:    Number(req.params.id),
      contenido:    contenido.trim(),
      tipo_entrada,
      autor_nombre: autor_nombre || 'Desconocido',
      autor_rol:    autor_rol    || 'Administrador',
    });
    res.status(201).json({ ok: true, data: entrada });
  } catch (err) { next(err); }
}

module.exports = { getEntradas, crearEntrada };
