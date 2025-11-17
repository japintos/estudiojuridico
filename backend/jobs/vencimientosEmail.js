const cron = require('node-cron');
const pool = require('../config/database');
const { getEmailSchedule } = require('../services/schedulerConfigService');

// Importaciones con manejo de errores
let sendVencimientoEmail, sendExpedientesSinMovimientoEmail, sendReporteDiarioEmail;
let getExpedientesSinMovimiento, generarPDFExpedientesSinMovimiento;
let obtenerDatosDiaSiguiente, generarPDFReporteDiario;

try {
  const emailService = require('../services/emailService');
  sendVencimientoEmail = emailService.sendVencimientoEmail;
  sendExpedientesSinMovimientoEmail = emailService.sendExpedientesSinMovimientoEmail;
  sendReporteDiarioEmail = emailService.sendReporteDiarioEmail;
} catch (error) {
  console.error('⚠️ Error al cargar emailService:', error.message);
}

try {
  const reportesController = require('../controllers/reportesController');
  getExpedientesSinMovimiento = reportesController.getExpedientesSinMovimiento;
  generarPDFExpedientesSinMovimiento = reportesController.generarPDFExpedientesSinMovimiento;
  obtenerDatosDiaSiguiente = reportesController.obtenerDatosDiaSiguiente;
  generarPDFReporteDiario = reportesController.generarPDFReporteDiario;
} catch (error) {
  console.error('⚠️ Error al cargar reportesController:', error.message);
}

const cronJobs = {
  vencimientos: null,
  expedientesInactivos: null
};

const horaRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

const parseHora = (hora, fallback = '08:00') => {
  const valor = horaRegex.test(hora || '') ? hora : fallback;
  const [hours, minutes] = valor.split(':').map((value) => parseInt(value, 10));
  return { hours, minutes };
};

const limpiarDias = (dias = []) => {
  const normalizados = Array.isArray(dias)
    ? dias
    : String(dias)
        .split(',')
        .map((d) => parseInt(d.trim(), 10));

  const validos = normalizados.filter((d) => Number.isInteger(d) && d >= 1 && d <= 31);
  return validos.length > 0 ? validos : [1, 16];
};

const detenerJob = (key) => {
  if (cronJobs[key]) {
    cronJobs[key].stop();
    cronJobs[key] = null;
  }
};

const crearExpresionCronDiaria = ({ hours, minutes }) => `${minutes} ${hours} * * *`;
const crearExpresionCronMensual = ({ hours, minutes }, dias) => `${minutes} ${hours} ${dias.join(',')} * *`;

