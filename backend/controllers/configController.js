const { getEmailSchedule, updateEmailSchedule } = require('../services/schedulerConfigService');
const { programarJobsAutomaticos } = require('../jobs/vencimientosEmail');
const { sendEmail } = require('../services/emailService');

const horaRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

const normalizarDias = (dias) => {
  if (!dias) return undefined;
  const arreglo = Array.isArray(dias)
    ? dias
    : String(dias)
        .split(',')
        .map((d) => parseInt(d.trim(), 10));

  const validos = arreglo.filter((d) => Number.isInteger(d) && d >= 1 && d <= 31);
  return validos.length ? validos : undefined;
};

const getEmailScheduleConfig = (req, res) => {
  const config = getEmailSchedule();
  res.json(config);
};

const updateEmailScheduleConfig = (req, res, next) => {
  try {
    const { vencimientos, expedientes_inactivos } = req.body || {};

    const payload = {};

    if (vencimientos) {
      if (vencimientos.hora && !horaRegex.test(vencimientos.hora)) {
        return res.status(400).json({ error: 'El horario de vencimientos debe tener formato HH:MM (24 hs)' });
      }
      payload.vencimientos = {};
      if (vencimientos.hora) {
        payload.vencimientos.hora = vencimientos.hora;
      }
      if (vencimientos.destinatarios !== undefined) {
        // Aceptar array de user_ids (números) o emails (strings)
        const destinatarios = Array.isArray(vencimientos.destinatarios) 
          ? vencimientos.destinatarios 
          : [];
        payload.vencimientos.destinatarios = destinatarios;
      }
    }

    if (expedientes_inactivos) {
      if (expedientes_inactivos.hora && !horaRegex.test(expedientes_inactivos.hora)) {
        return res.status(400).json({ error: 'El horario de expedientes inactivos debe tener formato HH:MM (24 hs)' });
      }

      const diasNormalizados = normalizarDias(expedientes_inactivos.dias);
      payload.expedientes_inactivos = {};
      if (expedientes_inactivos.hora) {
        payload.expedientes_inactivos.hora = expedientes_inactivos.hora;
      }
      if (diasNormalizados) {
        payload.expedientes_inactivos.dias = diasNormalizados;
      }
      if (expedientes_inactivos.destinatarios !== undefined) {
        // Aceptar array de user_ids (números) o emails (strings)
        const destinatarios = Array.isArray(expedientes_inactivos.destinatarios) 
          ? expedientes_inactivos.destinatarios 
          : [];
        payload.expedientes_inactivos.destinatarios = destinatarios;
      }
    }

    if (!payload.vencimientos && !payload.expedientes_inactivos) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' });
    }

    const updatedConfig = updateEmailSchedule(payload);
    programarJobsAutomaticos(updatedConfig);

    res.json({
      message: 'Horarios de envío automático actualizados',
      config: updatedConfig
    });
  } catch (error) {
    next(error);
  }
};

const testEmailConfig = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Se requiere un email de destino para la prueba' });
    }

    // Verificar si la configuración SMTP está disponible
    const hasSmtpConfig = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    
    if (!hasSmtpConfig) {
      return res.status(400).json({ 
        error: 'Configuración SMTP no encontrada',
        message: 'Por favor, configure las variables de entorno SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASSWORD',
        configStatus: {
          SMTP_HOST: !!process.env.SMTP_HOST,
          SMTP_PORT: !!process.env.SMTP_PORT,
          SMTP_USER: !!process.env.SMTP_USER,
          SMTP_PASSWORD: !!process.env.SMTP_PASSWORD ? '***configurado***' : false
        }
      });
    }

    // Enviar email de prueba
    const testResult = await sendEmail({
      to: email,
      subject: '✅ Prueba de Configuración - Sistema de Gestión Jurídico',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0087b4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
            .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .info { background-color: #e7f3ff; border-left: 4px solid #0087b4; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Prueba de Correo Exitosa</h1>
            </div>
            <div class="content">
              <div class="success">
                <strong>¡Felicitaciones!</strong> La configuración de correo electrónico está funcionando correctamente.
              </div>
              <div class="info">
                <h3>Información de Configuración:</h3>
                <p><strong>Servidor SMTP:</strong> ${process.env.SMTP_HOST || 'No configurado'}</p>
                <p><strong>Puerto:</strong> ${process.env.SMTP_PORT || 'No configurado'}</p>
                <p><strong>Usuario:</strong> ${process.env.SMTP_USER || 'No configurado'}</p>
                <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-AR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <p>Si recibiste este correo, significa que:</p>
              <ul>
                <li>✅ Las credenciales SMTP son correctas</li>
                <li>✅ El servidor de correo está accesible</li>
                <li>✅ Los reportes automáticos funcionarán correctamente</li>
              </ul>
            </div>
            <div class="footer">
              <p>Este es un correo de prueba del Sistema de Gestión del Estudio Jurídico.</p>
              <p>Por favor, no responda a este correo.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Prueba de Configuración - Sistema de Gestión Jurídico\n\n¡Felicitaciones! La configuración de correo electrónico está funcionando correctamente.\n\nFecha de prueba: ${new Date().toLocaleString('es-AR')}\n\nSi recibiste este correo, significa que las credenciales SMTP son correctas y los reportes automáticos funcionarán correctamente.`
    });

    res.json({
      success: true,
      message: 'Correo de prueba enviado exitosamente',
      details: {
        to: email,
        messageId: testResult.messageId,
        mode: testResult.mode || 'production',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error al enviar correo de prueba:', error);
    
    // Proporcionar información detallada del error
    let errorMessage = 'Error al enviar correo de prueba';
    let errorDetails = {};

    if (error.code === 'EAUTH') {
      errorMessage = 'Error de autenticación SMTP';
      errorDetails = {
        suggestion: 'Verifique que las credenciales (SMTP_USER y SMTP_PASSWORD) sean correctas',
        commonIssues: [
          'Para Gmail: Use una "Contraseña de aplicación" en lugar de su contraseña regular',
          'Verifique que la cuenta tenga habilitada la verificación en dos pasos',
          'Confirme que SMTP_USER sea el email completo (ej: usuario@gmail.com)'
        ]
      };
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Error de conexión al servidor SMTP';
      errorDetails = {
        suggestion: 'Verifique la configuración de SMTP_HOST y SMTP_PORT',
        commonIssues: [
          `Confirme que ${process.env.SMTP_HOST} sea el servidor correcto`,
          `Verifique que el puerto ${process.env.SMTP_PORT} esté abierto`,
          'Revise su conexión a internet'
        ]
      };
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Error en la dirección de correo';
      errorDetails = {
        suggestion: 'Verifique que el email de destino sea válido'
      };
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      originalError: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getEmailScheduleConfig,
  updateEmailScheduleConfig,
  testEmailConfig
};

