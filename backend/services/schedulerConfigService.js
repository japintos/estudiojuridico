const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/emailSchedule.json');

const DEFAULT_CONFIG = {
  vencimientos: {
    hora: '08:00',
    destinatarios: [] // Array de user_ids o emails
  },
  expedientes_inactivos: {
    hora: '08:30',
    dias: [1, 16],
    destinatarios: [] // Array de user_ids o emails
  }
};

const ensureConfigFile = () => {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
  }
};

const mergeConfig = (config) => ({
  vencimientos: {
    ...DEFAULT_CONFIG.vencimientos,
    ...(config?.vencimientos || {})
  },
  expedientes_inactivos: {
    ...DEFAULT_CONFIG.expedientes_inactivos,
    ...(config?.expedientes_inactivos || {})
  }
});

const getEmailSchedule = () => {
  try {
    ensureConfigFile();
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = raw ? JSON.parse(raw) : DEFAULT_CONFIG;
    return mergeConfig(parsed);
  } catch (error) {
    console.error('⚠️ No se pudo leer emailSchedule.json, usando configuración por defecto:', error.message);
    ensureConfigFile();
    return { ...DEFAULT_CONFIG };
  }
};

const updateEmailSchedule = (updates) => {
  const current = getEmailSchedule();
  const merged = mergeConfig({
    vencimientos: {
      ...current.vencimientos,
      ...(updates?.vencimientos || {})
    },
    expedientes_inactivos: {
      ...current.expedientes_inactivos,
      ...(updates?.expedientes_inactivos || {})
    }
  });

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
};

module.exports = {
  getEmailSchedule,
  updateEmailSchedule,
  DEFAULT_CONFIG
};

