const pool = require('../config/database');

const getAllAgenda = async (req, res, next) => {
  try {
    const { usuario_id, tipo, completada, fecha_desde, fecha_hasta } = req.query;
    let query = `
      SELECT a.*, e.numero_expediente, e.caratula
      FROM agenda a
      LEFT JOIN expedientes e ON a.expediente_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (usuario_id) {
      query += ' AND a.usuario_id = ?';
      params.push(usuario_id);
    }

    // Si no es abogado, solo ver sus propias tareas
    if (req.user.rol !== 'abogado') {
      query += ' AND a.usuario_id = ?';
      params.push(req.user.id);
    }

    if (tipo) {
      query += ' AND a.tipo = ?';
      params.push(tipo);
    }

    if (completada !== undefined) {
      query += ' AND a.completada = ?';
      params.push(completada === 'true');
    }

    if (fecha_desde) {
      query += ' AND DATE(a.fecha_hora) >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND DATE(a.fecha_hora) <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY a.fecha_hora ASC';

    const [agenda] = await pool.query(query, params);
    res.json(agenda);
  } catch (error) {
    next(error);
  }
};

const getAgendaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [agenda] = await pool.query(
      `SELECT a.*, e.numero_expediente, e.caratula
      FROM agenda a
      LEFT JOIN expedientes e ON a.expediente_id = e.id
      WHERE a.id = ?`,
      [id]
    );

    if (agenda.length === 0) {
      return res.status(404).json({ error: 'Evento de agenda no encontrado' });
    }

    res.json(agenda[0]);
  } catch (error) {
    next(error);
  }
};

const createAgenda = async (req, res, next) => {
  try {
    const {
      titulo,
      descripcion,
      tipo,
      fecha_hora,
      fecha_vencimiento,
      expediente_id,
      urgente
    } = req.body;

    if (!titulo || !fecha_hora) {
      return res.status(400).json({ error: 'Título y fecha son requeridos' });
    }

    const usuario_id = req.user.rol === 'abogado' ? (req.body.usuario_id || req.user.id) : req.user.id;

    const [result] = await pool.query(
      `INSERT INTO agenda 
        (usuario_id, titulo, descripcion, tipo, fecha_hora, fecha_vencimiento, expediente_id, urgente)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, titulo, descripcion, tipo, fecha_hora, fecha_vencimiento, expediente_id, urgente || false]
    );

    const [newEvento] = await pool.query(
      'SELECT * FROM agenda WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newEvento[0]);
  } catch (error) {
    next(error);
  }
};

const updateAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Verificar que solo pueda editar sus propias tareas (excepto abogados)
    if (req.user.rol !== 'abogado') {
      const [eventos] = await pool.query(
        'SELECT usuario_id FROM agenda WHERE id = ?',
        [id]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      if (eventos[0].usuario_id !== req.user.id) {
        return res.status(403).json({ error: 'No tiene permiso para editar este evento' });
      }
    }

    const allowedFields = [
      'titulo', 'descripcion', 'tipo', 'fecha_hora', 'fecha_vencimiento',
      'expediente_id', 'urgente', 'completada'
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
      `UPDATE agenda SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedEvento] = await pool.query(
      'SELECT * FROM agenda WHERE id = ?',
      [id]
    );

    res.json(updatedEvento[0]);
  } catch (error) {
    next(error);
  }
};

const deleteAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    if (req.user.rol !== 'abogado') {
      const [eventos] = await pool.query(
        'SELECT usuario_id FROM agenda WHERE id = ?',
        [id]
      );

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      if (eventos[0].usuario_id !== req.user.id) {
        return res.status(403).json({ error: 'No tiene permiso para eliminar este evento' });
      }
    }

    const [result] = await pool.query(
      'DELETE FROM agenda WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAgenda,
  getAgendaById,
  createAgenda,
  updateAgenda,
  deleteAgenda
};