const ejecutarEnvioVencimientos = async () => {
  try {
    console.log('📧 Ejecutando job de reporte diario (vencimientos, audiencias, citas)...');

    // Obtener datos del día siguiente
    if (!obtenerDatosDiaSiguiente || !generarPDFReporteDiario || !sendReporteDiarioEmail) {
      console.log('⚠️ Funciones de reporte diario no disponibles, usando método anterior');
      // Fallback al método anterior
      const hoy = new Date();
      const en7Dias = new Date();
      en7Dias.setDate(hoy.getDate() + 7);

      const [vencimientos] = await pool.query(
        `SELECT 
            a.*,
            e.numero_expediente,
            e.caratula,
            u.email as email_usuario,
            u.nombre as nombre_usuario,
            u.apellido as apellido_usuario
          FROM agenda a
          LEFT JOIN expedientes e ON a.expediente_id = e.id
          LEFT JOIN usuarios u ON a.usuario_id = u.id
          WHERE a.tipo = 'vencimiento'
          AND a.fecha_vencimiento IS NOT NULL
          AND DATE(a.fecha_vencimiento) BETWEEN ? AND ?
          AND a.completada = FALSE
          AND u.email IS NOT NULL
          AND u.activo = TRUE`,
        [hoy.toISOString().split('T')[0], en7Dias.toISOString().split('T')[0]]
      );

      console.log(`📧 Encontrados ${vencimientos.length} vencimientos próximos`);

      let enviados = 0;
      let errores = 0;

      for (const vencimiento of vencimientos) {
        try {
          if (vencimiento.email_usuario && sendVencimientoEmail) {
            await sendVencimientoEmail(
              {
                titulo: vencimiento.titulo,
                descripcion: vencimiento.descripcion,
                fecha_vencimiento: vencimiento.fecha_vencimiento,
                numero_expediente: vencimiento.numero_expediente,
                caratula: vencimiento.caratula,
                tipo: vencimiento.tipo,
                urgente: vencimiento.urgente
              },
              vencimiento.email_usuario
            );

            enviados++;
            console.log(`✅ Correo enviado a ${vencimiento.email_usuario} para vencimiento ${vencimiento.id}`);
          }
        } catch (error) {
          errores++;
          console.error(`❌ Error al enviar correo para vencimiento ${vencimiento.id}:`, error.message);
        }
      }

      console.log(`📧 Job completado: ${enviados} enviados, ${errores} errores`);
      return;
    }

    // Nuevo método: reporte diario combinado
    const datos = await obtenerDatosDiaSiguiente();
    
    if (datos.estadisticas.total_vencimientos === 0 && 
        datos.estadisticas.total_audiencias === 0 && 
        datos.estadisticas.total_citas === 0) {
      console.log('📧 No hay actividades programadas para el día siguiente');
      return;
    }

    console.log(`📧 Actividades del día siguiente: ${datos.estadisticas.total_vencimientos} vencimientos, ${datos.estadisticas.total_audiencias} audiencias, ${datos.estadisticas.total_citas} citas`);

    // Obtener destinatarios configurados
    const schedule = getEmailSchedule();
    const destinatariosConfig = schedule.vencimientos?.destinatarios || [];
    
    let emailsDestinatarios = [];
    
    if (destinatariosConfig.length > 0) {
      // Si hay destinatarios configurados, obtener sus emails
      const userIds = destinatariosConfig.filter(d => typeof d === 'number' || /^\d+$/.test(String(d)));
      const emailsDirectos = destinatariosConfig.filter(d => typeof d === 'string' && d.includes('@'));
      
      if (userIds.length > 0) {
        const [usuarios] = await pool.query(
          `SELECT email FROM usuarios WHERE id IN (?) AND activo = TRUE AND email IS NOT NULL`,
          [userIds]
        );
        emailsDestinatarios.push(...usuarios.map(u => u.email));
      }
      
      emailsDestinatarios.push(...emailsDirectos);
    } else {
      // Si no hay destinatarios configurados, usar todos los usuarios activos con email
      const [usuarios] = await pool.query(
        `SELECT email FROM usuarios 
         WHERE activo = TRUE 
         AND email IS NOT NULL
         AND rol IN ('abogado', 'secretaria')`
      );
      emailsDestinatarios = usuarios.map(u => u.email);
    }

    if (emailsDestinatarios.length === 0) {
      console.log('⚠️ No hay destinatarios configurados para el reporte diario');
      return;
    }

    // Eliminar duplicados
    emailsDestinatarios = [...new Set(emailsDestinatarios)];

    // Generar PDF
    const pdfBuffer = await generarPDFReporteDiario(datos);

    // Enviar correo
    const resultados = await sendReporteDiarioEmail(datos, emailsDestinatarios, pdfBuffer);

    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success);

    console.log(`📧 Reporte diario enviado: ${exitosos} exitosos, ${fallidos.length} fallidos`);
    if (fallidos.length > 0) {
      fallidos.forEach(f => {
        console.error(`❌ Error al enviar a ${f.email}:`, f.error);
      });
    }
  } catch (error) {
    console.error('❌ Error en job de reporte diario:', error);
  }
};

