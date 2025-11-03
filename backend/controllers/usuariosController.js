const pool = require('../config/database');

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

module.exports = {
  getAllUsuarios,
  getUsuarioById
};

