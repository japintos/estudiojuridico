const express = require('express');
const router = express.Router();
const {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente
} = require('../controllers/clientesController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAllClientes);
router.get('/:id', authenticateToken, getClienteById);
router.post('/', authenticateToken, createCliente);
router.put('/:id', authenticateToken, updateCliente);

module.exports = router;

