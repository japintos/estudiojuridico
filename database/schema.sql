-- =============================================================================
-- ESTUDIO JURIDICO MULTIFUERO - ESQUEMA COMPLETO DE BASE DE DATOS
-- Desarrollado por: Julio A. Pintos - WebXpert
-- Versión: 1.0.0
-- =============================================================================

-- Crear base de datos si no existe (descomentar si no existe la BD)
-- CREATE DATABASE IF NOT EXISTS estudio_juridico 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos (descomentar si ejecutas desde línea de comandos)
-- USE estudio_juridico;

-- Eliminar tablas existentes si existen (en orden inverso por dependencias)
-- Esto permite ejecutar el script múltiples veces sin errores
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS escritos_generados;
DROP TABLE IF EXISTS plantillas;
DROP TABLE IF EXISTS documentos;
DROP TABLE IF EXISTS audiencias;
DROP TABLE IF EXISTS expedientes;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS agenda;
DROP TABLE IF EXISTS usuarios;
DROP VIEW IF EXISTS vista_expedientes_completa;
DROP VIEW IF EXISTS vista_agenda_activa;
DROP VIEW IF EXISTS vista_estadisticas_fuero;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- TABLA: usuarios
-- =============================================================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('abogado', 'secretaria', 'gestor', 'pasante') NOT NULL DEFAULT 'pasante',
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: clientes
-- =============================================================================
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('persona_fisica', 'persona_juridica') NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    razon_social VARCHAR(200),
    documento_tipo ENUM('DNI', 'CUIL', 'CUIT', 'PASAPORTE', 'LE', 'LC') NOT NULL,
    documento_numero VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    celular VARCHAR(20),
    domicilio VARCHAR(255),
    localidad VARCHAR(100),
    provincia VARCHAR(100),
    codigo_postal VARCHAR(10),
    fecha_nacimiento DATE,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_documento (documento_tipo, documento_numero),
    INDEX idx_nombre (nombre_completo, razon_social),
    INDEX idx_documento (documento_numero),
    INDEX idx_activo (activo),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: expedientes
-- =============================================================================
CREATE TABLE expedientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_expediente VARCHAR(100) UNIQUE NOT NULL,
    numero_carpeta_juridica VARCHAR(50),
    fuero ENUM('laboral', 'civil', 'comercial', 'penal', 'administrativo', 'familia', 'contencioso', 'otros') NOT NULL,
    jurisdiccion VARCHAR(100),
    juzgado VARCHAR(200),
    secretaria VARCHAR(100),
    caratula TEXT NOT NULL,
    estado ENUM('activo', 'archivado', 'suspendido', 'finalizado') DEFAULT 'activo',
    fecha_inicio DATE NOT NULL,
    fecha_archivo DATE,
    tipo_accion VARCHAR(200),
    monto_disputa DECIMAL(15,2),
    observaciones TEXT,
    cliente_id INT NOT NULL,
    abogado_responsable INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero (numero_expediente),
    INDEX idx_fuero (fuero),
    INDEX idx_estado (estado),
    INDEX idx_cliente (cliente_id),
    INDEX idx_abogado (abogado_responsable),
    INDEX idx_created_by (created_by),
    INDEX idx_fecha_inicio (fecha_inicio),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (abogado_responsable) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: audiencias
-- =============================================================================
CREATE TABLE audiencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    tipo ENUM('primera_audiencia', 'mediacion', 'instructiva', 'vista_causa', 'medidas_cautelares', 'otra') NOT NULL,
    fecha_hora DATETIME NOT NULL,
    sala VARCHAR(100),
    juez VARCHAR(200),
    secretario VARCHAR(200),
    resultado TEXT,
    observaciones TEXT,
    realizada BOOLEAN DEFAULT FALSE,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expediente (expediente_id),
    INDEX idx_fecha (fecha_hora),
    INDEX idx_tipo (tipo),
    INDEX idx_realizada (realizada),
    INDEX idx_usuario (usuario_id),
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: documentos
-- =============================================================================
CREATE TABLE documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo ENUM('escrito', 'sentencia', 'notificacion', 'poder', 'contrato', 'otro') NOT NULL,
    descripcion TEXT,
    fecha_documento DATE,
    tamaño_mb DECIMAL(10,2),
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expediente (expediente_id),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha (fecha_documento),
    INDEX idx_uploaded_by (uploaded_by),
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: plantillas
-- =============================================================================
CREATE TABLE plantillas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    tipo ENUM('demanda', 'contestacion', 'alegato', 'recurso', 'notificacion', 'otro') NOT NULL,
    fuero VARCHAR(100),
    contenido TEXT NOT NULL,
    variables_disponibles JSON,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_fuero (fuero),
    INDEX idx_activa (activa),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: escritos_generados
-- =============================================================================
CREATE TABLE escritos_generados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    plantilla_id INT NOT NULL,
    contenido_final TEXT NOT NULL,
    nombre_documento VARCHAR(255) NOT NULL,
    ruta_pdf VARCHAR(500),
    generado_por INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expediente (expediente_id),
    INDEX idx_plantilla (plantilla_id),
    INDEX idx_generado_por (generado_por),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
    FOREIGN KEY (plantilla_id) REFERENCES plantillas(id) ON DELETE RESTRICT,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: agenda
