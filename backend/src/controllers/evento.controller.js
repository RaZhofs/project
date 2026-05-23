const {
  sequelize,
  Evento, Administrador, TipoEvento, Tarea,
  EquipoColaboradores, Bitacora, PresupuestoItem,
  InvitadoRsvp, RestriccionInvitado,
} = require('../models');

const CONFIRMADOS_SUBQUERY = `(
  SELECT COUNT(*)
  FROM INVITADOS_RSVP IR
  WHERE IR.id_evento = EVENTOS.id_evento
    AND IR.estado_invitado = N'Confirmado'
)`;

// GET /api/v1/eventos
async function getAll(req, res, next) {
  try {
    const eventos = await Evento.findAll({
      attributes: {
        include: [[sequelize.literal(CONFIRMADOS_SUBQUERY), 'confirmados_count']],
      },
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
      attributes: {
        include: [[sequelize.literal(CONFIRMADOS_SUBQUERY), 'confirmados_count']],
      },
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
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const evento = await Evento.findByPk(id, { transaction: t });
    if (!evento) {
      await t.rollback();
      return res.status(404).json({ ok: false, message: 'Evento no encontrado' });
    }

    // 1. Restricciones de invitados (FK → INVITADOS_RSVP)
    const rsvpIds = await InvitadoRsvp.findAll({
      where: { id_evento: id }, attributes: ['id_rsvp'], transaction: t,
    });
    if (rsvpIds.length > 0) {
      await RestriccionInvitado.destroy({
        where: { id_rsvp: rsvpIds.map(r => r.id_rsvp) }, transaction: t,
      });
    }

    // 2. Invitados RSVP (FK → EVENTOS)
    await InvitadoRsvp.destroy({ where: { id_evento: id }, transaction: t });

    // 3. Presupuesto (FK → EVENTOS)
    await PresupuestoItem.destroy({ where: { id_evento: id }, transaction: t });

    // 4. Bitácora (FK → EVENTOS)
    await Bitacora.destroy({ where: { id_evento: id }, transaction: t });

    // 5. Tareas (FK → EVENTOS)
    await Tarea.destroy({ where: { id_evento: id }, transaction: t });

    // 6. Equipo colaboradores (FK → EVENTOS)
    await EquipoColaboradores.destroy({ where: { id_evento: id }, transaction: t });

    // 7. Evento
    await evento.destroy({ transaction: t });

    await t.commit();
    res.json({ ok: true, message: 'Evento eliminado' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
