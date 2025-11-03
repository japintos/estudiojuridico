const express = require('express');
const router = express.Router();
const {
  getAllPlantillas,
  getPlantillaById,
  createPlantilla,
  updatePlantilla,
  generateEscrito
} = require('../controllers/plantillasController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAllPlantillas);
router.get('/:id', authenticateToken, getPlantillaById);
router.post('/', authenticateToken, createPlantilla);
router.put('/:id', authenticateToken, updatePlantilla);
router.post('/generate', authenticateToken, generateEscrito);

module.exports = router;

