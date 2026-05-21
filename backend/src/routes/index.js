const { Router } = require('express');
const eventoRoutes    = require('./evento.routes');
const tipoEventoRoutes = require('./tipoEvento.routes');

const router = Router();

router.use('/eventos',      eventoRoutes);
router.use('/tipos-evento', tipoEventoRoutes);

module.exports = router;
