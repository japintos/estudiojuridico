const nodemailer = require('nodemailer');

// Configuración del transporter de correo
const createTransporter = () => {
  // Configuración desde variables de entorno
  // Por defecto usa Gmail, pero puede configurarse para otros servicios
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  return transporter;
};

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Contenido HTML
 * @param {string} options.text - Contenido texto plano (opcional)
 * @param {Array} options.attachments - Archivos adjuntos (opcional)
 */
const sendEmail = async (options) => {
  try {
    // Si no hay configuración de correo, solo loguear (modo desarrollo)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('📧 [MODO DESARROLLO] Correo no enviado - Configuración SMTP no encontrada');
      console.log('📧 Destinatario:', options.to);
      console.log('📧 Asunto:', options.subject);
      return { success: true, mode: 'development' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Estudio Jurídico" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error;
  }
};

/**
 * Envía un correo de vencimiento judicial
 * @param {Object} vencimiento - Datos del vencimiento
 * @param {string} destinatario - Email del destinatario
 */
const sendVencimientoEmail = async (vencimiento, destinatario) => {
  const fechaVencimiento = new Date(vencimiento.fecha_vencimiento);
  const diasRestantes = Math.ceil((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0087b4; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #ff6b35; }
        .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .urgent { background-color: #f8d7da; border: 1px solid #dc3545; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #0087b4; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Alerta de Vencimiento Judicial</h1>
        </div>
        <div class="content">
          <div class="${vencimiento.urgente ? 'alert urgent' : 'alert'}">
            <h2 style="margin-top: 0;">${vencimiento.titulo}</h2>
            <p><strong>Días restantes:</strong> ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}</p>
            ${diasRestantes <= 3 ? '<p style="color: #dc3545; font-weight: bold;">⚠️ VENCIMIENTO PRÓXIMO - ACCIÓN REQUERIDA</p>' : ''}
          </div>
          
          <div class="info-row">
            <span class="label">Expediente:</span> ${vencimiento.numero_expediente || 'N/A'}
          </div>
          <div class="info-row">
            <span class="label">Carátula:</span> ${vencimiento.caratula || 'N/A'}
          </div>
          <div class="info-row">
            <span class="label">Tipo de Vencimiento:</span> ${vencimiento.tipo_vencimiento || vencimiento.tipo || 'N/A'}
          </div>
          <div class="info-row">
            <span class="label">Fecha de Vencimiento:</span> ${fechaVencimiento.toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          ${vencimiento.descripcion ? `
          <div class="info-row">
            <span class="label">Descripción:</span>
            <p>${vencimiento.descripcion.replace(/\n/g, '<br>')}</p>
          </div>
          ` : ''}
          
          <p style="margin-top: 20px;">
            <strong>Importante:</strong> Los vencimientos judiciales son plazos críticos. 
            El incumplimiento puede acarrear consecuencias procesales adversas.
          </p>
        </div>
        <div class="footer">
          <p>Este es un correo automático del Sistema de Gestión del Estudio Jurídico.</p>
          <p>Por favor, no responda a este correo.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: destinatario,
    subject: `⚠️ Vencimiento Judicial: ${vencimiento.numero_expediente || 'Sin expediente'} - ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} restantes`,
    html: html
  });
};

/**
 * Envía un reporte por correo
 * @param {Object} reporte - Datos del reporte
 * @param {string|string[]} destinatarios - Email(s) del destinatario(s)
 * @param {Buffer} pdfBuffer - Buffer del PDF (opcional)
 */
const sendReporteEmail = async (reporte, destinatarios, pdfBuffer = null) => {
  // Normalizar a array
  const emails = Array.isArray(destinatarios) ? destinatarios : [destinatarios];
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0087b4; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #0087b4; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Reporte del Estudio Jurídico</h1>
        </div>
        <div class="content">
          <h2>${reporte.titulo}</h2>
          <div class="info-row">
            <span class="label">Período:</span> ${reporte.fecha_desde} - ${reporte.fecha_hasta}
          </div>
          <div class="info-row">
            <span class="label">Generado el:</span> ${new Date().toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          
          ${reporte.resumen ? `
          <h3>Resumen</h3>
          <p>${reporte.resumen}</p>
          ` : ''}
          
          ${pdfBuffer ? `
          <p>El reporte completo en formato PDF se encuentra adjunto a este correo.</p>
          ` : ''}
        </div>
        <div class="footer">
          <p>Este es un correo automático del Sistema de Gestión del Estudio Jurídico.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = pdfBuffer ? [{
    filename: `reporte_${reporte.tipo}_${Date.now()}.pdf`,
    content: pdfBuffer
  }] : [];

  // Enviar a todos los destinatarios
  const resultados = [];
  for (const email of emails) {
    try {
      const resultado = await sendEmail({
        to: email,
        subject: `📊 Reporte: ${reporte.titulo}`,
        html: html,
        attachments: attachments
      });
      resultados.push({ email, success: true, messageId: resultado.messageId });
    } catch (error) {
      resultados.push({ email, success: false, error: error.message });
    }
  }

  return resultados;
};

/**
 * Envía un correo con reporte de expedientes sin movimiento
 * @param {Object} datos - Datos del reporte de expedientes sin movimiento
 * @param {string} destinatario - Email del destinatario
 * @param {Buffer} pdfBuffer - Buffer del PDF
 */
const sendExpedientesSinMovimientoEmail = async (datos, destinatario, pdfBuffer) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .fuero-section { margin: 15px 0; padding: 10px; background-color: white; border-left: 4px solid #ff6b35; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Reporte: Expedientes Sin Movimiento</h1>
        </div>
        <div class="content">
          <div class="alert">
            <h2 style="margin-top: 0;">Expedientes sin actividad en los últimos 3 meses</h2>
            <p><strong>Total:</strong> ${datos.total} expedientes</p>
            <p><strong>Fecha límite de actividad:</strong> ${new Date(datos.fecha_limite).toLocaleDateString('es-AR')}</p>
          </div>
          
          <h3>Resumen por Fuero:</h3>
          ${Object.entries(datos.por_fuero).map(([fuero, expedientes]) => {
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
            return `
              <div class="fuero-section">
                <strong>${getFueroLabel(fuero)}:</strong> ${expedientes.length} expedientes
              </div>
            `;
          }).join('')}
          
          <p style="margin-top: 20px;">
            <strong>Importante:</strong> Revise el archivo PDF adjunto para ver el detalle completo de cada expediente, 
            incluyendo días sin movimiento, cliente y abogado responsable.
          </p>
        </div>
        <div class="footer">
          <p>Este es un correo automático del Sistema de Gestión del Estudio Jurídico.</p>
          <p>Se envía cada 15 días para mantener el control de expedientes activos.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = pdfBuffer ? [{
    filename: `reporte_expedientes_sin_movimiento_${Date.now()}.pdf`,
    content: pdfBuffer
  }] : [];

  return await sendEmail({
    to: destinatario,
    subject: `⚠️ Reporte: ${datos.total} Expedientes Sin Movimiento (Últimos 3 meses)`,
    html: html,
    attachments: attachments
  });
};

module.exports = {
  sendEmail,
  sendVencimientoEmail,
  sendReporteEmail,
  sendExpedientesSinMovimientoEmail
};

