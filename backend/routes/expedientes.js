const express = require('express');
const router = express.Router();
const {
  getAllExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente,
  getEstadisticas
} = require('../controllers/expedientesController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAllExpedientes);
router.get('/stats', authenticateToken, getEstadisticas);
router.get('/:id', authenticateToken, getExpedienteById);
router.post('/', authenticateToken, createExpediente);
router.put('/:id', authenticateToken, updateExpediente);
router.delete('/:id', authenticateToken, deleteExpediente);

module.exports = router;

