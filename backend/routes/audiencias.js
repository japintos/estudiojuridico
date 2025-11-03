const express = require('express');
const router = express.Router();
const {
  getAllAudiencias,
  getAudienciaById,
  createAudiencia,
  updateAudiencia,
  deleteAudiencia
} = require('../controllers/audienciasController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAllAudiencias);
router.get('/:id', authenticateToken, getAudienciaById);
router.post('/', authenticateToken, createAudiencia);
router.put('/:id', authenticateToken, updateAudiencia);
router.delete('/:id', authenticateToken, deleteAudiencia);

module.exports = router;

