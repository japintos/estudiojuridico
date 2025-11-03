const pool = require('../config/database');

const getAllAudiencias = async (req, res, next) => {
  try {
    const { expediente_id, realizada, fecha_desde, fecha_hasta } = req.query;
    let query = `
      SELECT a.*, e.numero_expediente, e.caratula, e.fuero
      FROM audiencias a
      JOIN expedientes e ON a.expediente_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (expediente_id) {
      query += ' AND a.expediente_id = ?';
      params.push(expediente_id);
    }

    if (realizada !== undefined) {
      query += ' AND a.realizada = ?';
      params.push(realizada === 'true');
    }

    if (fecha_desde) {
      query += ' AND DATE(a.fecha_hora) >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND DATE(a.fecha_hora) <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY a.fecha_hora DESC';

    const [audiencias] = await pool.query(query, params);
    res.json(audiencias);
  } catch (error) {
    next(error);
  }
};

const getAudienciaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [audiencias] = await pool.query(
      `SELECT a.*, e.numero_expediente, e.caratula, e.fuero
      FROM audiencias a
      JOIN expedientes e ON a.expediente_id = e.id
      WHERE a.id = ?`,
      [id]
    );

    if (audiencias.length === 0) {
      return res.status(404).json({ error: 'Audiencia no encontrada' });
    }

    res.json(audiencias[0]);
  } catch (error) {
    next(error);
  }
};

const createAudiencia = async (req, res, next) => {
  try {
    const {
      expediente_id,
      tipo,
      fecha_hora,
      sala,
      juez,
      secretario,
      observaciones
    } = req.body;

    if (!expediente_id || !tipo || !fecha_hora) {
      return res.status(400).json({ error: 'Campos requeridos: expediente_id, tipo, fecha_hora' });
    }

    const [result] = await pool.query(
      `INSERT INTO audiencias 
        (expediente_id, tipo, fecha_hora, sala, juez, secretario, observaciones, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [expediente_id, tipo, fecha_hora, sala, juez, secretario, observaciones, req.user.id]
    );

    const [newAudiencia] = await pool.query(
      'SELECT * FROM audiencias WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newAudiencia[0]);
  } catch (error) {
    next(error);
  }
};

const updateAudiencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    if (req.user.rol === 'pasante') {
      return res.status(403).json({ error: 'Permisos insuficientes para editar' });
    }

    const allowedFields = [
      'tipo', 'fecha_hora', 'sala', 'juez', 'secretario', 'resultado', 'observaciones', 'realizada'
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateFields[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);

    await pool.query(
      `UPDATE audiencias SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedAudiencia] = await pool.query(
      'SELECT * FROM audiencias WHERE id = ?',
      [id]
    );

    res.json(updatedAudiencia[0]);
  } catch (error) {
    next(error);
  }
};

const deleteAudiencia = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.rol !== 'abogado') {
      return res.status(403).json({ error: 'Solo abogados pueden eliminar audiencias' });
    }

    const [result] = await pool.query(
      'DELETE FROM audiencias WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Audiencia no encontrada' });
    }

    res.json({ message: 'Audiencia eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAudiencias,
  getAudienciaById,
  createAudiencia,
  updateAudiencia,
  deleteAudiencia
};

