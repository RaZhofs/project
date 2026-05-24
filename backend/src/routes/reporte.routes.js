const { Router } = require('express');
const reporteCtrl = require('../controllers/reporte.controller');

const router = Router();

router.get('/excel/consolidado', reporteCtrl.exportarExcel);
router.get('/pdf/consolidado',   reporteCtrl.exportarPdf);

module.exports = router;
