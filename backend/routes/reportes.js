const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  getReporteExpedientes,
  getReporteVencimientos,
  getReporteAudiencias,
  getReporteGeneral,
  enviarReportePorCorreo,
  getExpedientesSinMovimiento
} = require('../controllers/reportesController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Solo abogados y secretarias pueden generar reportes
router.get('/expedientes', authorizeRole('abogado', 'secretaria'), getReporteExpedientes);
router.get('/vencimientos', authorizeRole('abogado', 'secretaria'), getReporteVencimientos);
router.get('/audiencias', authorizeRole('abogado', 'secretaria'), getReporteAudiencias);
router.get('/general', authorizeRole('abogado', 'secretaria'), getReporteGeneral);
router.get('/expedientes-inactivos', authorizeRole('abogado', 'secretaria'), async (req, res, next) => {
  try {
    const data = await getExpedientesSinMovimiento();
    res.json(data);
  } catch (error) {
    next(error);
  }
});
router.post('/enviar', authorizeRole('abogado', 'secretaria'), enviarReportePorCorreo);

module.exports = router;

