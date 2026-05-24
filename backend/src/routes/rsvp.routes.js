const { Router } = require('express');
const rsvpCtrl = require('../controllers/rsvp.controller');

const router = Router();

router.post('/validar-acceso', rsvpCtrl.validarAcceso);

module.exports = router;
