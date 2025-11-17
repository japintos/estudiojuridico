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

    // Validar que el expediente existe
    const [expedientes] = await pool.query(
      'SELECT id FROM expedientes WHERE id = ?',
      [expediente_id]
    );

    if (expedientes.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    // Validar fecha y hora
    const fechaAudiencia = new Date(fecha_hora);
    const ahora = new Date();

    // Validar que sea fecha futura
    if (fechaAudiencia <= ahora) {
      return res.status(400).json({ error: 'La audiencia debe ser programada para una fecha y hora futura' });
    }

    // Validar que no sea fin de semana (el trigger de BD también lo valida, pero mejor validar antes)
    const diaSemana = fechaAudiencia.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      return res.status(400).json({ error: 'No se pueden programar audiencias los fines de semana' });
    }

    // Validar horario laboral (7:30 a 18:00)
    const hora = fechaAudiencia.getHours();
    const minutos = fechaAudiencia.getMinutes();
    const horaDecimal = hora + minutos / 60;
    if (horaDecimal < 7.5 || horaDecimal >= 18) {
      return res.status(400).json({ error: 'Las audiencias deben programarse en horario laboral (7:30 - 18:00)' });
    }

    const [result] = await pool.query(
      `INSERT INTO audiencias 
        (expediente_id, tipo, fecha_hora, sala, juez, secretario, observaciones, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [expediente_id, tipo, fecha_hora, sala || null, juez || null, secretario || null, observaciones || null, req.user.id]
    );

    const [newAudiencia] = await pool.query(
      `SELECT a.*, e.numero_expediente, e.caratula, e.fuero
      FROM audiencias a
      JOIN expedientes e ON a.expediente_id = e.id
      WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newAudiencia[0]);
  } catch (error) {
    // Capturar error del trigger de BD si es fin de semana
    if (error.code === '45000' || error.message.includes('fines de semana')) {
      return res.status(400).json({ error: 'No se pueden programar audiencias los fines de semana' });
    }
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

    // Validar fecha_hora si se está actualizando
    if (updateFields.fecha_hora) {
      const fechaAudiencia = new Date(updateFields.fecha_hora);
      const ahora = new Date();

      // Validar que sea fecha futura (a menos que ya esté realizada)
      const [current] = await pool.query('SELECT realizada FROM audiencias WHERE id = ?', [id]);
      if (current.length > 0 && !current[0].realizada && fechaAudiencia <= ahora) {
        return res.status(400).json({ error: 'La audiencia debe ser programada para una fecha y hora futura' });
      }

      // Validar que no sea fin de semana
      const diaSemana = fechaAudiencia.getDay();
      if (diaSemana === 0 || diaSemana === 6) {
        return res.status(400).json({ error: 'No se pueden programar audiencias los fines de semana' });
      }

      // Validar horario laboral (7:30 a 18:00)
      const hora = fechaAudiencia.getHours();
      const minutos = fechaAudiencia.getMinutes();
      const horaDecimal = hora + minutos / 60;
      if (horaDecimal < 7.5 || horaDecimal >= 18) {
        return res.status(400).json({ error: 'Las audiencias deben programarse en horario laboral (7:30 - 18:00)' });
      }
    }

    const allowedFields = [
      'tipo', 'fecha_hora', 'sala', 'juez', 'secretario', 'resultado', 'observaciones', 'realizada'
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateFields[field] || null);
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
      `SELECT a.*, e.numero_expediente, e.caratula, e.fuero
      FROM audiencias a
      JOIN expedientes e ON a.expediente_id = e.id
      WHERE a.id = ?`,
      [id]
    );

    res.json(updatedAudiencia[0]);
  } catch (error) {
    // Capturar error del trigger de BD si es fin de semana
    if (error.code === '45000' || error.message.includes('fines de semana')) {
      return res.status(400).json({ error: 'No se pueden programar audiencias los fines de semana' });
    }
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

