const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
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
  logger
};

