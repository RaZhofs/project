const { Router } = require('express');
const ctrl = require('../controllers/colaborador.controller');

const router = Router();

router.get('/',           ctrl.getAll);
router.get('/:id',        ctrl.getById);
router.get('/:id/tareas', ctrl.getTareas);
router.post('/',          ctrl.create);
router.put('/:id',        ctrl.update);
router.delete('/:id',     ctrl.remove);

module.exports = router;
