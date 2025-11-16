# Guía de Usuario - Sistema de Gestión Estudio Jurídico

## 🎯 ¿Qué es este sistema?

Sistema web completo para gestionar todas las operaciones de un estudio jurídico multifuero. Desarrollado por **WebXpert** (Julio A. Pintos).

## 🚀 Primeros Pasos

### Paso 1: Iniciar Sesión

1. Abrir navegador en: **http://localhost:3000**
2. Usar credenciales:
   - **Email:** admin@estudiojuridico.com
   - **Password:** admin

### Paso 2: Explorar el Dashboard

El Dashboard muestra:
- **Resumen de expedientes** por fuero y estado
- **Próximas audiencias** que requieren atención
- **Estadísticas** generales del estudio
- **Alertas y recordatorios**

## 📋 Módulos Principales

### 1. Expedientes
**Qué puedes hacer:**
- ✅ Crear nuevos expedientes judiciales
- ✅ Ver listado con búsqueda y filtros
- ✅ Ver detalles completos de cada expediente
- ✅ Filtrar por fuero (Laboral, Civil, Comercial, etc.)
- ✅ Filtrar por estado (Activo, Finalizado, Archivado, Suspendido)

**Cómo crear un expediente:**
1. Ir a "Expedientes" en el menú lateral
2. Clic en "Nuevo Expediente"
3. Completar información:
   - Número de expediente (requerido)
   - Fuero (requerido)
   - Carátula (requerido)
   - Cliente (requerido)
   - Abogado responsable (requerido)
   - Datos adicionales opcionales
4. Clic en "Guardar Expediente"

### 2. Clientes
**Qué puedes hacer:**
- ✅ Registrar clientes (personas físicas y jurídicas)
- ✅ Ver listado de todos los clientes
- ✅ Buscar clientes por nombre o documento
- ✅ Ver expedientes asociados a cada cliente

**Cómo crear un cliente:**
1. Ir a "Clientes" en el menú lateral
2. Clic en "Nuevo Cliente"
3. Seleccionar tipo: Persona Física o Jurídica
4. Completar datos personales o empresariales
5. Documento y datos de contacto
6. Dirección (opcional)
7. Clic en "Guardar Cliente"

### 3. Audiencias
**Qué puedes ver:**
- ✅ Próximas audiencias judiciales
- ✅ Tipo de audiencia
- ✅ Fecha y hora
- ✅ Expediente asociado
- ⚠️ Crear audiencia (en desarrollo)

### 4. Documentos
**Qué puedes ver:**
- ✅ Listado de documentos PDF
- ✅ Información de cada documento
- ✅ Descargar documentos
- ⚠️ Subir documentos (en desarrollo)

### 5. Plantillas
**Qué puedes ver:**
- ✅ Plantillas disponibles para generar escritos
- ✅ Información de cada plantilla
- ⚠️ Crear plantillas (en desarrollo)
- ⚠️ Generar escritos (en desarrollo)

### 6. Agenda
**Qué puedes ver:**
- ✅ Eventos y recordatorios
- ✅ Tareas pendientes
- ✅ Próximas fechas importantes
- ⚠️ Crear eventos (en desarrollo)

### 7. Reportes por Correo
**Qué puedes hacer:**
- ✅ Generar reportes de expedientes y enviarlos por correo
- ✅ Generar reportes de vencimientos y enviarlos por correo
- ✅ Recibir reportes en formato PDF adjunto
- ✅ Aplicar filtros personalizados antes de enviar

**Cómo enviar un reporte por correo:**

1. **Acceder a la funcionalidad de reportes** (disponible para usuarios con rol de Abogado o Secretaria)
2. **Seleccionar el tipo de reporte:**
   - **Reporte de Expedientes**: Lista de expedientes con estadísticas
   - **Reporte de Vencimientos**: Lista de vencimientos judiciales con días restantes
3. **Configurar filtros opcionales:**
   - **Fecha desde** y **Fecha hasta**: Rango de fechas para filtrar los datos
   - **Fuero**: Filtrar por tipo de fuero (Laboral, Civil, Comercial, etc.)
   - **Estado**: Filtrar por estado del expediente (Activo, Finalizado, etc.)
   - **Urgente**: Para vencimientos, filtrar solo los marcados como urgentes
   - **Completada**: Para vencimientos, incluir o excluir tareas completadas
4. **Especificar el correo electrónico** del destinatario
5. **Enviar el reporte**: El sistema generará automáticamente:
   - Un PDF con el reporte completo
   - Un correo electrónico con resumen y el PDF adjunto

