-- =============================================================================
-- ACTUALIZAR CONTRASEÑAS DE USUARIOS ADMINISTRADORES
-- Este script actualiza las contraseñas con hashes bcrypt válidos
-- Desarrollado por: Julio A. Pintos - WebXpert
-- =============================================================================

USE estudio_juridico;

-- Actualizar contraseña del usuario admin
UPDATE usuarios 
SET password_hash = '$2b$10$ci5TlcY.DbgWGW.eZoQxnedZS6a6iIrkFMhYL6ifDezDQ0nh.3wze'
WHERE email = 'admin@estudiojuridico.com';

-- Actualizar contraseña del usuario julio
UPDATE usuarios 
SET password_hash = '$2b$10$ci5TlcY.DbgWGW.eZoQxnedZS6a6iIrkFMhYL6ifDezDQ0nh.3wze'
WHERE email = 'julio@webxpert.com.ar';

-- Verificar que se actualizaron correctamente
SELECT id, nombre, apellido, email, LEFT(password_hash, 20) as hash_inicio, rol, activo 
FROM usuarios 
WHERE email IN ('admin@estudiojuridico.com', 'julio@webxpert.com.ar');

-- =============================================================================
-- NOTA: La contraseña para ambos usuarios es: admin
-- =============================================================================

