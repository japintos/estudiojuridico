# Guía de Instalación - Sistema de Gestión Estudio Jurídico

## Requisitos del Sistema

### Software Necesario
- **Node.js**: Versión 18 o superior
- **MySQL**: Versión 8 o superior (o MariaDB 10+)
- **NPM**: Incluido con Node.js
- **Git**: Para clonar el repositorio

## Instalación Paso a Paso

### 1. Configuración Inicial

```bash
# Clonar el repositorio (si aplica)
git clone <url-del-repositorio>
cd estudio_juridico

# O si ya tienes los archivos, simplemente navega a la carpeta
cd estudio_juridico
```

### 2. Configuración de Base de Datos

```bash
# Importar el esquema (crea automáticamente la base de datos si no existe)
mysql -u root -p < database/schema.sql
```

El script `schema.sql` incluye:
- Creación automática de la base de datos
- Validación y eliminación de tablas existentes antes de recrearlas
- Todas las tablas, vistas, triggers y datos iniciales

### 3. Configuración del Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env

# Editar el archivo .env con tus credenciales
# (usar tu editor preferido: nano, vim, code, etc.)
nano .env
```

**Configurar el archivo `.env`:**

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=estudio_juridico
JWT_SECRET=clave_super_secreta_y_unica_cambiar_en_produccion_123456789
JWT_EXPIRATION=8h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 4. Configuración del Frontend

```bash
# Volver a la raíz y navegar a frontend
cd ..
cd frontend

# Instalar dependencias
npm install
```

### 5. Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ Conexión a base de datos exitosa
🚀 Servidor corriendo en puerto 3001
📚 API disponible en http://localhost:3001/api
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Deberías ver:
```
  VITE v5.0.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 6. Acceder a la Aplicación

Abrir navegador en: **http://localhost:3000**

**Credenciales de acceso:**
- Email: `admin@estudiojuridico.com`
- Password: `admin`

## Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Causa:** Problemas con credenciales de MySQL

**Solución:**
1. Verificar que MySQL esté corriendo
2. Verificar usuario y contraseña en `.env`
3. Asegurarse de que la base de datos existe

### Error: "JWT_SECRET not defined"

**Causa:** Archivo `.env` no encontrado o mal configurado

**Solución:**
1. Verificar que `.env` existe en la carpeta `backend/`
2. Verificar que todas las variables estén definidas
3. Reiniciar el servidor

### Error: "Cannot find module"

**Causa:** Dependencias no instaladas

**Solución:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"

**Causa:** Puerto ocupado

**Solución:**
1. Cambiar puerto en `frontend/vite.config.ts`:
```typescript
server: {
  port: 3001, // cambiar a otro puerto
}
```

### Error: "Failed to load PDF"

**Causa:** Carpeta de uploads no existe o sin permisos

**Solución:**
```bash
cd backend
mkdir -p uploads/pdf
chmod 755 uploads
chmod 755 uploads/pdf
```

## Cambiar Contraseña del Usuario Admin

La contraseña por defecto es insegura. Para cambiarla:

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('nueva_contraseña', 10).then(hash => console.log(hash))"
```

Copiar el hash generado y actualizar en la base de datos:

```sql
UPDATE usuarios SET password_hash = 'hash_generado' WHERE email = 'admin@estudiojuridico.com';
```

## Configuración para Producción

1. **Cambiar JWT_SECRET** por uno seguro y único
2. **Cambiar todas las contraseñas** de usuarios
3. **Configurar HTTPS** con certificado SSL
4. **Habilitar firewall** y configurar reglas
5. **Backup automático** de la base de datos
6. **Usar servidor web** (Nginx, Apache) como proxy reverso
7. **Configurar variables de entorno** en el servidor
8. **Implementar rate limiting** para la API
9. **Habilitar logs** de seguridad
10. **Configurar CORS** correctamente

## Próximos Pasos

1. Revisar la documentación en `README.md`
2. Explorar la API en http://localhost:3001/api
3. Probar todas las funcionalidades
4. Personalizar según necesidades
5. Capacitar a los usuarios

## Soporte

Para problemas o consultas:
- **Desarrollador:** Julio A. Pintos
- **Empresa:** WebXpert
- **Web:** www.webxpert.com.ar

