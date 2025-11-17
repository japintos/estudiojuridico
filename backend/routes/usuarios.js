const express = require('express');
const router = express.Router();
const {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  updateUsuarioEstado,
  resetUsuarioPassword
} = require('../controllers/usuariosController');
const { authenticateToken, authorizeAdminUser } = require('../middleware/auth');

router.use(authenticateToken, authorizeAdminUser);

router.get('/', getAllUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.patch('/:id/estado', updateUsuarioEstado);
router.post('/:id/reset-password', resetUsuarioPassword);

module.exports = router;

