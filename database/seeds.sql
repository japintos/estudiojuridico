-- =============================================================================
-- SEED DATA PARA ESTUDIO_JURIDICO (mantiene usuarios existentes)
-- Ejecutar después de tener creada la base con database/schema.sql
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE logs;
TRUNCATE TABLE escritos_generados;
TRUNCATE TABLE plantillas;
TRUNCATE TABLE documentos;
TRUNCATE TABLE audiencias;
TRUNCATE TABLE agenda;
TRUNCATE TABLE expedientes;
TRUNCATE TABLE clientes;
-- Importante: NO truncar usuarios para conservar credenciales actuales

SET FOREIGN_KEY_CHECKS = 1;

-- CLIENTES (ajustar created_by para que exista en tabla usuarios)
INSERT INTO clientes (id, tipo, nombre_completo, documento_tipo, documento_numero, email, telefono, domicilio, activo, created_by) VALUES
  (1, 'persona_fisica', 'Juan Alberto Fernández', 'DNI', '30111222', 'juanfernandez@gmail.com', '+54 11 6000-1001', 'San Juan 1234, CABA', TRUE, 1),
  (2, 'persona_fisica', 'María Eugenia Vidal', 'DNI', '28999888', 'mevidal@gmail.com', '+54 11 6000-1002', 'Dorrego 2200, Banfield', TRUE, 1),
  (3, 'persona_juridica', 'Servicios Integrales SA', 'CUIT', '30-70999888-5', 'contacto@serviciossa.com', '+54 11 6000-2000', 'Av. Leandro N. Alem 800, CABA', TRUE, 1);

-- EXPEDIENTES
INSERT INTO expedientes (id, numero_expediente, numero_carpeta_juridica, fuero, jurisdiccion, juzgado, secretaria, caratula, estado,
                         fecha_inicio, tipo_accion, monto_disputa, cliente_id, abogado_responsable, created_by) VALUES
  (1, 'EXP-2023-0001', 'CJ-1001', 'laboral', 'CABA', 'Juzgado Nacional del Trabajo Nº12', 'Sec. Única',
   'Fernández Juan c/ Servicios Integrales SA s/ Despido', 'activo', '2023-01-10', 'Despido', 2500000.00, 1, 1, 1),
  (2, 'EXP-2023-0002', 'CJ-1002', 'civil', 'Provincia de Buenos Aires', 'Juzgado Civil Nº5 Lomas', 'Sec. B',
   'Vidal María c/ Fernández Juan s/ Daños y Perjuicios', 'suspendido', '2023-03-05', 'Daños y perjuicios', 850000.00, 2, 1, 1),
  (3, 'EXP-2024-0003', 'CJ-1003', 'comercial', 'CABA', 'Juzgado Comercial Nº3', 'Sec. 2',
   'Servicios Integrales SA c/ Proveedores Unidos SRL s/ Incumplimiento contractual', 'activo', '2024-02-15', 'Cobro de pesos', 1250000.00, 3, 1, 1);

-- AUDIENCIAS
INSERT INTO audiencias (id, expediente_id, tipo, fecha_hora, sala, juez, secretario, resultado, observaciones, realizada, usuario_id) VALUES
  (1, 1, 'mediacion', '2023-03-15 09:00:00', 'Sala 1', 'Dra. Bianchi', 'Dr. López', 'En trámite', 'Se difiere para nueva fecha', FALSE, 1),
  (2, 1, 'vista_causa', '2023-09-20 11:30:00', 'Sala 2', 'Dr. Pereyra', 'Dra. Bartoli', NULL, 'Requiere presentación de nueva prueba', FALSE, 1),
  (3, 2, 'primera_audiencia', '2023-06-01 10:45:00', 'Sala A', 'Dra. Martínez', 'Dr. Carrizo', 'Sin acuerdo', 'Ambas partes ratifican demanda', TRUE, 1),
  (4, 3, 'instructiva', '2024-05-22 14:00:00', 'Sala Comercial', 'Dr. Roca', 'Dra. Viale', NULL, 'Pendiente documentación contable', FALSE, 1);