-- =============================================================================
CREATE TABLE agenda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo ENUM('reunion', 'llamada', 'revision', 'audiencia', 'vencimiento', 'otro') NOT NULL,
    fecha_hora DATETIME NOT NULL,
    fecha_vencimiento DATE,
    expediente_id INT,
    urgente BOOLEAN DEFAULT FALSE,
    completada BOOLEAN DEFAULT FALSE,
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_hora),
    INDEX idx_urgente (urgente),
    INDEX idx_completada (completada),
    INDEX idx_expediente (expediente_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA: logs
-- =============================================================================
CREATE TABLE logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_modulo (modulo),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

-- Usuario administrador por defecto
-- Contraseña para ambos usuarios: admin
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, telefono, activo) VALUES
('Admin', 'Sistema', 'admin@estudiojuridico.com', '$2b$10$ci5TlcY.DbgWGW.eZoQxnedZS6a6iIrkFMhYL6ifDezDQ0nh.3wze', 'abogado', '+54 11 1234-5678', TRUE),
('Julio', 'Pintos', 'julio@webxpert.com.ar', '$2b$10$ci5TlcY.DbgWGW.eZoQxnedZS6a6iIrkFMhYL6ifDezDQ0nh.3wze', 'abogado', '+54 11 4321-8765', TRUE);

-- Plantillas de ejemplo
INSERT INTO plantillas (nombre, tipo, fuero, contenido, variables_disponibles, descripcion, activa, created_by) VALUES
('Demanda Laboral', 'demanda', 'laboral', 
'{{caratula}}

{{juzgado}}
{{secretaria}}

DEMANDA

{{nombre_cliente}}, DNI {{dni_cliente}}, comparece ante este juzgado para deducir demanda en contra de {{demandado}} por despido y diferencias salariales.

HECHOS:

{{hechos}}

DERECHO:

{{derecho}}

Por lo expuesto, solicito se tenga por presentada la presente demanda y se cite a ambas partes a una audiencia de mediación.

{{fecha}}
{{nombre_abogado}}
{{matricula}}',
'["caratula", "juzgado", "secretaria", "nombre_cliente", "dni_cliente", "demandado", "hechos", "derecho", "fecha", "nombre_abogado", "matricula"]',
'Plantilla básica para demanda laboral',
TRUE,
1),
('Alegato', 'alegato', 'general',
'ALEGATO

{{caratula}}

{{juzgado}}
{{secretaria}}

{{fecha}}

Vengo a presentar el presente alegato en el marco de la causa {{numero_expediente}}.

FUNDAMENTOS:

{{fundamentos}}

CONCLUSIONES:

{{conclusiones}}

{{nombre_abogado}}
{{matricula}}',
'["caratula", "juzgado", "secretaria", "fecha", "numero_expediente", "fundamentos", "conclusiones", "nombre_abogado", "matricula"]',
'Plantilla de alegato general',
TRUE,
1);

-- =============================================================================
-- TRIGGERS Y VALIDACIONES
-- =============================================================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS validar_fecha_audiencia;

-- Trigger para validar que no se agende una audiencia en feriados (ejemplo simplificado)
DELIMITER $$

CREATE TRIGGER validar_fecha_audiencia
BEFORE INSERT ON audiencias
FOR EACH ROW
BEGIN
    DECLARE dia_semana INT;
    SET dia_semana = DAYOFWEEK(NEW.fecha_hora);
    
    -- No permitir audiencias los domingos (día 1) y sábados (día 7)
    IF dia_semana = 1 OR dia_semana = 7 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se pueden programar audiencias los fines de semana';
    END IF;
END$$

DELIMITER ;

-- =============================================================================
-- VISTAS ÚTILES
-- =============================================================================

-- Vista de expedientes con información completa
CREATE VIEW vista_expedientes_completa AS
SELECT 
    e.id,
    e.numero_expediente,
    e.fuero,
    e.estado,
    e.caratula,
    e.fecha_inicio,
    c.nombre_completo as cliente_nombre,
    c.documento_numero as cliente_dni,
    u.nombre as abogado_nombre,
    u.apellido as abogado_apellido,
    COUNT(DISTINCT d.id) as cantidad_documentos,
    COUNT(DISTINCT a.id) as cantidad_audiencias,
    MAX(a.fecha_hora) as ultima_audiencia
FROM expedientes e
LEFT JOIN clientes c ON e.cliente_id = c.id
LEFT JOIN usuarios u ON e.abogado_responsable = u.id
LEFT JOIN documentos d ON e.id = d.expediente_id
LEFT JOIN audiencias a ON e.id = a.expediente_id
GROUP BY e.id;

-- Vista de agenda activa
CREATE VIEW vista_agenda_activa AS
SELECT 
    a.id,
    a.titulo,
    a.descripcion,
    a.tipo,
    a.fecha_hora,
    a.urgente,
    a.completada,
    u.nombre as usuario_nombre,
    u.apellido as usuario_apellido,
    e.numero_expediente,
    e.caratula
FROM agenda a
LEFT JOIN usuarios u ON a.usuario_id = u.id
LEFT JOIN expedientes e ON a.expediente_id = e.id
WHERE a.completada = FALSE
ORDER BY a.fecha_hora ASC;

-- Vista de estadísticas por fuero
CREATE VIEW vista_estadisticas_fuero AS
SELECT 
    fuero,
    COUNT(*) as total_expedientes,
    SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN estado = 'finalizado' THEN 1 ELSE 0 END) as finalizados,
    SUM(CASE WHEN estado = 'archivado' THEN 1 ELSE 0 END) as archivados,
    AVG(DATEDIFF(COALESCE(fecha_archivo, CURDATE()), fecha_inicio)) as promedio_dias
FROM expedientes
GROUP BY fuero;

-- =============================================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =============================================================================

CREATE FULLTEXT INDEX idx_caratula ON expedientes(caratula);
CREATE FULLTEXT INDEX idx_observaciones_exp ON expedientes(observaciones);
CREATE FULLTEXT INDEX idx_observaciones_cliente ON clientes(observaciones);

-- =============================================================================
-- FIN DEL ESQUEMA
-- =============================================================================

