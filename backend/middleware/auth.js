const jwt = require('jsonwebtoken');

const getAdminEmails = () => {
  const envValue = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'admin@estudiojuridico.com';
  return envValue
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

const isAdminUser = (user) => {
  if (!user || !user.email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(user.email.toLowerCase());
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ Token no proporcionado en:', req.path);
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET no configurado en variables de entorno');
    return res.status(500).json({ error: 'Error de configuración del servidor' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token inválido o expirado:', err.message);
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    next();
  };
};

const authorizeAdminUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!isAdminUser(req.user)) {
    return res.status(403).json({ error: 'Solo el administrador puede acceder a esta sección' });
  }

  next();
};

const logger = (req, res, next) => {
  const pool = require('../config/database');
  
  // Registrar en logs
  if (req.user) {
    pool.query(
      'INSERT INTO logs (usuario_id, accion, modulo, descripcion, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.method,
        req.path,
        `${req.method} ${req.path}`,
        req.ip || req.socket.remoteAddress,
        req.get('user-agent')
      ]
    ).catch(err => console.error('Error al registrar log:', err));
  }
  
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeAdminUser,
  isAdminUser,
  logger
};

