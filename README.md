# Sistema de Gestión para Estudio Jurídico Multifuero

Sistema web completo de gestión integral para estudios jurídicos desarrollado por **WebXpert** (Julio A. Pintos).

## 🎯 Características Principales

### Funcionalidades Core
- ✅ **Gestión de Expedientes**: Control completo de expedientes judiciales por fuero
- ✅ **Gestión de Clientes**: Base de datos de clientes (personas físicas y jurídicas)
- ✅ **Audiencias Judiciales**: Calendario y seguimiento de audiencias
- ✅ **Documentos PDF**: Sistema de carga, almacenamiento y descarga segura
- ✅ **Plantillas de Escritos**: Generación automática de escritos judiciales
- ✅ **Agenda**: Sistema de tareas, recordatorios y alertas
- ✅ **Dashboard**: Estadísticas y métricas en tiempo real
- ✅ **Autenticación JWT**: Sistema seguro de usuarios y roles
- ✅ **Control de Permisos**: 4 roles (Abogado, Secretaria, Gestor, Pasante)

### Tecnologías

**Backend:**
- Node.js + Express
- MySQL/MariaDB
- JWT para autenticación
- Multer para uploads
- Validaciones robustas

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (gestión de estado)
- React Router
- Axios
- Lucide Icons

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- MySQL 8+ o MariaDB 10+
- NPM o Yarn

### Paso 1: Configurar Base de Datos

```bash
# Importar el esquema (crea automáticamente la base de datos si no existe)
mysql -u root -p < database/schema.sql
```

El script incluye creación automática de BD y validación de tablas existentes.

### Paso 2: Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=estudio_juridico
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRATION=8h
ALLOWED_ORIGINS=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Paso 3: Configurar y Ejecutar

**Opción A - Instalar y ejecutar manualmente:**

```bash
cd frontend
npm install
```

**Opción B - Instalar todo de una vez (recomendado):**

```bash
# Instalar dependencias de root, backend y frontend
npm run install-all

# Ejecutar frontend y backend simultáneamente
npm run dev
```

**Opción C - Usar scripts de inicio:**

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Paso 4: Acceder a la Aplicación

Abrir navegador en:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## 🔑 Credenciales de Acceso

### Usuario Administrador
- **Email:** admin@estudiojuridico.com
- **Password:** admin (cambiar en producción)

### Usuario Ejemplo
- **Email:** julio@webxpert.com.ar
- **Password:** admin (cambiar en producción)

**IMPORTANTE:** Cambiar las contraseñas en producción generando nuevos hashes con bcrypt.

## 👥 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Abogado** | Acceso completo a todas las funcionalidades |
| **Secretaria** | Carga y edición de expedientes, clientes, audiencias y documentos |
| **Gestor** | Seguimiento de trámites, visualización de expedientes |
| **Pasante** | Solo lectura de expedientes y audiencias |

## 📊 Estructura de Base de Datos

El esquema incluye las siguientes tablas:

- `usuarios` - Usuarios del sistema
- `clientes` - Personas físicas y jurídicas
- `expedientes` - Expedientes judiciales
- `audiencias` - Audiencias y vistas
- `documentos` - Archivos PDF adjuntos
- `plantillas` - Plantillas de escritos
- `escritos_generados` - Escritos generados desde plantillas
- `agenda` - Tareas y recordatorios
- `logs` - Registro de acciones

## 🚀 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Expedientes
- `GET /api/expedientes` - Listar expedientes
- `GET /api/expedientes/:id` - Obtener expediente
- `POST /api/expedientes` - Crear expediente
- `PUT /api/expedientes/:id` - Actualizar expediente
- `DELETE /api/expedientes/:id` - Eliminar expediente
- `GET /api/expedientes/stats` - Estadísticas

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente

### Audiencias
- `GET /api/audiencias` - Listar audiencias
- `GET /api/audiencias/:id` - Obtener audiencia
- `POST /api/audiencias` - Crear audiencia
- `PUT /api/audiencias/:id` - Actualizar audiencia
- `DELETE /api/audiencias/:id` - Eliminar audiencia

### Documentos
- `GET /api/documentos` - Listar documentos
- `GET /api/documentos/:id` - Obtener documento
- `GET /api/documentos/:id/download` - Descargar documento
- `POST /api/documentos/upload` - Subir documento
- `DELETE /api/documentos/:id` - Eliminar documento

### Plantillas
- `GET /api/plantillas` - Listar plantillas
- `GET /api/plantillas/:id` - Obtener plantilla
- `POST /api/plantillas` - Crear plantilla
- `PUT /api/plantillas/:id` - Actualizar plantilla
- `POST /api/plantillas/generate` - Generar escrito

### Agenda
- `GET /api/agenda` - Listar eventos
- `GET /api/agenda/:id` - Obtener evento
- `POST /api/agenda` - Crear evento
- `PUT /api/agenda/:id` - Actualizar evento
- `DELETE /api/agenda/:id` - Eliminar evento

## 🎨 Diseño

El diseño sigue un enfoque institucional, sobrio y profesional:
- Paleta de colores neutros (grises, azul oscuro, blanco)
- Tipografía clara y legible (Inter)
- Componentes reutilizables
- Diseño responsive
- Accesibilidad (WCAG 2.1)

## 🔒 Seguridad

- Autenticación basada en JWT
- Hash de contraseñas con bcrypt
- Validación de permisos por rol
- Sanitización de inputs
- Protección CORS
- Helmet para headers de seguridad
- Logs de auditoría

## 📝 Notas de Desarrollo

- El hash de contraseña por defecto debe cambiarse en producción
- La carpeta `/uploads` debe tener permisos de escritura
- Se recomienda usar un servidor de archivos en producción
- Configurar HTTPS en producción
- Implementar backup regular de la base de datos

## 📞 Soporte

**Desarrollado por:** Julio A. Pintos  
**Empresa:** WebXpert  
**Web:** www.webxpert.com.ar

## 📄 Licencia

Proyecto desarrollado para uso interno de estudio jurídico.

---

**Versión:** 1.0.0  
**Última actualización:** 2024

