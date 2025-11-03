const pool = require('../config/database');

const getAllExpedientes = async (req, res, next) => {
  try {
    const { estado, fuero, search } = req.query;
    let query = `
      SELECT 
        e.*,
        c.nombre_completo as cliente_nombre,
        c.documento_numero as cliente_dni,
        CONCAT(u.nombre, ' ', u.apellido) as abogado_nombre
      FROM expedientes e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN usuarios u ON e.abogado_responsable = u.id
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      query += ' AND e.estado = ?';
      params.push(estado);
    }

    if (fuero) {
      query += ' AND e.fuero = ?';
      params.push(fuero);
    }

    if (search) {
      query += ' AND (e.numero_expediente LIKE ? OR e.caratula LIKE ? OR c.nombre_completo LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Restricciones por rol
    if (req.user.rol === 'gestor' || req.user.rol === 'pasante') {
      // Solo ver expedientes donde son responsables o asociados
      query += ' AND (e.abogado_responsable = ? OR e.created_by = ?)';
      params.push(req.user.id, req.user.id);
    }

    query += ' ORDER BY e.fecha_inicio DESC, e.id DESC';

    const [expedientes] = await pool.query(query, params);
    res.json(expedientes);
  } catch (error) {
    next(error);
  }
};

const getExpedienteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [expedientes] = await pool.query(
      `SELECT 
        e.*,
        c.nombre_completo as cliente_nombre,
        c.documento_numero as cliente_dni,
        c.email as cliente_email,
        c.telefono as cliente_telefono,
        CONCAT(u.nombre, ' ', u.apellido) as abogado_nombre,
        u.email as abogado_email
      FROM expedientes e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN usuarios u ON e.abogado_responsable = u.id
      WHERE e.id = ?`,
      [id]
    );

    if (expedientes.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    // Obtener documentos asociados
    const [documentos] = await pool.query(
      'SELECT * FROM documentos WHERE expediente_id = ? ORDER BY created_at DESC',
      [id]
    );

    // Obtener audiencias asociadas
    const [audiencias] = await pool.query(
      'SELECT * FROM audiencias WHERE expediente_id = ? ORDER BY fecha_hora DESC',
      [id]
    );

    res.json({
      ...expedientes[0],
      documentos,
      audiencias
    });
  } catch (error) {
    next(error);
  }
};

const createExpediente = async (req, res, next) => {
  try {
    const {
      numero_expediente,
      numero_carpeta_juridica,
      fuero,
      jurisdiccion,
      juzgado,
      secretaria,
      caratula,
      estado,
      fecha_inicio,
      tipo_accion,
      monto_disputa,
      observaciones,
      cliente_id,
      abogado_responsable
    } = req.body;

    // Validaciones básicas
    if (!numero_expediente || !fuero || !caratula || !cliente_id || !abogado_responsable) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    const [result] = await pool.query(
      `INSERT INTO expedientes 
        (numero_expediente, numero_carpeta_juridica, fuero, jurisdiccion, juzgado, secretaria, 
         caratula, estado, fecha_inicio, tipo_accion, monto_disputa, observaciones, 
         cliente_id, abogado_responsable, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_expediente, numero_carpeta_juridica, fuero, jurisdiccion, juzgado, secretaria,
       caratula, estado || 'activo', fecha_inicio || new Date(), tipo_accion, monto_disputa, observaciones,
       cliente_id, abogado_responsable, req.user.id]
    );

    const [newExpediente] = await pool.query(
      'SELECT * FROM expedientes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newExpediente[0]);
  } catch (error) {
    next(error);
  }
};

const updateExpediente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Validar que el expediente existe
    const [expedientes] = await pool.query(
      'SELECT id FROM expedientes WHERE id = ?',
      [id]
    );

    if (expedientes.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    // Validar permisos
    if (req.user.rol === 'pasante') {
      return res.status(403).json({ error: 'Permisos insuficientes para editar' });
    }

    // Construir query dinámico
    const allowedFields = [
      'numero_carpeta_juridica', 'jurisdiccion', 'juzgado', 'secretaria',
      'caratula', 'estado', 'fecha_archivo', 'tipo_accion', 'monto_disputa',
      'observaciones', 'abogado_responsable'
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
      `UPDATE expedientes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedExpediente] = await pool.query(
      'SELECT * FROM expedientes WHERE id = ?',
      [id]
    );

    res.json(updatedExpediente[0]);
  } catch (error) {
    next(error);
  }
};

const deleteExpediente = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Solo abogados pueden eliminar
    if (req.user.rol !== 'abogado') {
      return res.status(403).json({ error: 'Solo abogados pueden eliminar expedientes' });
    }

    const [result] = await pool.query(
      'DELETE FROM expedientes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    res.json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const getEstadisticas = async (req, res, next) => {
  try {
    // Solo abogados ven todas las estadísticas
    const isFullAccess = req.user.rol === 'abogado';

    // Total por fuero
    const [porFuero] = await pool.query(
      `SELECT 
        fuero,
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN estado = 'finalizado' THEN 1 ELSE 0 END) as finalizados
      FROM expedientes
      ${!isFullAccess ? 'WHERE abogado_responsable = ? OR created_by = ?' : ''}
      GROUP BY fuero`,
      !isFullAccess ? [req.user.id, req.user.id] : []
    );

    // Total por estado
    const [porEstado] = await pool.query(
      `SELECT 
        estado,
        COUNT(*) as total
      FROM expedientes
      ${!isFullAccess ? 'WHERE abogado_responsable = ? OR created_by = ?' : ''}
      GROUP BY estado`,
      !isFullAccess ? [req.user.id, req.user.id] : []
    );

    // Próximas audiencias
    const [proximasAudiencias] = await pool.query(
      `SELECT a.*, e.numero_expediente, e.caratula
      FROM audiencias a
      JOIN expedientes e ON a.expediente_id = e.id
      WHERE a.realizada = FALSE 
      ${!isFullAccess ? 'AND (e.abogado_responsable = ? OR e.created_by = ?)' : ''}
      ORDER BY a.fecha_hora ASC
      LIMIT 10`,
      !isFullAccess ? [req.user.id, req.user.id] : []
    );

    res.json({
      porFuero,
      porEstado,
      proximasAudiencias
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente,
  getEstadisticas
};

