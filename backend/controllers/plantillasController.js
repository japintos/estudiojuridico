const pool = require('../config/database');

const getAllPlantillas = async (req, res, next) => {
  try {
    const { tipo, fuero, activa } = req.query;
    let query = 'SELECT * FROM plantillas WHERE 1=1';
    const params = [];

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    if (fuero) {
      query += ' AND fuero = ?';
      params.push(fuero);
    }

    if (activa !== undefined) {
      query += ' AND activa = ?';
      params.push(activa === 'true');
    }

    query += ' ORDER BY nombre';

    const [plantillas] = await pool.query(query, params);
    res.json(plantillas);
  } catch (error) {
    next(error);
  }
};

const getPlantillaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [plantillas] = await pool.query(
      'SELECT * FROM plantillas WHERE id = ?',
      [id]
    );

    if (plantillas.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    res.json(plantillas[0]);
  } catch (error) {
    next(error);
  }
};

const createPlantilla = async (req, res, next) => {
  try {
    const {
      nombre,
      tipo,
      fuero,
      contenido,
      variables_disponibles,
      descripcion
    } = req.body;

    if (!nombre || !contenido) {
      return res.status(400).json({ error: 'Nombre y contenido son requeridos' });
    }

    const [result] = await pool.query(
      `INSERT INTO plantillas 
        (nombre, tipo, fuero, contenido, variables_disponibles, descripcion, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, tipo, fuero, contenido, JSON.stringify(variables_disponibles || []), descripcion, req.user.id]
    );

    const [newPlantilla] = await pool.query(
      'SELECT * FROM plantillas WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newPlantilla[0]);
  } catch (error) {
    next(error);
  }
};

const updatePlantilla = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    if (req.user.rol !== 'abogado') {
      return res.status(403).json({ error: 'Solo abogados pueden editar plantillas' });
    }

    const allowedFields = ['nombre', 'tipo', 'fuero', 'contenido', 'variables_disponibles', 'descripcion', 'activa'];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(field === 'variables_disponibles' ? JSON.stringify(updateFields[field]) : updateFields[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);

    await pool.query(
      `UPDATE plantillas SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedPlantilla] = await pool.query(
      'SELECT * FROM plantillas WHERE id = ?',
      [id]
    );

    res.json(updatedPlantilla[0]);
  } catch (error) {
    next(error);
  }
};

const generateEscrito = async (req, res, next) => {
  try {
    const { plantilla_id, expediente_id, variables } = req.body;

    if (!plantilla_id || !expediente_id) {
      return res.status(400).json({ error: 'Plantilla y expediente son requeridos' });
    }

    // Obtener plantilla
    const [plantillas] = await pool.query(
      'SELECT * FROM plantillas WHERE id = ? AND activa = TRUE',
      [plantilla_id]
    );

    if (plantillas.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada o inactiva' });
    }

    const plantilla = plantillas[0];

    // Obtener datos del expediente
    const [expedientes] = await pool.query(
      `SELECT 
        e.*,
        c.nombre_completo as nombre_cliente,
        c.documento_numero as dni_cliente,
        u.nombre as nombre_abogado,
        u.apellido as apellido_abogado
      FROM expedientes e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN usuarios u ON e.abogado_responsable = u.id
      WHERE e.id = ?`,
      [expediente_id]
    );

    if (expedientes.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    const expediente = expedientes[0];

    // Preparar variables por defecto
    const defaultVariables = {
      caratula: expediente.caratula,
      juzgado: expediente.juzgado || '',
      secretaria: expediente.secretaria || '',
      numero_expediente: expediente.numero_expediente,
      nombre_cliente: expediente.nombre_cliente || '',
      dni_cliente: expediente.dni_cliente || '',
      nombre_abogado: `${expediente.nombre_abogado || ''} ${expediente.apellido_abogado || ''}`.trim(),
      fecha: new Date().toLocaleDateString('es-AR'),
      ...variables
    };

    // Reemplazar variables en la plantilla
    let contenidoFinal = plantilla.contenido;
    for (const [key, value] of Object.entries(defaultVariables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      contenidoFinal = contenidoFinal.replace(regex, value || '');
    }

    // Guardar el escrito generado
    const nombreDocumento = `${plantilla.nombre}_${expediente.numero_expediente}_${Date.now()}.txt`;

    const [result] = await pool.query(
      `INSERT INTO escritos_generados 
        (expediente_id, plantilla_id, contenido_final, nombre_documento, generado_por)
      VALUES (?, ?, ?, ?, ?)`,
      [expediente_id, plantilla_id, contenidoFinal, nombreDocumento, req.user.id]
    );

    const [newEscrito] = await pool.query(
      'SELECT * FROM escritos_generados WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      ...newEscrito[0],
      contenido_final: contenidoFinal
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlantillas,
  getPlantillaById,
  createPlantilla,
  updatePlantilla,
  generateEscrito
};