**Qué contiene el correo:**
- **Asunto**: Indica el tipo de reporte enviado
- **Cuerpo del correo**: 
  - Título del reporte
  - Período de fechas aplicado
  - Fecha y hora de generación
  - Resumen con cantidad de registros
- **Archivo adjunto PDF**: Contiene:
  - Encabezado con información del estudio jurídico
  - Filtros aplicados
  - Lista detallada de registros (expedientes o vencimientos)
  - Estadísticas y métricas

**Tipos de reportes disponibles:**

**Reporte de Expedientes:**
- Lista todos los expedientes que cumplan con los filtros
- Incluye: número de expediente, carátula, fuero, estado, cliente, abogado responsable
- Estadísticas: total de expedientes, distribución por fuero, distribución por estado, monto total en disputa

**Reporte de Vencimientos:**
- Lista todos los vencimientos que cumplan con los filtros
- Incluye: título del vencimiento, expediente asociado, fecha de vencimiento, días restantes, estado (vencido, crítico, próximo, normal)
- Estadísticas: total de vencimientos, cantidad vencidos, críticos, próximos, normales, urgentes

**Notas importantes:**
- Solo usuarios con rol de **Abogado** o **Secretaria** pueden enviar reportes
- El correo se envía desde la cuenta configurada en el servidor SMTP
- Si no hay configuración SMTP, el sistema funcionará en modo desarrollo (solo mostrará logs)
- Los PDF se generan automáticamente con formato profesional
- El nombre del archivo PDF incluye el tipo de reporte y la fecha/hora de generación

## 👥 Roles y Permisos

### Abogado
- **Acceso completo** a todas las funcionalidades
- Puede crear, editar y eliminar expedientes, clientes, audiencias
- Gestiona documentos y plantillas
- Administra la agenda

### Secretaria
- Crea y edita expedientes y clientes
- Carga audiencias y documentos
- Gestiona agenda propia
- No puede eliminar registros importantes

### Gestor
- Ve expedientes asignados
- Consulta estadísticas limitadas
- No puede editar información crítica

### Pasante
- **Solo lectura** de expedientes y audiencias
- Ve información para aprendizaje
- No puede modificar nada

## 🎨 Navegación

### Menú Lateral
- **Dashboard** - Resumen y estadísticas
- **Expedientes** - Gestión de expedientes
- **Clientes** - Base de clientes
- **Audiencias** - Calendario judicial
- **Documentos** - Archivos PDF
- **Plantillas** - Modelos de escritos
- **Agenda** - Tareas y recordatorios

### Breadcrumbs
- Botón "Volver" en todas las páginas de detalle
- Navegación intuitiva entre listados y detalles

## 🔍 Búsqueda y Filtros

### Expedientes
- Búsqueda por: número, carátula, cliente
- Filtros: Estado, Fuero
- Resultados en tiempo real

### Clientes
- Búsqueda por: nombre, razón social, documento
- Filtro: Estado activo/inactivo

## 📊 Dashboard Inteligente

El Dashboard muestra automáticamente:
- Total de expedientes
- Expedientes activos
- Expedientes finalizados
- Próximas audiencias (top 10)
- Distribución por fuero
- Distribución por estado

## ⚙️ Flujo de Trabajo Recomendado

1. **Iniciar sesión** al comienzo del día
2. **Revisar Dashboard** para ver alertas y próximas audiencias
3. **Revisar Agenda** para tareas del día
4. **Crear o actualizar expedientes** según corresponda
5. **Registrar audiencias** recientes
6. **Subir documentos** relacionados
7. **Generar escritos** usando plantillas
8. **Enviar reportes por correo** cuando sea necesario compartir información con clientes o colegas

## 🆘 Solución de Problemas

### No puedo iniciar sesión
- Verificar credenciales
- Verificar que el backend esté corriendo
- Ver consola del navegador (F12) para errores

### No se cargan los expedientes
- Verificar conexión a la base de datos
- Verificar permisos del usuario
- Revisar logs del backend

### Error al crear expediente
- Verificar que todos los campos requeridos estén completos
- Verificar que el cliente exista
- Verificar que el abogado responsable exista

## 📞 Soporte

**Desarrollador:** Julio A. Pintos  
**Empresa:** WebXpert  
**Email:** info@webxpert.com.ar  
**Web:** www.webxpert.com.ar

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.1

