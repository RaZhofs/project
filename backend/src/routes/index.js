const { Router } = require('express');
const eventoRoutes       = require('./evento.routes');
const tipoEventoRoutes   = require('./tipoEvento.routes');
const colaboradorRoutes  = require('./colaborador.routes');
const tareaRoutes        = require('./tarea.routes');
const publicoRoutes      = require('./publico.routes');
const rsvpRoutes         = require('./rsvp.routes');
const reporteRoutes      = require('./reporte.routes');

const router = Router();

router.use('/publico',       publicoRoutes);
router.use('/eventos',       eventoRoutes);
router.use('/tipos-evento',  tipoEventoRoutes);
router.use('/colaboradores', colaboradorRoutes);
router.use('/tareas',        tareaRoutes);
router.use('/rsvp',          rsvpRoutes);
router.use('/reportes',      reporteRoutes);

module.exports = router;
