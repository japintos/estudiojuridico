const express = require('express');
const router = express.Router();
const {
  getAllUsuarios,
  getUsuarioById
} = require('../controllers/usuariosController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAllUsuarios);
router.get('/:id', authenticateToken, getUsuarioById);

module.exports = router;

