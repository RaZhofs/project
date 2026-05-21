const { Router } = require('express');
const eventoRoutes = require('./evento.routes');

const router = Router();

router.use('/eventos', eventoRoutes);

module.exports = router;
