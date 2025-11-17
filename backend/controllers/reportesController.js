const pool = require('../config/database');
const PDFDocument = require('pdfkit');
const { sendReporteEmail } = require('../services/emailService');

/**
 * Genera un reporte de expedientes
 */
const getReporteExpedientes = async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta, fuero, estado } = req.query;

    let query = `
      SELECT 
        e.*,
        c.nombre_completo as nombre_cliente,
        u.nombre as nombre_abogado,
        u.apellido as apellido_abogado,
        COUNT(DISTINCT d.id) as total_documentos,
        COUNT(DISTINCT aud.id) as total_audiencias
      FROM expedientes e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN usuarios u ON e.abogado_responsable = u.id
      LEFT JOIN documentos d ON e.id = d.expediente_id
      LEFT JOIN audiencias aud ON e.id = aud.expediente_id
      WHERE 1=1
    `;
    const params = [];

    if (fecha_desde) {
      query += ' AND DATE(e.fecha_inicio) >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND DATE(e.fecha_inicio) <= ?';
      params.push(fecha_hasta);
    }

    if (fuero) {
      query += ' AND e.fuero = ?';
      params.push(fuero);
    }

    if (estado) {
      query += ' AND e.estado = ?';
      params.push(estado);
    }

    query += ' GROUP BY e.id ORDER BY e.fecha_inicio DESC';

    const [expedientes] = await pool.query(query, params);

    // Estadísticas
    const estadisticas = {
      total: expedientes.length,
      por_fuero: {},
      por_estado: {},
      total_monto: 0
    };

    expedientes.forEach(exp => {
      // Por fuero
      estadisticas.por_fuero[exp.fuero] = (estadisticas.por_fuero[exp.fuero] || 0) + 1;
      // Por estado
      estadisticas.por_estado[exp.estado] = (estadisticas.por_estado[exp.estado] || 0) + 1;
      // Monto total
      if (exp.monto_disputa) {
        estadisticas.total_monto += parseFloat(exp.monto_disputa);
      }
    });

    res.json({
      expedientes,
      estadisticas,
      filtros: { fecha_desde, fecha_hasta, fuero, estado }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Genera un reporte de vencimientos
 */
const getReporteVencimientos = async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta, urgente, completada } = req.query;

    let query = `
      SELECT 
        a.*,
        e.numero_expediente,
        e.caratula,
        e.fuero,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario,
        u.email as email_usuario
      FROM agenda a
      LEFT JOIN expedientes e ON a.expediente_id = e.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tipo = 'vencimiento'
      AND a.fecha_vencimiento IS NOT NULL
    `;
    const params = [];

    if (fecha_desde) {
      query += ' AND DATE(a.fecha_vencimiento) >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND DATE(a.fecha_vencimiento) <= ?';
      params.push(fecha_hasta);
    }

    if (urgente !== undefined) {
      query += ' AND a.urgente = ?';
      params.push(urgente === 'true');
    }

    if (completada !== undefined) {
      query += ' AND a.completada = ?';
      params.push(completada === 'true');
    }

    query += ' ORDER BY a.fecha_vencimiento ASC';

    const [vencimientos] = await pool.query(query, params);

    // Calcular días restantes
    const vencimientosConDias = vencimientos.map(v => {
      const fechaVenc = new Date(v.fecha_vencimiento);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
      
      return {
        ...v,
        dias_restantes: diasRestantes,
        estado_vencimiento: diasRestantes < 0 ? 'vencido' : diasRestantes <= 3 ? 'critico' : diasRestantes <= 7 ? 'proximo' : 'normal'
      };
    });

    // Estadísticas
    const estadisticas = {
      total: vencimientosConDias.length,
      vencidos: vencimientosConDias.filter(v => v.dias_restantes < 0).length,
      criticos: vencimientosConDias.filter(v => v.dias_restantes >= 0 && v.dias_restantes <= 3).length,
      proximos: vencimientosConDias.filter(v => v.dias_restantes > 3 && v.dias_restantes <= 7).length,
      normales: vencimientosConDias.filter(v => v.dias_restantes > 7).length,
      urgentes: vencimientosConDias.filter(v => v.urgente).length
    };

    res.json({
      vencimientos: vencimientosConDias,
      estadisticas,
      filtros: { fecha_desde, fecha_hasta, urgente, completada }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Genera un reporte de audiencias
 */
const getReporteAudiencias = async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta, realizada, tipo } = req.query;

    let query = `
      SELECT 
        a.*,
        e.numero_expediente,
        e.caratula,
        e.fuero,
        c.nombre_completo as nombre_cliente
      FROM audiencias a
      LEFT JOIN expedientes e ON a.expediente_id = e.id
      LEFT JOIN clientes c ON e.cliente_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha_desde) {
      query += ' AND DATE(a.fecha_hora) >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND DATE(a.fecha_hora) <= ?';
      params.push(fecha_hasta);
    }

    if (realizada !== undefined) {
      query += ' AND a.realizada = ?';
      params.push(realizada === 'true');
    }

    if (tipo) {
      query += ' AND a.tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY a.fecha_hora ASC';

    const [audiencias] = await pool.query(query, params);

    // Estadísticas
    const estadisticas = {
      total: audiencias.length,
      realizadas: audiencias.filter(a => a.realizada).length,
      pendientes: audiencias.filter(a => !a.realizada).length,
      por_tipo: {}
    };

    audiencias.forEach(aud => {
      estadisticas.por_tipo[aud.tipo] = (estadisticas.por_tipo[aud.tipo] || 0) + 1;
    });

    res.json({
      audiencias,
      estadisticas,
      filtros: { fecha_desde, fecha_hasta, realizada, tipo }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Genera un reporte general (dashboard)
 */
const getReporteGeneral = async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    // Expedientes
    let queryExpedientes = 'SELECT COUNT(*) as total FROM expedientes WHERE 1=1';
    const paramsExpedientes = [];

    if (fecha_desde) {
      queryExpedientes += ' AND DATE(fecha_inicio) >= ?';
      paramsExpedientes.push(fecha_desde);
    }
    if (fecha_hasta) {
      queryExpedientes += ' AND DATE(fecha_inicio) <= ?';
      paramsExpedientes.push(fecha_hasta);
    }

    const [expedientes] = await pool.query(queryExpedientes, paramsExpedientes);

    // Vencimientos próximos (próximos 7 días)
    const hoy = new Date();
    const en7Dias = new Date();
    en7Dias.setDate(hoy.getDate() + 7);

    const [vencimientos] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM agenda 
       WHERE tipo = 'vencimiento' 
       AND fecha_vencimiento IS NOT NULL
       AND DATE(fecha_vencimiento) BETWEEN ? AND ?
       AND completada = FALSE`,
      [hoy.toISOString().split('T')[0], en7Dias.toISOString().split('T')[0]]
    );

    // Audiencias próximas (próximos 7 días)
    const [audiencias] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM audiencias 
       WHERE realizada = FALSE
       AND DATE(fecha_hora) BETWEEN ? AND ?`,
      [hoy.toISOString().split('T')[0], en7Dias.toISOString().split('T')[0]]
    );

    // Documentos
    let queryDocs = 'SELECT COUNT(*) as total FROM documentos WHERE 1=1';
    const paramsDocs = [];
    if (fecha_desde) {
      queryDocs += ' AND DATE(created_at) >= ?';
      paramsDocs.push(fecha_desde);
    }
    if (fecha_hasta) {
      queryDocs += ' AND DATE(created_at) <= ?';
      paramsDocs.push(fecha_hasta);
    }
    const [documentos] = await pool.query(queryDocs, paramsDocs);

    res.json({
      expedientes: expedientes[0].total,
      vencimientos_proximos: vencimientos[0].total,
      audiencias_proximas: audiencias[0].total,
      documentos: documentos[0].total,
      periodo: { fecha_desde, fecha_hasta }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Genera un PDF del reporte
 */
const generarPDFReporte = async (tipo, datos, filtros) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).text('Reporte del Estudio Jurídico', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Tipo: ${tipo}`, { align: 'center' });
      doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' });
      doc.moveDown(2);

      // Filtros
      if (filtros && Object.keys(filtros).length > 0) {
        doc.fontSize(12).text('Filtros aplicados:', { underline: true });
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) {
            doc.fontSize(10).text(`${key}: ${value}`);
          }
        });
        doc.moveDown();
      }

      // Contenido según tipo
      if (tipo === 'expedientes' && datos.expedientes) {
        doc.fontSize(12).text('Expedientes', { underline: true });
        doc.moveDown();
        datos.expedientes.forEach((exp, index) => {
          doc.fontSize(10).text(`${index + 1}. ${exp.numero_expediente} - ${exp.caratula.substring(0, 50)}...`);
          doc.text(`   Fuero: ${exp.fuero} | Estado: ${exp.estado} | Cliente: ${exp.nombre_cliente || 'N/A'}`);
          doc.moveDown(0.5);
        });
      } else if (tipo === 'vencimientos' && datos.vencimientos) {
        doc.fontSize(12).text('Vencimientos', { underline: true });
        doc.moveDown();
        datos.vencimientos.forEach((v, index) => {
          doc.fontSize(10).text(`${index + 1}. ${v.titulo}`);
          doc.text(`   Expediente: ${v.numero_expediente || 'N/A'} | Vence: ${new Date(v.fecha_vencimiento).toLocaleDateString('es-AR')}`);
          doc.text(`   Días restantes: ${v.dias_restantes} | ${v.urgente ? 'URGENTE' : ''}`);
          doc.moveDown(0.5);
        });
      } else if (tipo === 'audiencias' && datos.audiencias) {
        doc.fontSize(12).text('Audiencias', { underline: true });
        doc.moveDown();
        datos.audiencias.forEach((a, index) => {
          doc.fontSize(10).text(`${index + 1}. ${a.tipo} - ${new Date(a.fecha_hora).toLocaleString('es-AR')}`);
          doc.text(`   Expediente: ${a.numero_expediente || 'N/A'} | ${a.caratula || ''}`);
          doc.text(`   Sala: ${a.sala || 'N/A'} | Juez: ${a.juez || 'N/A'}`);
          doc.text(`   Estado: ${a.realizada ? 'Realizada' : 'Pendiente'}`);
          doc.moveDown(0.5);
        });
      }

      // Estadísticas
      if (datos.estadisticas) {
        doc.moveDown();
        doc.fontSize(12).text('Estadísticas', { underline: true });
        doc.moveDown();
        Object.entries(datos.estadisticas).forEach(([key, value]) => {
          if (typeof value === 'number') {
            doc.fontSize(10).text(`${key}: ${value}`);
          }
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Obtiene datos de reporte sin usar res (para uso interno)
 */
const obtenerDatosReporte = async (tipo, filtros) => {
  const { fecha_desde, fecha_hasta, ...otrosFiltros } = filtros;
  
  if (tipo === 'expedientes') {
    let query = `
      SELECT 
        e.*,
        c.nombre_completo as nombre_cliente,
        u.nombre as nombre_abogado,
        u.apellido as apellido_abogado,
        COUNT(DISTINCT d.id) as total_documentos,
        COUNT(DISTINCT aud.id) as total_audiencias
      FROM expedientes e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN usuarios u ON e.abogado_responsable = u.id
      LEFT JOIN documentos d ON e.id = d.expediente_id
      LEFT JOIN audiencias aud ON e.id = aud.expediente_id
      WHERE 1=1
    `;
    const params = [];

    if (fecha_desde) {
      query += ' AND DATE(e.fecha_inicio) >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ' AND DATE(e.fecha_inicio) <= ?';
      params.push(fecha_hasta);
    }
    if (otrosFiltros.fuero) {
      query += ' AND e.fuero = ?';
      params.push(otrosFiltros.fuero);
    }
    if (otrosFiltros.estado) {
      query += ' AND e.estado = ?';
      params.push(otrosFiltros.estado);
    }

    query += ' GROUP BY e.id ORDER BY e.fecha_inicio DESC';
    const [expedientes] = await pool.query(query, params);

    const estadisticas = {
      total: expedientes.length,
      por_fuero: {},
      por_estado: {},
      total_monto: 0
    };

    expedientes.forEach(exp => {
      estadisticas.por_fuero[exp.fuero] = (estadisticas.por_fuero[exp.fuero] || 0) + 1;
      estadisticas.por_estado[exp.estado] = (estadisticas.por_estado[exp.estado] || 0) + 1;
      if (exp.monto_disputa) {
        estadisticas.total_monto += parseFloat(exp.monto_disputa);
      }
    });

    return { expedientes, estadisticas };
  } else if (tipo === 'vencimientos') {
    let query = `
      SELECT 
        a.*,
        e.numero_expediente,
        e.caratula,
        e.fuero,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario,
        u.email as email_usuario
      FROM agenda a
      LEFT JOIN expedientes e ON a.expediente_id = e.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tipo = 'vencimiento'
      AND a.fecha_vencimiento IS NOT NULL
    `;
    const params = [];

    if (fecha_desde) {
      query += ' AND DATE(a.fecha_vencimiento) >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ' AND DATE(a.fecha_vencimiento) <= ?';
      params.push(fecha_hasta);
    }
    if (otrosFiltros.urgente !== undefined) {
      query += ' AND a.urgente = ?';
      params.push(otrosFiltros.urgente === 'true');
    }
    if (otrosFiltros.completada !== undefined) {
      query += ' AND a.completada = ?';
      params.push(otrosFiltros.completada === 'true');
    }

    query += ' ORDER BY a.fecha_vencimiento ASC';
    const [vencimientos] = await pool.query(query, params);

    const vencimientosConDias = vencimientos.map(v => {
      const fechaVenc = new Date(v.fecha_vencimiento);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
      
      return {
        ...v,
        dias_restantes: diasRestantes,
        estado_vencimiento: diasRestantes < 0 ? 'vencido' : diasRestantes <= 3 ? 'critico' : diasRestantes <= 7 ? 'proximo' : 'normal'
      };
    });

    const estadisticas = {
      total: vencimientosConDias.length,
      vencidos: vencimientosConDias.filter(v => v.dias_restantes < 0).length,
      criticos: vencimientosConDias.filter(v => v.dias_restantes >= 0 && v.dias_restantes <= 3).length,
      proximos: vencimientosConDias.filter(v => v.dias_restantes > 3 && v.dias_restantes <= 7).length,
      normales: vencimientosConDias.filter(v => v.dias_restantes > 7).length,
      urgentes: vencimientosConDias.filter(v => v.urgente).length
    };

    return { vencimientos: vencimientosConDias, estadisticas };
  } else if (tipo === 'audiencias') {
    let query = `
      SELECT 
        a.*,
        e.numero_expediente,
        e.caratula,
        e.fuero,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario
      FROM audiencias a
      LEFT JOIN expedientes e ON a.expediente_id = e.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha_desde) {
      query += ' AND DATE(a.fecha_hora) >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ' AND DATE(a.fecha_hora) <= ?';
      params.push(fecha_hasta);
    }
    if (otrosFiltros.realizada !== undefined) {
      query += ' AND a.realizada = ?';
      params.push(otrosFiltros.realizada === 'true');
    }
    if (otrosFiltros.tipo) {
      query += ' AND a.tipo = ?';
      params.push(otrosFiltros.tipo);
    }

    query += ' ORDER BY a.fecha_hora ASC';
    const [audiencias] = await pool.query(query, params);

    const estadisticas = {
      total: audiencias.length,
      realizadas: audiencias.filter(a => a.realizada).length,
      pendientes: audiencias.filter(a => !a.realizada).length,
      por_tipo: {}
    };

    audiencias.forEach(aud => {
      estadisticas.por_tipo[aud.tipo] = (estadisticas.por_tipo[aud.tipo] || 0) + 1;
    });

    return { audiencias, estadisticas };
  }

  return {};
};

/**
 * Envía un reporte por correo
 */
const enviarReportePorCorreo = async (req, res, next) => {
  try {
    const { tipo, email, emails, fecha_desde, fecha_hasta, ...otrosFiltros } = req.body;

    // Aceptar email (string) o emails (array) o user_ids (array)
    let destinatarios = [];
    
    if (emails && Array.isArray(emails)) {
      destinatarios = emails;
    } else if (email) {
      destinatarios = [email];
    } else if (req.body.user_ids && Array.isArray(req.body.user_ids)) {
      // Si se envían IDs de usuarios, obtener sus emails
      const [usuarios] = await pool.query(
        'SELECT email FROM usuarios WHERE id IN (?) AND activo = TRUE AND email IS NOT NULL',
        [req.body.user_ids]
      );
      destinatarios = usuarios.map(u => u.email).filter(Boolean);
    } else {
      return res.status(400).json({ error: 'Se requiere al menos un email o user_id' });
    }

    if (destinatarios.length === 0) {
      return res.status(400).json({ error: 'No se encontraron destinatarios válidos' });
    }

    if (!tipo) {
      return res.status(400).json({ error: 'Tipo de reporte es requerido' });
    }

    // Obtener datos del reporte
    const filtros = { fecha_desde, fecha_hasta, ...otrosFiltros };
    const datos = await obtenerDatosReporte(tipo, filtros);

    // Generar PDF
    const pdfBuffer = await generarPDFReporte(tipo, datos, filtros);

    // Enviar correo a todos los destinatarios
    const resultados = await sendReporteEmail({
      titulo: `Reporte de ${tipo}`,
      tipo,
      fecha_desde: fecha_desde || 'N/A',
      fecha_hasta: fecha_hasta || 'N/A',
      resumen: `Reporte generado automáticamente con ${datos.expedientes?.length || datos.vencimientos?.length || 0} registros.`
    }, destinatarios, pdfBuffer);

    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success);

    if (fallidos.length > 0) {
      return res.status(207).json({ 
        message: `Reporte enviado a ${exitosos} de ${destinatarios.length} destinatarios`,
        exitosos,
        fallidos: fallidos.map(f => ({ email: f.email, error: f.error }))
      });
    }

    res.json({ 
      message: `Reporte enviado exitosamente a ${exitosos} destinatario(s)`,
      destinatarios: exitosos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene expedientes sin movimiento en los últimos 2 meses
 */
const getExpedientesSinMovimiento = async () => {
  const dosMesesAtras = new Date();
  dosMesesAtras.setMonth(dosMesesAtras.getMonth() - 2);
  const fechaLimite = dosMesesAtras.toISOString().split('T')[0];

  // Obtener expedientes donde la última actividad fue hace más de 2 meses
  // Consideramos: updated_at del expediente, última audiencia, último documento, último evento de agenda
  const query = `
    SELECT 
      e.*,
      c.nombre_completo as nombre_cliente,
      u.nombre as nombre_abogado,
      u.apellido as apellido_abogado,
      u.email as email_abogado,
      GREATEST(
        COALESCE(e.updated_at, e.created_at),
        COALESCE((SELECT MAX(fecha_hora) FROM audiencias WHERE expediente_id = e.id), '1970-01-01'),
        COALESCE((SELECT MAX(created_at) FROM documentos WHERE expediente_id = e.id), '1970-01-01'),
        COALESCE((SELECT MAX(fecha_hora) FROM agenda WHERE expediente_id = e.id), '1970-01-01')
      ) as ultima_actividad
    FROM expedientes e
    LEFT JOIN clientes c ON e.cliente_id = c.id
    LEFT JOIN usuarios u ON e.abogado_responsable = u.id
    WHERE e.estado = 'activo'
    HAVING DATE(ultima_actividad) < ?
    ORDER BY e.fuero ASC, ultima_actividad ASC
  `;

  const [expedientes] = await pool.query(query, [fechaLimite]);

  // Agregar días sin movimiento
  const expedientesConDias = expedientes.map(exp => {
    const ultimaActividad = new Date(exp.ultima_actividad);
    const hoy = new Date();
    const diasSinMovimiento = Math.floor((hoy - ultimaActividad) / (1000 * 60 * 60 * 24));
    
    return {
      ...exp,
      dias_sin_movimiento: diasSinMovimiento
    };
  });

  // Agrupar por fuero
  const porFuero = {};
  expedientesConDias.forEach(exp => {
    if (!porFuero[exp.fuero]) {
      porFuero[exp.fuero] = [];
    }
    porFuero[exp.fuero].push(exp);
  });

  return {
    expedientes: expedientesConDias,
    por_fuero: porFuero,
    total: expedientesConDias.length,
    fecha_limite: fechaLimite
  };
};

/**
 * Genera PDF de expedientes sin movimiento
 */
const generarPDFExpedientesSinMovimiento = async (datos) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).text('Reporte: Expedientes Sin Movimiento', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('Últimos 2 meses', { align: 'center' });
      doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' });
      doc.fontSize(10).text(`Fecha límite de actividad: ${new Date(datos.fecha_limite).toLocaleDateString('es-AR')}`, { align: 'center' });
      doc.moveDown(2);

      // Estadísticas
      doc.fontSize(14).text(`Total de expedientes sin movimiento: ${datos.total}`, { underline: true });
      doc.moveDown();

      // Por fuero
      Object.entries(datos.por_fuero).forEach(([fuero, expedientes]) => {
        const getFueroLabel = (f) => {
          const labels = {
            laboral: 'Laboral',
            civil: 'Civil',
            comercial: 'Comercial',
            penal: 'Penal',
            administrativo: 'Administrativo',
            familia: 'Familia',
            contencioso: 'Contencioso',
            otros: 'Otros'
          };
          return labels[f] || f;
        };

        doc.fontSize(12).text(`${getFueroLabel(fuero)} (${expedientes.length} expedientes)`, { underline: true });
        doc.moveDown(0.5);

        expedientes.forEach((exp, index) => {
          const ultimaActividad = new Date(exp.ultima_actividad);
          doc.fontSize(10).text(
            `${index + 1}. ${exp.numero_expediente} - ${exp.caratula.substring(0, 60)}...`
          );
          doc.text(
            `   Cliente: ${exp.nombre_cliente || 'N/A'} | Abogado: ${exp.nombre_abogado || ''} ${exp.apellido_abogado || ''}`
          );
          doc.text(
            `   Última actividad: ${ultimaActividad.toLocaleDateString('es-AR')} | Días sin movimiento: ${exp.dias_sin_movimiento}`
          );
          doc.moveDown(0.5);
        });

        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Genera PDF del reporte diario (vencimientos, audiencias, citas del día siguiente)
 */
const generarPDFReporteDiario = async (datos) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).text('Reporte Diario - Día Laboral Posterior', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Fecha: ${new Date(datos.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
      doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' });
      doc.moveDown(2);

      // Resumen
      doc.fontSize(12).text('Resumen', { underline: true });
      doc.moveDown();
      doc.fontSize(10).text(`Vencimientos: ${datos.estadisticas.total_vencimientos}`);
      doc.text(`Audiencias: ${datos.estadisticas.total_audiencias}`);
      doc.text(`Citas/Reuniones: ${datos.estadisticas.total_citas}`);
      doc.moveDown(2);

      // Vencimientos
      if (datos.vencimientos.length > 0) {
        doc.fontSize(14).text('Vencimientos', { underline: true });
        doc.moveDown();
        datos.vencimientos.forEach((v, index) => {
          doc.fontSize(10).text(`${index + 1}. ${v.titulo}`);
          doc.text(`   Expediente: ${v.numero_expediente || 'N/A'} | ${v.caratula || ''}`);
          doc.text(`   Vence: ${new Date(v.fecha_vencimiento).toLocaleDateString('es-AR')} | ${v.urgente ? 'URGENTE' : ''}`);
          if (v.descripcion) {
            doc.text(`   ${v.descripcion.substring(0, 80)}...`);
          }
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Audiencias
      if (datos.audiencias.length > 0) {
        doc.fontSize(14).text('Audiencias', { underline: true });
        doc.moveDown();
        datos.audiencias.forEach((a, index) => {
          doc.fontSize(10).text(`${index + 1}. ${a.tipo} - ${new Date(a.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
          doc.text(`   Expediente: ${a.numero_expediente || 'N/A'} | ${a.caratula || ''}`);
          doc.text(`   Sala: ${a.sala || 'N/A'} | Juez: ${a.juez || 'N/A'}`);
          if (a.observaciones) {
            doc.text(`   ${a.observaciones.substring(0, 80)}...`);
          }
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Citas/Reuniones
      if (datos.citas.length > 0) {
        doc.fontSize(14).text('Citas y Reuniones', { underline: true });
        doc.moveDown();
        datos.citas.forEach((c, index) => {
          doc.fontSize(10).text(`${index + 1}. ${c.titulo} - ${new Date(c.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
          doc.text(`   Tipo: ${c.tipo} | ${c.urgente ? 'URGENTE' : ''}`);
          if (c.numero_expediente) {
            doc.text(`   Expediente: ${c.numero_expediente} | ${c.caratula || ''}`);
          }
          if (c.descripcion) {
            doc.text(`   ${c.descripcion.substring(0, 80)}...`);
          }
          doc.moveDown(0.5);
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Obtiene datos del día siguiente para reporte diario (vencimientos, audiencias, citas)
 */
const obtenerDatosDiaSiguiente = async () => {
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const fechaManana = manana.toISOString().split('T')[0];

  // Vencimientos del día siguiente
  const [vencimientos] = await pool.query(
    `SELECT 
      a.*,
      e.numero_expediente,
      e.caratula,
      e.fuero,
      u.nombre as nombre_usuario,
      u.apellido as apellido_usuario,
      u.email as email_usuario
    FROM agenda a
    LEFT JOIN expedientes e ON a.expediente_id = e.id
    LEFT JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.tipo = 'vencimiento'
    AND a.fecha_vencimiento IS NOT NULL
    AND DATE(a.fecha_vencimiento) = ?
    AND a.completada = FALSE`,
    [fechaManana]
  );

  // Audiencias del día siguiente
  const [audiencias] = await pool.query(
    `SELECT 
      a.*,
      e.numero_expediente,
      e.caratula,
      e.fuero,
      u.nombre as nombre_usuario,
      u.apellido as apellido_usuario
    FROM audiencias a
    LEFT JOIN expedientes e ON a.expediente_id = e.id
    LEFT JOIN usuarios u ON a.usuario_id = u.id
    WHERE DATE(a.fecha_hora) = ?
    AND a.realizada = FALSE`,
    [fechaManana]
  );

  // Citas/Agenda del día siguiente (excluyendo vencimientos)
  const [citas] = await pool.query(
    `SELECT 
      a.*,
      e.numero_expediente,
      e.caratula,
      u.nombre as nombre_usuario,
      u.apellido as apellido_usuario,
      u.email as email_usuario
    FROM agenda a
    LEFT JOIN expedientes e ON a.expediente_id = e.id
    LEFT JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.tipo != 'vencimiento'
    AND DATE(a.fecha_hora) = ?
    AND a.completada = FALSE`,
    [fechaManana]
  );

  return {
    fecha: fechaManana,
    vencimientos: vencimientos.map(v => {
      const fechaVenc = new Date(v.fecha_vencimiento);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
      return {
        ...v,
        dias_restantes: diasRestantes,
        estado_vencimiento: diasRestantes < 0 ? 'vencido' : diasRestantes <= 3 ? 'critico' : 'normal'
      };
    }),
    audiencias,
    citas,
    estadisticas: {
      total_vencimientos: vencimientos.length,
      total_audiencias: audiencias.length,
      total_citas: citas.length
    }
  };
};

module.exports = {
  obtenerDatosDiaSiguiente,
  generarPDFReporteDiario,
  getReporteExpedientes,
  getReporteVencimientos,
  getReporteAudiencias,
  getReporteGeneral,
  generarPDFReporte,
  enviarReportePorCorreo,
  getExpedientesSinMovimiento,
  generarPDFExpedientesSinMovimiento
};