const ejecutarEnvioExpedientesInactivos = async () => {
  if (!getExpedientesSinMovimiento || !generarPDFExpedientesSinMovimiento || !sendExpedientesSinMovimientoEmail) {
    console.log('⚠️ Job de expedientes sin movimiento no disponible (dependencias faltantes)');
    return;
  }

  try {
    console.log('📧 Ejecutando job de expedientes sin movimiento...');

    const datos = await getExpedientesSinMovimiento();

    if (datos.total === 0) {
      console.log('📧 No hay expedientes sin movimiento para reportar');
      return;
    }

    console.log(`📧 Encontrados ${datos.total} expedientes sin movimiento`);

    // Obtener destinatarios configurados
    const schedule = getEmailSchedule();
    const destinatariosConfig = schedule.expedientes_inactivos?.destinatarios || [];
    
    let emailsDestinatarios = [];
    
    if (destinatariosConfig.length > 0) {
      // Si hay destinatarios configurados, obtener sus emails
      // Pueden ser user_ids (números) o emails (strings)
      const userIds = destinatariosConfig.filter(d => typeof d === 'number' || /^\d+$/.test(String(d)));
      const emailsDirectos = destinatariosConfig.filter(d => typeof d === 'string' && d.includes('@'));
      
      if (userIds.length > 0) {
        const [usuarios] = await pool.query(
          `SELECT email FROM usuarios WHERE id IN (?) AND activo = TRUE AND email IS NOT NULL`,
          [userIds]
        );
        emailsDestinatarios.push(...usuarios.map(u => u.email));
      }
      
      emailsDestinatarios.push(...emailsDirectos);
    } else {
      // Si no hay destinatarios configurados, usar comportamiento por defecto (todos los abogados y secretarias)
      const [usuarios] = await pool.query(
        `SELECT email FROM usuarios 
         WHERE rol IN ('abogado', 'secretaria') 
         AND activo = TRUE 
         AND email IS NOT NULL`
      );
      emailsDestinatarios = usuarios.map(u => u.email);
    }

    if (emailsDestinatarios.length === 0) {
      console.log('⚠️ No hay destinatarios configurados para el reporte de expedientes sin movimiento');
      return;
    }

    // Eliminar duplicados
    emailsDestinatarios = [...new Set(emailsDestinatarios)];

    const pdfBuffer = await generarPDFExpedientesSinMovimiento(datos);

    let enviados = 0;
    let errores = 0;

    for (const email of emailsDestinatarios) {
      try {
        await sendExpedientesSinMovimientoEmail(datos, email, pdfBuffer);
        enviados++;
        console.log(`✅ Reporte enviado a ${email}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error al enviar reporte a ${email}:`, error.message);
      }
    }

    console.log(`📧 Job de expedientes sin movimiento completado: ${enviados} enviados, ${errores} errores`);
  } catch (error) {
    console.error('❌ Error en job de expedientes sin movimiento:', error);
  }
};

const programarJobsAutomaticos = (config) => {
  const schedule = config || getEmailSchedule();

  // Job diario de vencimientos
  const horaVencimientos = parseHora(schedule.vencimientos?.hora, '08:00');
  const expresionVencimientos = crearExpresionCronDiaria(horaVencimientos);
  detenerJob('vencimientos');
  cronJobs.vencimientos = cron.schedule(expresionVencimientos, ejecutarEnvioVencimientos, {
    scheduled: true,
    timezone: 'America/Argentina/Buenos_Aires'
  });
  console.log(`📅 Job de vencimientos programado a las ${horaVencimientos.hours}:${horaVencimientos.minutes.toString().padStart(2, '0')}hs`);

  // Job de expedientes sin movimiento (solo si dependencias listas)
  if (getExpedientesSinMovimiento && generarPDFExpedientesSinMovimiento && sendExpedientesSinMovimientoEmail) {
    const horaExpedientes = parseHora(schedule.expedientes_inactivos?.hora, '08:30');
    const dias = limpiarDias(schedule.expedientes_inactivos?.dias);
    const expresionExpedientes = crearExpresionCronMensual(horaExpedientes, dias);
    detenerJob('expedientesInactivos');
    cronJobs.expedientesInactivos = cron.schedule(expresionExpedientes, ejecutarEnvioExpedientesInactivos, {
      scheduled: true,
      timezone: 'America/Argentina/Buenos_Aires'
    });
    console.log(
      `📅 Job de expedientes sin movimiento programado a las ${horaExpedientes.hours}:${horaExpedientes.minutes
        .toString()
        .padStart(2, '0')}hs los días ${dias.join(', ')}`
    );
  } else {
    console.log('⚠️ Job de expedientes sin movimiento no disponible (dependencias faltantes)');
  }
};

