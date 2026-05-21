const { Router } = require('express');
const ctrl        = require('../controllers/evento.controller');
const detallCtrl  = require('../controllers/eventoDetalle.controller');

const router = Router();

// CRUD base
router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);
router.post('/',    ctrl.create);
router.put('/:id',  ctrl.update);
router.delete('/:id', ctrl.remove);

// Equipo de colaboradores del evento
router.get   ('/:id/equipo',            detallCtrl.getEquipo);
router.post  ('/:id/equipo',            detallCtrl.asignarColaborador);
router.delete('/:id/equipo/:id_colab',  detallCtrl.quitarColaborador);

// Tareas del evento
router.get ('/:id/tareas', detallCtrl.getTareas);
router.post('/:id/tareas', detallCtrl.crearTarea);

module.exports = router;
