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
- ✅ **Reportes por Correo**: Generación y envío automático de reportes en PDF por correo electrónico
- ✅ **Autenticación JWT**: Sistema seguro de usuarios y roles
- ✅ **Control de Permisos**: 4 roles (Abogado, Secretaria, Gestor, Pasante)

### Tecnologías

**Backend:**
- Node.js + Express
- MySQL/MariaDB
- JWT para autenticación
- Multer para uploads
- Nodemailer para envío de correos
- PDFKit para generación de PDFs
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

# Configuración SMTP para envío de correos (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
```

### Variables para el Frontend (`frontend/.env.local` o `.env.production`)

```env
VITE_API_URL=http://localhost:3001/api
VITE_ADMIN_EMAILS=admin@estudiojuridico.com
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

### Reportes
- `GET /api/reportes/expedientes` - Reporte de expedientes (con filtros: fecha_desde, fecha_hasta, fuero, estado)
- `GET /api/reportes/vencimientos` - Reporte de vencimientos (con filtros: fecha_desde, fecha_hasta, urgente, completada)
- `GET /api/reportes/audiencias` - Reporte de audiencias (con filtros: fecha_desde, fecha_hasta, realizada, tipo)
- `GET /api/reportes/general` - Reporte general del dashboard
- `POST /api/reportes/enviar` - Enviar reporte por correo electrónico
  - **Body:** `{ tipo: 'expedientes'|'vencimientos', email: string, fecha_desde?: string, fecha_hasta?: string, ...filtros }`
  - **Respuesta:** `{ message: 'Reporte enviado por correo exitosamente' }`
  - **Permisos:** Solo Abogado y Secretaria

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

## 📧 Reportes por Correo

El sistema incluye funcionalidad completa para generar y enviar reportes por correo electrónico:

### Características
- **Generación automática de PDFs**: Los reportes se generan en formato PDF profesional
- **Envío por correo**: Los reportes se envían automáticamente con el PDF adjunto
- **Filtros personalizables**: Puedes aplicar filtros de fecha, fuero, estado, etc.
- **Tipos de reportes**: Expedientes, Vencimientos, Audiencias, Reporte General

### Configuración SMTP

Para habilitar el envío de correos, configura las variables de entorno SMTP en el archivo `.env`:

**Gmail (recomendado para desarrollo):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password  # Usar App Password de Google
```

**Otros proveedores:**
- Outlook: `smtp-mail.outlook.com`, puerto 587
- SendGrid: `smtp.sendgrid.net`, puerto 587
- Cualquier servidor SMTP estándar

**Nota:** Si no se configuran las credenciales SMTP, el sistema funcionará en modo desarrollo y solo mostrará logs en consola sin enviar correos reales.

### Uso de la API

**Enviar reporte de expedientes:**
```bash
POST /api/reportes/enviar
{
  "tipo": "expedientes",
  "email": "destinatario@ejemplo.com",
  "fecha_desde": "2024-01-01",
  "fecha_hasta": "2024-12-31",
  "fuero": "laboral",
  "estado": "activo"
}
```

**Enviar reporte de vencimientos:**
```bash
POST /api/reportes/enviar
{
  "tipo": "vencimientos",
  "email": "destinatario@ejemplo.com",
  "fecha_desde": "2024-01-01",
  "fecha_hasta": "2024-12-31",
  "urgente": true
}
```

### Contenido del Correo

Cada correo incluye:
- **Asunto**: Tipo de reporte y período
- **Cuerpo HTML**: Resumen con información del reporte
- **PDF Adjunto**: Reporte completo con todos los detalles y estadísticas

### Permisos

Solo usuarios con rol de **Abogado** o **Secretaria** pueden enviar reportes por correo.

## 🚀 Despliegue en Producción (Railway)

1. **Instalar dependencias:** `npm run install-all`
2. **Compilar el frontend:** `npm run build` (genera `frontend/dist`)
3. **Iniciar servidor:** `npm start` (levanta Express en modo producción y sirve el build)

### Variables esenciales backend
- `PORT`
- `NODE_ENV`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `ALLOWED_ORIGINS`
- (Opcional) `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`
- `ADMIN_EMAIL` o `ADMIN_EMAILS` (para habilitar la sección de usuarios)

### Variables esenciales frontend
- `VITE_API_URL` → URL del backend (ej. `https://tu-app.up.railway.app/api`)
- `VITE_ADMIN_EMAILS` → coma separada con los correos administradores

## 📝 Notas de Desarrollo

- El hash de contraseña por defecto debe cambiarse en producción
- La carpeta `/uploads` debe tener permisos de escritura
- Se recomienda usar un servidor de archivos en producción
- Configurar HTTPS en producción
- Implementar backup regular de la base de datos
- Para Gmail, usar "App Passwords" en lugar de la contraseña normal (requiere 2FA activado)

## 📞 Soporte

**Desarrollado por:** Julio A. Pintos  
**Empresa:** WebXpert  
**Web:** www.webxpert.com.ar

## 📄 Licencia

Proyecto desarrollado para uso interno de estudio jurídico.

---

**Versión:** 1.0.0  
**Última actualización:** 2024

