-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.7.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para estudio_juridico
CREATE DATABASE IF NOT EXISTS `estudio_juridico` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `estudio_juridico`;

-- Volcando estructura para tabla estudio_juridico.agenda
CREATE TABLE IF NOT EXISTS `agenda` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('reunion','llamada','revision','audiencia','vencimiento','otro') NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `expediente_id` int(11) DEFAULT NULL,
  `urgente` tinyint(1) DEFAULT 0,
  `completada` tinyint(1) DEFAULT 0,
  `recordatorio_enviado` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_fecha` (`fecha_hora`),
  KEY `idx_urgente` (`urgente`),
  KEY `idx_completada` (`completada`),
  KEY `idx_expediente` (`expediente_id`),
  CONSTRAINT `agenda_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agenda_ibfk_2` FOREIGN KEY (`expediente_id`) REFERENCES `expedientes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.agenda: ~0 rows (aproximadamente)

-- Volcando estructura para tabla estudio_juridico.audiencias
CREATE TABLE IF NOT EXISTS `audiencias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expediente_id` int(11) NOT NULL,
  `tipo` enum('primera_audiencia','mediacion','instructiva','vista_causa','medidas_cautelares','otra') NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `sala` varchar(100) DEFAULT NULL,
  `juez` varchar(200) DEFAULT NULL,
  `secretario` varchar(200) DEFAULT NULL,
  `resultado` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `realizada` tinyint(1) DEFAULT 0,
  `usuario_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_expediente` (`expediente_id`),
  KEY `idx_fecha` (`fecha_hora`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_realizada` (`realizada`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `audiencias_ibfk_1` FOREIGN KEY (`expediente_id`) REFERENCES `expedientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audiencias_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.audiencias: ~0 rows (aproximadamente)

-- Volcando estructura para tabla estudio_juridico.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('persona_fisica','persona_juridica') NOT NULL,
  `nombre_completo` varchar(200) NOT NULL,
  `razon_social` varchar(200) DEFAULT NULL,
  `documento_tipo` enum('DNI','CUIL','CUIT','PASAPORTE','LE','LC') NOT NULL,
  `documento_numero` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `domicilio` varchar(255) DEFAULT NULL,
  `localidad` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_documento` (`documento_tipo`,`documento_numero`),
  KEY `idx_nombre` (`nombre_completo`,`razon_social`),
  KEY `idx_documento` (`documento_numero`),
  KEY `idx_activo` (`activo`),
  KEY `idx_created_by` (`created_by`),
  FULLTEXT KEY `idx_observaciones_cliente` (`observaciones`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.clientes: ~0 rows (aproximadamente)

-- Volcando estructura para tabla estudio_juridico.documentos
CREATE TABLE IF NOT EXISTS `documentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expediente_id` int(11) DEFAULT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tipo` enum('escrito','sentencia','notificacion','poder','contrato','otro') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_documento` date DEFAULT NULL,
  `tamaño_mb` decimal(10,2) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT 'application/pdf',
  `uploaded_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_expediente` (`expediente_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fecha` (`fecha_documento`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`expediente_id`) REFERENCES `expedientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documentos_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.documentos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla estudio_juridico.escritos_generados
CREATE TABLE IF NOT EXISTS `escritos_generados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expediente_id` int(11) NOT NULL,
  `plantilla_id` int(11) NOT NULL,
  `contenido_final` text NOT NULL,
  `nombre_documento` varchar(255) NOT NULL,
  `ruta_pdf` varchar(500) DEFAULT NULL,
  `generado_por` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_expediente` (`expediente_id`),
  KEY `idx_plantilla` (`plantilla_id`),
  KEY `idx_generado_por` (`generado_por`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `escritos_generados_ibfk_1` FOREIGN KEY (`expediente_id`) REFERENCES `expedientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `escritos_generados_ibfk_2` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas` (`id`),
  CONSTRAINT `escritos_generados_ibfk_3` FOREIGN KEY (`generado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.escritos_generados: ~0 rows (aproximadamente)

-- Volcando estructura para tabla estudio_juridico.expedientes
CREATE TABLE IF NOT EXISTS `expedientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_expediente` varchar(100) NOT NULL,
  `numero_carpeta_juridica` varchar(50) DEFAULT NULL,
  `fuero` enum('laboral','civil','comercial','penal','administrativo','familia','contencioso','otros') NOT NULL,
  `jurisdiccion` varchar(100) DEFAULT NULL,
  `juzgado` varchar(200) DEFAULT NULL,
  `secretaria` varchar(100) DEFAULT NULL,
  `caratula` text NOT NULL,
  `estado` enum('activo','archivado','suspendido','finalizado') DEFAULT 'activo',
  `fecha_inicio` date NOT NULL,
  `fecha_archivo` date DEFAULT NULL,
  `tipo_accion` varchar(200) DEFAULT NULL,
  `monto_disputa` decimal(15,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `cliente_id` int(11) NOT NULL,
  `abogado_responsable` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_expediente` (`numero_expediente`),
  KEY `idx_numero` (`numero_expediente`),
  KEY `idx_fuero` (`fuero`),
  KEY `idx_estado` (`estado`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_abogado` (`abogado_responsable`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  FULLTEXT KEY `idx_caratula` (`caratula`),
  FULLTEXT KEY `idx_observaciones_exp` (`observaciones`),
  CONSTRAINT `expedientes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `expedientes_ibfk_2` FOREIGN KEY (`abogado_responsable`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `expedientes_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.expedientes: ~0 rows (aproximadamente)

-- Volcando estructura para tabla estudio_juridico.logs
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `modulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_accion` (`accion`),
  KEY `idx_modulo` (`modulo`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.logs: ~13 rows (aproximadamente)
INSERT INTO `logs` (`id`, `usuario_id`, `accion`, `modulo`, `descripcion`, `ip_address`, `user_agent`, `created_at`) VALUES
	(1, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-03 14:16:05'),
	(2, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-03 14:16:51'),
	(3, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-03 14:17:27'),
	(4, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-03 14:20:01'),
	(5, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-03 14:23:03'),
	(6, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-03 14:27:00'),
	(7, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-04 10:01:53'),
	(8, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-04 13:34:47'),
	(9, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-15 19:16:11'),
	(10, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-15 19:46:16'),
	(11, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-15 20:29:47'),
	(12, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-16 21:20:58'),
	(13, 1, 'LOGIN', 'Auth', 'Usuario inició sesión', '::1', NULL, '2025-11-17 13:20:38');

-- Volcando estructura para tabla estudio_juridico.plantillas
CREATE TABLE IF NOT EXISTS `plantillas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `tipo` enum('demanda','contestacion','alegato','recurso','notificacion','otro') NOT NULL,
  `fuero` varchar(100) DEFAULT NULL,
  `contenido` text NOT NULL,
  `variables_disponibles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables_disponibles`)),
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fuero` (`fuero`),
  KEY `idx_activa` (`activa`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `plantillas_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.plantillas: ~2 rows (aproximadamente)
INSERT INTO `plantillas` (`id`, `nombre`, `tipo`, `fuero`, `contenido`, `variables_disponibles`, `descripcion`, `activa`, `created_by`, `created_at`, `updated_at`) VALUES
	(1, 'Demanda Laboral', 'demanda', 'laboral', '{{caratula}}\r\n\r\n{{juzgado}}\r\n{{secretaria}}\r\n\r\nDEMANDA\r\n\r\n{{nombre_cliente}}, DNI {{dni_cliente}}, comparece ante este juzgado para deducir demanda en contra de {{demandado}} por despido y diferencias salariales.\r\n\r\nHECHOS:\r\n\r\n{{hechos}}\r\n\r\nDERECHO:\r\n\r\n{{derecho}}\r\n\r\nPor lo expuesto, solicito se tenga por presentada la presente demanda y se cite a ambas partes a una audiencia de mediación.\r\n\r\n{{fecha}}\r\n{{nombre_abogado}}\r\n{{matricula}}', '["caratula", "juzgado", "secretaria", "nombre_cliente", "dni_cliente", "demandado", "hechos", "derecho", "fecha", "nombre_abogado", "matricula"]', 'Plantilla básica para demanda laboral', 1, 1, '2025-11-03 13:48:35', '2025-11-03 13:48:35'),
	(2, 'Alegato', 'alegato', 'general', 'ALEGATO\r\n\r\n{{caratula}}\r\n\r\n{{juzgado}}\r\n{{secretaria}}\r\n\r\n{{fecha}}\r\n\r\nVengo a presentar el presente alegato en el marco de la causa {{numero_expediente}}.\r\n\r\nFUNDAMENTOS:\r\n\r\n{{fundamentos}}\r\n\r\nCONCLUSIONES:\r\n\r\n{{conclusiones}}\r\n\r\n{{nombre_abogado}}\r\n{{matricula}}', '["caratula", "juzgado", "secretaria", "fecha", "numero_expediente", "fundamentos", "conclusiones", "nombre_abogado", "matricula"]', 'Plantilla de alegato general', 1, 1, '2025-11-03 13:48:35', '2025-11-03 13:48:35');

-- Volcando estructura para tabla estudio_juridico.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('abogado','secretaria','gestor','pasante') NOT NULL DEFAULT 'pasante',
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estudio_juridico.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password_hash`, `rol`, `telefono`, `activo`, `avatar_url`, `created_at`, `updated_at`) VALUES
	(1, 'Admin', 'Sistema', 'admin@estudiojuridico.com', '$2b$10$ci5TlcY.DbgWGW.eZoQxnedZS6a6iIrkFMhYL6ifDezDQ0nh.3wze', 'abogado', '+54 11 1234-5678', 1, NULL, '2025-11-03 13:48:35', '2025-11-03 14:14:55'),
	(2, 'Julio', 'Pintos', 'julio@webxpert.com.ar', '$2b$10$ci5TlcY.DbgWGW.eZoQxnedZS6a6iIrkFMhYL6ifDezDQ0nh.3wze', 'abogado', '+54 11 4321-8765', 1, NULL, '2025-11-03 13:48:35', '2025-11-03 14:14:55');

-- Volcando estructura para vista estudio_juridico.vista_agenda_activa
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_agenda_activa` (
	`id` INT(11) NOT NULL,
	`titulo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`descripcion` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`tipo` ENUM('reunion','llamada','revision','audiencia','vencimiento','otro') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_hora` DATETIME NOT NULL,
	`urgente` TINYINT(1) NULL,
	`completada` TINYINT(1) NULL,
	`usuario_nombre` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`usuario_apellido` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`numero_expediente` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`caratula` TEXT NULL COLLATE 'utf8mb4_unicode_ci'
) ENGINE=MyISAM;

-- Volcando estructura para vista estudio_juridico.vista_estadisticas_fuero
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_estadisticas_fuero` (
	`fuero` ENUM('laboral','civil','comercial','penal','administrativo','familia','contencioso','otros') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_expedientes` BIGINT(21) NOT NULL,
	`activos` DECIMAL(22,0) NULL,
	`finalizados` DECIMAL(22,0) NULL,
	`archivados` DECIMAL(22,0) NULL,
	`promedio_dias` DECIMAL(11,4) NULL
) ENGINE=MyISAM;

-- Volcando estructura para vista estudio_juridico.vista_expedientes_completa
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_expedientes_completa` (
	`id` INT(11) NOT NULL,
	`numero_expediente` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fuero` ENUM('laboral','civil','comercial','penal','administrativo','familia','contencioso','otros') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`estado` ENUM('activo','archivado','suspendido','finalizado') NULL COLLATE 'utf8mb4_unicode_ci',
	`caratula` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_inicio` DATE NOT NULL,
	`cliente_nombre` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`cliente_dni` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`abogado_nombre` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`abogado_apellido` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`cantidad_documentos` BIGINT(21) NOT NULL,
	`cantidad_audiencias` BIGINT(21) NOT NULL,
	`ultima_audiencia` DATETIME NULL
) ENGINE=MyISAM;

-- Volcando estructura para disparador estudio_juridico.validar_fecha_audiencia
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
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
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_agenda_activa`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_agenda_activa` AS SELECT 
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
ORDER BY a.fecha_hora ASC 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_estadisticas_fuero`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_estadisticas_fuero` AS SELECT 
    fuero,
    COUNT(*) as total_expedientes,
    SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN estado = 'finalizado' THEN 1 ELSE 0 END) as finalizados,
    SUM(CASE WHEN estado = 'archivado' THEN 1 ELSE 0 END) as archivados,
    AVG(DATEDIFF(COALESCE(fecha_archivo, CURDATE()), fecha_inicio)) as promedio_dias
FROM expedientes
GROUP BY fuero 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_expedientes_completa`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_expedientes_completa` AS SELECT 
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
GROUP BY e.id 
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
