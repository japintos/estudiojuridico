const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
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
const reportesRoutes = require('./routes/reportes');
const configRoutes = require('./routes/config');
const ayudaRoutes = require('./routes/ayuda');

// Jobs
const { iniciarJobVencimientos } = require('./jobs/vencimientosEmail');

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

// Servir archivos estáticos de uploads
app.use('/uploads', express.static('uploads'));

// Rutas públicas
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.1.0'
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
app.use('/api/reportes', reportesRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ayuda', ayudaRoutes);

// Servir frontend compilado en producción
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  const hasFrontendBuild = fs.existsSync(frontendDistPath);

  if (hasFrontendBuild) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
        return next();
      }
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ No se encontró el build del frontend. Ejecuta "npm run build" antes de iniciar en producción.');
  }
}

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
  
  // Iniciar jobs automáticos (con manejo de errores para no bloquear el servidor)
  try {
    iniciarJobVencimientos();
    console.log(`📧 Jobs automáticos iniciados`);
  } catch (error) {
    console.error('⚠️ Error al iniciar jobs automáticos:', error.message);
    console.log('⚠️ El servidor continuará funcionando sin los jobs automáticos');
  }
});

module.exports = app;

