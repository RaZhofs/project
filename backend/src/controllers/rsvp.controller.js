const { Evento, InvitadoRsvp, RestriccionInvitado } = require('../models');
const { generarQR }           = require('../services/qr.service');
const { sendRsvpConfirmacion } = require('../services/email.service');

async function registrarRsvp(req, res, next) {
  try {
    const id_evento = parseInt(req.params.id, 10);
    const { nombre_invitado, correo, telefono, estado_invitado, restricciones, codigo_acceso } = req.body;

    if (!nombre_invitado?.trim()) {
      return res.status(400).json({ ok: false, message: 'El nombre es requerido.' });
    }
    if (!correo?.trim()) {
      return res.status(400).json({ ok: false, message: 'El correo es requerido.' });
    }

    const evento = await Evento.findByPk(id_evento, {
      attributes: ['id_evento', 'aforo_maximo', 'codigo_acceso', 'nombre_evento', 'fecha_inicio', 'ubicacion_texto'],
    });
    if (!evento) {
      return res.status(404).json({ ok: false, message: 'Evento no encontrado.' });
    }

    if (evento.codigo_acceso) {
      if (!codigo_acceso?.trim()) {
        return res.status(400).json({ ok: false, message: 'Este evento requiere un código de acceso.' });
      }
      if (codigo_acceso.trim() !== evento.codigo_acceso.trim()) {
        return res.status(400).json({ ok: false, message: 'Código de acceso inválido.' });
      }
    }

    const estadoFinal = estado_invitado === 'Rechazado' ? 'Rechazado' : 'Confirmado';

    if (estadoFinal === 'Confirmado' && evento.aforo_maximo != null) {
      const confirmados = await InvitadoRsvp.count({
        where: { id_evento, estado_invitado: 'Confirmado' },
      });
      if (confirmados >= evento.aforo_maximo) {
        return res.status(400).json({ ok: false, message: 'Cupos agotados para este evento.' });
      }
    }

    const token = crypto.randomUUID();

    const rsvp = await InvitadoRsvp.create({
      id_evento,
      nombre_invitado: nombre_invitado.trim(),
      correo: correo.trim(),
      telefono: telefono?.trim() || null,
      estado_invitado: estadoFinal,
      codigo_de_barra: token,
    });

    if (Array.isArray(restricciones) && restricciones.length > 0) {
      const filas = restricciones
        .filter(r => r.tipo)
        .map(r => ({ id_rsvp: rsvp.id_rsvp, tipo: r.tipo, descripcion: r.descripcion?.trim() || null }));
      if (filas.length > 0) {
        await RestriccionInvitado.bulkCreate(filas);
      }
    }

    const qrDataUri = await generarQR(token);

    sendRsvpConfirmacion({
      nombre:       nombre_invitado.trim(),
      correo:       correo.trim(),
      nombreEvento: evento.nombre_evento,
      fechaEvento:  evento.fecha_inicio,
      ubicacion:    evento.ubicacion_texto,
      idRsvp:       rsvp.id_rsvp,
      qrDataUri,
    });

    return res.status(201).json({
      ok: true,
      data: {
        id_rsvp:        rsvp.id_rsvp,
        estado_invitado: rsvp.estado_invitado,
        qr_data_uri:    qrDataUri,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getInvitados(req, res, next) {
  try {
    const id_evento = parseInt(req.params.id, 10);
    const invitados = await InvitadoRsvp.findAll({
      where: { id_evento },
      include: [{ model: RestriccionInvitado, as: 'restricciones' }],
      order: [['fecha_registro', 'DESC']],
    });
    return res.json({ ok: true, data: invitados });
  } catch (err) {
    next(err);
  }
}

async function eliminarInvitado(req, res, next) {
  try {
    const id_evento = parseInt(req.params.id,      10);
    const id_rsvp   = parseInt(req.params.id_rsvp, 10);

    const rsvp = await InvitadoRsvp.findOne({ where: { id_rsvp, id_evento } });
    if (!rsvp) {
      return res.status(404).json({ ok: false, message: 'Registro de invitado no encontrado.' });
    }

    await RestriccionInvitado.destroy({ where: { id_rsvp } });
    await rsvp.destroy();

    return res.json({ ok: true, message: 'Invitado eliminado.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { registrarRsvp, getInvitados, eliminarInvitado };
