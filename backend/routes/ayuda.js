const express = require('express');
const router = express.Router();
const { generarPDFGuiaUsuario } = require('../controllers/ayudaController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/ayuda/guia-usuario
 * @desc Descarga la guía de usuario en formato PDF
 * @access Private (requiere autenticación)
 */
router.get('/guia-usuario', authenticateToken, generarPDFGuiaUsuario);

module.exports = router;

