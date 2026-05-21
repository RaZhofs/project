const { TipoEvento } = require('../models');

async function getAll(req, res, next) {
  try {
    const tipos = await TipoEvento.findAll({ order: [['nombre', 'ASC']] });
    res.json({ ok: true, data: tipos });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll };
