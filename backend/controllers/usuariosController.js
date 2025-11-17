const pool = require('../config/database');
const bcrypt = require('bcrypt');

const allowedRoles = ['abogado', 'secretaria', 'gestor', 'pasante'];

const sanitizeBoolean = (value, fallback = true) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
};

const getAllUsuarios = async (req, res, next) => {
  try {
    const { rol, activo } = req.query;
    let query = 'SELECT id, nombre, apellido, email, rol, telefono, activo, created_at FROM usuarios WHERE 1=1';
    const params = [];

    if (rol) {
      query += ' AND rol = ?';
      params.push(rol);
    }

    if (activo !== undefined) {
      query += ' AND activo = ?';
      params.push(activo === 'true');
    }

    query += ' ORDER BY nombre, apellido';

    const [usuarios] = await pool.query(query, params);
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, telefono, activo, created_at FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    next(error);
  }
};

const createUsuario = async (req, res, next) => {
  try {
    const { nombre, apellido, email, rol, telefono, password } = req.body;

    if (!nombre || !apellido || !email || !rol || !password) {
      return res.status(400).json({ error: 'Nombre, apellido, email, rol y contraseña son requeridos' });
    }

    if (!allowedRoles.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, telefono, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, passwordHash, rol, telefono || null, true]
    );

    const [nuevoUsuario] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, telefono, activo, created_at FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(nuevoUsuario[0]);
  } catch (error) {
    next(error);
  }
};

const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, rol, telefono, activo } = req.body;

    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    if (email && email !== usuario.email) {
      const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id <> ?', [email, id]);
      if (existente.length > 0) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
      }
    }

    if (rol && !allowedRoles.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    await pool.query(
      `UPDATE usuarios 
        SET nombre = ?, apellido = ?, email = ?, rol = ?, telefono = ?, activo = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        nombre || usuario.nombre,
        apellido || usuario.apellido,
        email || usuario.email,
        rol || usuario.rol,
        telefono || usuario.telefono,
        sanitizeBoolean(activo, usuario.activo),
        id
      ]
    );

    const [actualizado] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, telefono, activo, created_at FROM usuarios WHERE id = ?',
      [id]
    );

    res.json(actualizado[0]);
  } catch (error) {
    next(error);
  }
};

const updateUsuarioEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({ error: 'Debe indicar el nuevo estado' });
    }

    const [usuarios] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await pool.query('UPDATE usuarios SET activo = ?, updated_at = NOW() WHERE id = ?', [sanitizeBoolean(activo), id]);

    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    next(error);
  }
};

const resetUsuarioPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const [usuarios] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hash, id]);

    res.json({ message: 'Contraseña restablecida' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  updateUsuarioEstado,
  resetUsuarioPassword
};

