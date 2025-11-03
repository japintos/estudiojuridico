const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const getAllDocumentos = async (req, res, next) => {
  try {
    const { expediente_id, tipo } = req.query;
    let query = 'SELECT * FROM documentos WHERE 1=1';
    const params = [];

    if (expediente_id) {
      query += ' AND expediente_id = ?';
      params.push(expediente_id);
    }

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY created_at DESC';

    const [documentos] = await pool.query(query, params);
    res.json(documentos);
  } catch (error) {
    next(error);
  }
};

const getDocumentoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [documentos] = await pool.query(
      'SELECT * FROM documentos WHERE id = ?',
      [id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(documentos[0]);
  } catch (error) {
    next(error);
  }
};

const downloadDocumento = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [documentos] = await pool.query(
      'SELECT * FROM documentos WHERE id = ?',
      [id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const documento = documentos[0];
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', documento.ruta_archivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    res.download(filePath, documento.nombre_original);
  } catch (error) {
    next(error);
  }
};

const uploadDocumento = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const {
      expediente_id,
      tipo,
      descripcion,
      fecha_documento
    } = req.body;

    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);

    const [result] = await pool.query(
      `INSERT INTO documentos 
        (expediente_id, nombre_original, nombre_archivo, ruta_archivo, tipo, descripcion, 
         fecha_documento, tamaño_mb, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [expediente_id || null, req.file.originalname, req.file.filename, 
       `pdf/${req.file.filename}`, tipo || 'otro', descripcion, 
       fecha_documento, fileSizeMB, req.user.id]
    );

    const [newDocumento] = await pool.query(
      'SELECT * FROM documentos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newDocumento[0]);
  } catch (error) {
    next(error);
  }
};

const deleteDocumento = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener información del documento
    const [documentos] = await pool.query(
      'SELECT * FROM documentos WHERE id = ?',
      [id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const documento = documentos[0];

    // Solo abogados pueden eliminar
    if (req.user.rol !== 'abogado') {
      return res.status(403).json({ error: 'Solo abogados pueden eliminar documentos' });
    }

    // Eliminar archivo físico
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', documento.ruta_archivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar registro de BD
    await pool.query('DELETE FROM documentos WHERE id = ?', [id]);

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDocumentos,
  getDocumentoById,
  downloadDocumento,
  uploadDocumento,
  deleteDocumento
};

