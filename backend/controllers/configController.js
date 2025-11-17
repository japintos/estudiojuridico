const { getEmailSchedule, updateEmailSchedule } = require('../services/schedulerConfigService');
const { programarJobsAutomaticos } = require('../jobs/vencimientosEmail');

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

module.exports = {
  getEmailScheduleConfig,
  updateEmailScheduleConfig
};

