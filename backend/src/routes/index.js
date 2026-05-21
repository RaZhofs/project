const { Router } = require('express');
const eventoRoutes       = require('./evento.routes');
const tipoEventoRoutes   = require('./tipoEvento.routes');
const colaboradorRoutes  = require('./colaborador.routes');
const tareaRoutes        = require('./tarea.routes');

const router = Router();

router.use('/eventos',       eventoRoutes);
router.use('/tipos-evento',  tipoEventoRoutes);
router.use('/colaboradores', colaboradorRoutes);
router.use('/tareas',        tareaRoutes);

module.exports = router;