const iniciarJobVencimientos = () => {
  console.log('📧 Jobs automáticos de reportes iniciando...');
  programarJobsAutomaticos();
};

/**
 * Ejecuta el job manualmente (útil para testing)
 */
const ejecutarJobVencimientos = async () => {
  try {
    console.log('📧 Ejecutando job de vencimientos manualmente...');
    
    const hoy = new Date();
    const en7Dias = new Date();
    en7Dias.setDate(hoy.getDate() + 7);
    
    const [vencimientos] = await pool.query(
      `SELECT 
        a.*,
        e.numero_expediente,
        e.caratula,
        u.email as email_usuario,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario
      FROM agenda a
      LEFT JOIN expedientes e ON a.expediente_id = e.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tipo = 'vencimiento'
      AND a.fecha_vencimiento IS NOT NULL
      AND DATE(a.fecha_vencimiento) BETWEEN ? AND ?
      AND a.completada = FALSE
      AND u.email IS NOT NULL
      AND u.activo = TRUE`,
      [hoy.toISOString().split('T')[0], en7Dias.toISOString().split('T')[0]]
    );

    let enviados = 0;
    for (const vencimiento of vencimientos) {
      if (vencimiento.email_usuario && sendVencimientoEmail) {
        await sendVencimientoEmail({
          titulo: vencimiento.titulo,
          descripcion: vencimiento.descripcion,
          fecha_vencimiento: vencimiento.fecha_vencimiento,
          numero_expediente: vencimiento.numero_expediente,
          caratula: vencimiento.caratula,
          tipo: vencimiento.tipo,
          urgente: vencimiento.urgente
        }, vencimiento.email_usuario);
        enviados++;
      }
    }

    console.log(`📧 Job manual completado: ${enviados} correos enviados`);
    return { enviados, total: vencimientos.length };
  } catch (error) {
    console.error('❌ Error en job manual de vencimientos:', error);
    throw error;
  }
};

/**
 * Ejecuta el job de expedientes sin movimiento manualmente (útil para testing)
 */
const ejecutarJobExpedientesSinMovimiento = async () => {
  try {
    if (!getExpedientesSinMovimiento || !generarPDFExpedientesSinMovimiento || !sendExpedientesSinMovimientoEmail) {
      throw new Error('Dependencias no disponibles');
    }
    
    console.log('📧 Ejecutando job de expedientes sin movimiento manualmente...');
    
    // Obtener expedientes sin movimiento
    const datos = await getExpedientesSinMovimiento();
    
    if (datos.total === 0) {
      console.log('📧 No hay expedientes sin movimiento para reportar');
      return { enviados: 0, total: 0 };
    }

    // Obtener todos los usuarios abogados y secretarias activos con email
    const [usuarios] = await pool.query(
      `SELECT id, nombre, apellido, email 
       FROM usuarios 
       WHERE rol IN ('abogado', 'secretaria') 
       AND activo = TRUE 
       AND email IS NOT NULL`
    );

    // Generar PDF
    const pdfBuffer = await generarPDFExpedientesSinMovimiento(datos);

    // Enviar correo a cada usuario
    let enviados = 0;
    for (const usuario of usuarios) {
      try {
        await sendExpedientesSinMovimientoEmail(datos, usuario.email, pdfBuffer);
        enviados++;
      } catch (error) {
        console.error(`❌ Error al enviar a ${usuario.email}:`, error.message);
      }
    }

    console.log(`📧 Job manual completado: ${enviados} correos enviados`);
    return { enviados, total: datos.total };
  } catch (error) {
    console.error('❌ Error en job manual de expedientes sin movimiento:', error);
    throw error;
  }
};

module.exports = {
  iniciarJobVencimientos,
  programarJobsAutomaticos,
  ejecutarJobVencimientos,
  ejecutarJobExpedientesSinMovimiento
};

