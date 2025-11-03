# Guía de Contribución

## Flujo de Trabajo con Git

### Para Desarrollar una Nueva Funcionalidad

```bash
# 1. Actualizar código local
git checkout main
git pull origin main

# 2. Crear rama de trabajo
git checkout -b feature/nombre-funcionalidad

# 3. Desarrollar y hacer commits
git add .
git commit -m "feat: descripción de la funcionalidad"

# 4. Subir rama
git push origin feature/nombre-funcionalidad

# 5. Crear Pull Request en GitHub
```

### Convenciones de Commits

Usar formato convencional:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación
- `style`: Cambios de formato (sin afectar código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

Ejemplos:
```bash
git commit -m "feat: agregar exportación de expedientes a PDF"
git commit -m "fix: corregir cálculo de estadísticas en dashboard"
git commit -m "docs: actualizar guía de instalación"
```

## Estructura del Proyecto

- `backend/` - Servidor Node.js + Express
- `frontend/` - Cliente React + TypeScript
- `database/` - Esquemas SQL
- `README.md` - Documentación principal
- `CHANGELOG.md` - Registro de cambios

## Testing

Antes de hacer commit:
1. Probar funcionalidad localmente
2. Verificar que no haya errores de linting
3. Probar en diferentes navegadores
4. Verificar que la BD funcione correctamente

## Pull Requests

1. Descripción clara de los cambios
2. Referencia issues relacionados
3. Capturas de pantalla si hay cambios de UI
4. Verificar que el código compile sin errores

## Contacto

**Desarrollador:** Julio A. Pintos  
**Empresa:** WebXpert  
**Email:** info@webxpert.com.ar

