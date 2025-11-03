const express = require('express');
const router = express.Router();
const {
  getAllDocumentos,
  getDocumentoById,
  downloadDocumento,
  uploadDocumento,
  deleteDocumento
} = require('../controllers/documentosController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/', authenticateToken, getAllDocumentos);
router.get('/:id', authenticateToken, getDocumentoById);
router.get('/:id/download', authenticateToken, downloadDocumento);
router.post('/upload', authenticateToken, upload.single('archivo'), uploadDocumento);
router.delete('/:id', authenticateToken, deleteDocumento);

module.exports = router;

