const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const expedientesRoutes = require('./routes/expedientes');
const clientesRoutes = require('./routes/clientes');
const audienciasRoutes = require('./routes/audiencias');
const documentosRoutes = require('./routes/documentos');
const plantillasRoutes = require('./routes/plantillas');
const agendaRoutes = require('./routes/agenda');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Rutas públicas
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedientesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/audiencias', audienciasRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/plantillas', plantillasRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Manejo de errores
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