-- DOCUMENTOS (columna `tamaño_mb` respeta el esquema)
INSERT INTO documentos (id, expediente_id, nombre_original, nombre_archivo, ruta_archivo, tipo, descripcion, fecha_documento,
                        `tamaño_mb`, mime_type, uploaded_by) VALUES
  (1, 1, 'Demanda inicial.pdf', 'demanda_exp1.pdf', '/uploads/expedientes/1/demanda_exp1.pdf', 'escrito', 'Demanda presentada por actor', '2023-01-10', 0.85, 'application/pdf', 1),
  (2, 1, 'Telegrama laboral.pdf', 'telegrama_exp1.pdf', '/uploads/expedientes/1/telegrama_exp1.pdf', 'notificacion', 'Telegrama de despido', '2022-12-20', 0.42, 'application/pdf', 2),
  (3, 2, 'Denuncia civil.pdf', 'denuncia_exp2.pdf', '/uploads/expedientes/2/denuncia_exp2.pdf', 'escrito', 'Denuncia de daños', '2023-03-05', 0.73, 'application/pdf', 1),
  (4, 3, 'Contrato principal.pdf', 'contrato_exp3.pdf', '/uploads/expedientes/3/contrato_exp3.pdf', 'contrato', 'Contrato marco con proveedores', '2022-11-15', 1.25, 'application/pdf', 1);

-- PLANTILLAS
INSERT INTO plantillas (id, nombre, tipo, fuero, contenido, variables_disponibles, descripcion, activa, created_by) VALUES
  (1, 'Demanda Laboral Base', 'demanda', 'laboral',
   'Señor Juez:\n{{caratula}}\n\n{{hechos}}\n\nDerecho: {{derecho}}\n\nFirma: {{nombre_abogado}}',
   '["caratula","hechos","derecho","nombre_abogado"]', 'Modelo para demandas laborales', TRUE, 1),
  (2, 'Contestación Civil', 'contestacion', 'civil',
   'Contestación a demanda\nExpediente: {{numero_expediente}}\nCliente: {{nombre_cliente}}\nArgumentos: {{fundamentos}}',
   '["numero_expediente","nombre_cliente","fundamentos"]', 'Respuesta estándar en fuero civil', TRUE, 1);

-- ESCRITOS GENERADOS
INSERT INTO escritos_generados (id, expediente_id, plantilla_id, contenido_final, nombre_documento, generado_por, created_at) VALUES
  (1, 1, 1, 'Señor Juez:\nFernández Juan c/ Servicios Integrales SA...\nDerecho: ...\nFirma: Admin General', 'DemandaLaboral_EXP20230001.txt', 1, '2023-01-11 09:10:00'),
  (2, 2, 2, 'Contestación a demanda\nExpediente: EXP-2023-0002\nCliente: María Eugenia Vidal\nArgumentos: ...', 'ContestacionCivil_EXP20230002.txt', 2, '2023-03-06 15:30:00');

-- AGENDA
INSERT INTO agenda (id, usuario_id, titulo, descripcion, tipo, fecha_hora, fecha_vencimiento, expediente_id,
                    urgente, completada, recordatorio_enviado, created_at) VALUES
  (1, 2, 'Preparar contestación EXP-2023-0002', 'Revisar prueba documental', 'revision', '2023-05-25 09:00:00', NULL, 2, FALSE, FALSE, FALSE, '2023-05-01 08:00:00'),
  (2, 1, 'Vencimiento traslado EXP-2023-0001', 'Responder traslado dentro de 5 días', 'vencimiento', '2023-04-18 09:00:00', '2023-04-23', 1, TRUE, FALSE, FALSE, '2023-04-10 12:00:00'),
  (3, 3, 'Audiencia instructiva EXP-2024-0003', 'Coordinar perito contable', 'audiencia', '2024-05-20 14:00:00', NULL, 3, FALSE, FALSE, FALSE, '2024-04-30 10:15:00');

-- LOGS (opcional)
INSERT INTO logs (id, usuario_id, accion, modulo, descripcion, ip_address, created_at) VALUES
  (1, 1, 'LOGIN', 'Auth', 'Ingreso correcto', '127.0.0.1', '2024-01-10 08:00:00'),
  (2, 2, 'CREACION', 'Expedientes', 'Creó EXP-2023-0002', '127.0.0.1', '2024-01-15 11:23:00');

