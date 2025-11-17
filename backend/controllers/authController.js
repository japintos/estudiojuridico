const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Intento de login:', email);

    if (!email || !password) {
      console.log('❌ Faltan credenciales');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );

    console.log('👤 Usuarios encontrados:', users.length);

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado o inactivo');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    console.log('🔑 Comparando contraseña...');
    console.log('📝 Hash almacenado:', user.password_hash.substring(0, 30) + '...');
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Contraseña válida:', validPassword);

    if (!validPassword) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '8h' }
    );

    console.log('🎟️ Token JWT generado');

    // Registrar login en logs
    await pool.query(
      'INSERT INTO logs (usuario_id, accion, modulo, descripcion, ip_address) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'LOGIN', 'Auth', 'Usuario inició sesión', req.ip]
    );

    console.log('✅ Login exitoso para:', user.email);

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('💥 Error en login:', error);
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, telefono, avatar_url, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Debe indicar la contraseña actual y la nueva contraseña' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const [users] = await pool.query('SELECT id, password_hash FROM usuarios WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = users[0];
    const validPassword = await bcrypt.compare(current_password, usuario.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hashed, req.user.id]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getCurrentUser,
  changePassword
};

