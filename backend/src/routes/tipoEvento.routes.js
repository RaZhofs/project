const { Router } = require('express');
const ctrl = require('../controllers/tipoEvento.controller');

const router = Router();
router.get('/', ctrl.getAll);

module.exports = router;
