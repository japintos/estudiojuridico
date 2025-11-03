const express = require('express');
const router = express.Router();
const {
  getAllAgenda,
  getAgendaById,
  createAgenda,
  updateAgenda,
  deleteAgenda
} = require('../controllers/agendaController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAllAgenda);
router.get('/:id', authenticateToken, getAgendaById);
router.post('/', authenticateToken, createAgenda);
router.put('/:id', authenticateToken, updateAgenda);
router.delete('/:id', authenticateToken, deleteAgenda);

module.exports = router;

