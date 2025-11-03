const pool = require('../config/database');

const getAllClientes = async (req, res, next) => {
  try {
    const { search, activo } = req.query;
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];

    if (activo !== undefined) {
      query += ' AND activo = ?';
      params.push(activo === 'true');
    }

    if (search) {
      query += ' AND (nombre_completo LIKE ? OR razon_social LIKE ? OR documento_numero LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY nombre_completo, razon_social';

    const [clientes] = await pool.query(query, params);
    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

const getClienteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [clientes] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Obtener expedientes del cliente
    const [expedientes] = await pool.query(
      'SELECT id, numero_expediente, caratula, fuero, estado, fecha_inicio FROM expedientes WHERE cliente_id = ?',
      [id]
    );

    res.json({
      ...clientes[0],
      expedientes
    });
  } catch (error) {
    next(error);
  }
};

const createCliente = async (req, res, next) => {
  try {
    const {
      tipo,
      nombre_completo,
      razon_social,
      documento_tipo,
      documento_numero,
      email,
      telefono,
      celular,
      domicilio,
      localidad,
      provincia,
      codigo_postal,
      fecha_nacimiento,
      observaciones
    } = req.body;

    if (!tipo || !documento_tipo || !documento_numero) {
      return res.status(400).json({ error: 'Campos requeridos: tipo, documento_tipo, documento_numero' });
    }

    if (tipo === 'persona_fisica' && !nombre_completo) {
      return res.status(400).json({ error: 'Nombre completo es requerido para persona física' });
    }

    if (tipo === 'persona_juridica' && !razon_social) {
      return res.status(400).json({ error: 'Razón social es requerido para persona jurídica' });
    }

    const [result] = await pool.query(
      `INSERT INTO clientes 
        (tipo, nombre_completo, razon_social, documento_tipo, documento_numero, email, 
         telefono, celular, domicilio, localidad, provincia, codigo_postal, 
         fecha_nacimiento, observaciones, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipo, nombre_completo, razon_social, documento_tipo, documento_numero, email,
       telefono, celular, domicilio, localidad, provincia, codigo_postal,
       fecha_nacimiento, observaciones, req.user.id]
    );

    const [newCliente] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCliente[0]);
  } catch (error) {
    next(error);
  }
};

const updateCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Validar permisos
    if (req.user.rol === 'pasante') {
      return res.status(403).json({ error: 'Permisos insuficientes para editar' });
    }

    const allowedFields = [
      'nombre_completo', 'razon_social', 'email', 'telefono', 'celular',
      'domicilio', 'localidad', 'provincia', 'codigo_postal',
      'fecha_nacimiento', 'observaciones', 'activo'
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
      `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedCliente] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    res.json(updatedCliente[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente
};

