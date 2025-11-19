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
**Qué puedes hacer:**
- ✅ Crear plantillas de escritos con editor de texto enriquecido
- ✅ Ver listado de todas las plantillas disponibles
- ✅ Ver el contenido completo de cada plantilla (formato HTML renderizado)
- ✅ Generar escritos automáticos usando plantillas y datos de expedientes
- ✅ Usar variables dinámicas que se reemplazan automáticamente con datos reales

**Cómo crear una plantilla:**
1. Ir a "Plantillas" en el menú lateral
2. Clic en "Nueva Plantilla"
3. Completar información básica:
   - **Nombre** (requerido): Nombre descriptivo de la plantilla
   - **Tipo** (requerido): Demanda, Contestación, Alegato, Recurso, Notificación u Otro
   - **Fuero**: Laboral, Civil, Comercial, Penal, Administrativo, Familia (opcional)
   - **Descripción**: Breve descripción de cuándo usar esta plantilla (opcional)
4. **Editar el contenido** usando el editor de texto enriquecido (ver sección detallada abajo)
5. Insertar variables dinámicas usando la sintaxis `{{variable}}`
6. Clic en "Crear Plantilla"

**Variables dinámicas disponibles:**
Puedes insertar estas variables en tu plantilla, y se reemplazarán automáticamente con los datos reales del expediente al generar el escrito:

- `{{numero_expediente}}` - Número completo del expediente
- `{{caratula}}` - Carátula del expediente
- `{{juzgado}}` - Juzgado donde se tramita
- `{{nombre_cliente}}` - Nombre completo del cliente
- `{{dni_cliente}}` - Documento del cliente (DNI/CUIT)
- `{{nombre_abogado}}` - Nombre completo del abogado responsable
- `{{fecha}}` - Fecha actual (formato español)

**Ejemplo de uso de variables:**
```
Expediente {{numero_expediente}} - {{caratula}}

Señor Juez:

Por la presente, y en mi carácter de abogado patrocinante del cliente 
{{nombre_cliente}} (DNI: {{dni_cliente}}), me dirijo a su Señoría en 
relación al expediente en trámite ante el Juzgado {{juzgado}}.

Fecha: {{fecha}}

{{nombre_abogado}}
```

---

## ✏️ Editor de Texto Enriquecido - Guía Completa

El editor de texto enriquecido te permite formatear tus plantillas de escritos como si estuvieras usando un procesador de textos profesional (similar a Microsoft Word o Google Docs).

### 📍 Ubicación
El editor aparece en el modal "Nueva Plantilla" cuando estás creando o editando una plantilla.

### 🛠️ Herramientas Disponibles

#### 1. **Encabezados (Headers)**
- **Ubicación**: Primera herramienta en la barra (dropdown con números 1-6)
- **Uso**: Selecciona el texto y elige un nivel de encabezado (H1 a H6)
- **Cuándo usar**: Para títulos y subtítulos en tus escritos
- **Ejemplo**: Usar H1 para "SEÑOR JUEZ:" y H2 para secciones como "ANTECEDENTES"

#### 2. **Fuentes (Fonts)**
- **Ubicación**: Segunda herramienta (dropdown)
- **Uso**: Selecciona el texto y elige una familia de fuente
- **Cuándo usar**: Para dar estilo profesional a diferentes partes del escrito
- **Nota**: Las fuentes disponibles dependen del sistema

#### 3. **Tamaño de Fuente (Font Size)**
- **Ubicación**: Tercera herramienta (dropdown)
- **Tamaños disponibles**: 8pt, 10pt, 12pt, 14pt, 16pt, 18pt, 24pt, 36pt
- **Uso**: Selecciona el texto y elige un tamaño
- **Recomendación**: 
  - 12pt-14pt para el cuerpo del texto
  - 16pt-18pt para títulos secundarios
  - 24pt-36pt para títulos principales
- **Ejemplo**: Usar 18pt para "SEÑOR JUEZ:" y 12pt para el contenido

#### 4. **Formato de Texto Básico**
Botones en la barra de herramientas:
- **Negrita (B)**: Resalta texto importante
  - **Atajo**: `Ctrl + B` (Windows/Linux) o `Cmd + B` (Mac)
- **Cursiva (I)**: Para énfasis o citas
  - **Atajo**: `Ctrl + I` (Windows/Linux) o `Cmd + I` (Mac)
- **Subrayado (U)**: Para resaltar (usar con moderación)
  - **Atajo**: `Ctrl + U` (Windows/Linux) o `Cmd + U` (Mac)
- **Tachado (S)**: Para mostrar texto eliminado o corregido

**Ejemplo práctico:**
```
Por la presente, me dirijo a su Señoría en relación al expediente 
N° {{numero_expediente}}, en el cual me encuentro patrocinando al cliente 
{{nombre_cliente}}.
```

#### 5. **Colores**
- **Color de texto**: Botón con letra "A" coloreada
- **Color de fondo**: Botón con icono de resaltador
- **Uso**: Selecciona el texto y elige un color
- **Cuándo usar**: Para resaltar información importante o crear jerarquía visual
- **Recomendación**: Usar colores profesionales (negro, azul oscuro, gris)

#### 6. **Alineación**
- **Opciones**: Izquierda, Centro, Derecha, Justificado
- **Uso**: Coloca el cursor en el párrafo y elige la alineación
- **Recomendación**: 
  - **Justificado** para el cuerpo del escrito (texto alineado a ambos lados)
  - **Izquierda** para listas y datos
  - **Centro** para títulos principales
  - **Derecha** para fechas y firmas

#### 7. **Listas**
- **Lista ordenada (números)**: Para enumerar puntos o pasos
- **Lista con viñetas**: Para listas sin orden específico
- **Uso**: Clic en el botón y comienza a escribir, presiona Enter para nuevo ítem
- **Ejemplo de lista ordenada:**
  1. Primer punto
  2. Segundo punto
  3. Tercer punto

#### 8. **Sangría (Indentación)**
- **Aumentar sangría**: Desplaza el texto hacia la derecha
- **Disminuir sangría**: Desplaza el texto hacia la izquierda
- **Uso**: Coloca el cursor en el párrafo y usa los botones
- **Cuándo usar**: 
  - Para citas textuales
  - Para párrafos de ejemplo
  - Para crear jerarquía visual en listas

#### 9. **Interlineado (Line Height)**
- **Opciones**: 1.0, 1.5, 2.0, 2.5
- **Uso**: Selecciona el texto y elige el interlineado
- **Recomendación**:
  - **1.5** para el cuerpo del texto (fácil de leer)
  - **2.0** para documentos formales o cuando se requiere más espacio
  - **1.0** para texto compacto o tablas
- **Nota**: El interlineado afecta el espacio entre líneas del mismo párrafo

#### 10. **Citas y Código**
- **Cita (Blockquote)**: Para citas textuales o extractos importantes
  - Se muestra con una línea lateral y estilo diferenciado
- **Bloque de código**: Para texto que debe mostrarse sin formato
  - Útil para mostrar variables o ejemplos técnicos

#### 11. **Enlaces**
- **Uso**: Selecciona el texto y clic en el botón de enlace
- **Cuándo usar**: Si necesitas referenciar sitios web o documentos externos
- **Nota**: Al generar el escrito, los enlaces se mantendrán activos

#### 12. **Limpiar Formato**
- **Botón**: Icono de borrador/limpieza
- **Uso**: Selecciona el texto con formato y clic en "Limpiar formato"
- **Cuándo usar**: Para eliminar todo el formato aplicado y volver a texto plano
- **Útil**: Si copias texto de otro lugar y quieres quitarle el formato

---

### 📝 Flujo de Trabajo Recomendado al Crear una Plantilla

1. **Planifica el contenido**:
   - Piensa qué información necesitas incluir
   - Identifica qué variables dinámicas usarás
   - Decide qué partes del texto necesitan formato especial

2. **Escribe el contenido base**:
   - Comienza escribiendo el texto completo sin formato
   - Inserta las variables `{{variable}}` donde corresponda
   - No te preocupes por el formato todavía

3. **Aplica el formato**:
   - Selecciona títulos y aplícales encabezados (H1, H2, etc.)
   - Ajusta tamaños de fuente según importancia
   - Aplica negrita a información clave
   - Configura la alineación del documento (recomendado: justificado)

4. **Ajusta el espaciado**:
   - Configura el interlineado (1.5 o 2.0 para legibilidad)
   - Usa sangrías si es necesario para citas o ejemplos
   - Asegúrate de que haya suficiente espacio entre párrafos

5. **Revisa y ajusta**:
   - Lee el contenido completo
   - Verifica que las variables estén correctamente escritas
   - Asegúrate de que el formato sea consistente
   - Usa "Limpiar formato" si algo no se ve bien

6. **Guarda la plantilla**:
   - Verifica que el nombre sea descriptivo
   - Completa el tipo y fuero si aplica
   - Clic en "Crear Plantilla"

---

### 💡 Consejos y Mejores Prácticas

#### Formato Profesional
- ✅ **Usa interlineado 1.5 o 2.0** para facilitar la lectura
- ✅ **Justifica el texto** del cuerpo principal del escrito
- ✅ **Usa encabezados** para crear estructura clara (H1 para títulos principales, H2 para secciones)
- ✅ **Aplica negrita** de forma moderada, solo para información clave
- ✅ **Mantén tamaños de fuente consistentes** (12-14pt para texto, 16-18pt para títulos)

#### Uso de Variables
- ✅ **Escribe las variables exactamente como se muestran**: `{{numero_expediente}}` (con dobles llaves)
- ✅ **Las variables distinguen mayúsculas/minúsculas**: `{{numero_expediente}}` ≠ `{{Numero_Expediente}}`
- ✅ **Puedes aplicar formato a las variables**: Puedes poner en negrita `**{{numero_expediente}}**`
- ✅ **Las variables se reemplazan** cuando generas el escrito con datos reales

#### Errores Comunes a Evitar
- ❌ **No dejes espacios dentro de las variables**: `{{ numero_expediente }}` (incorrecto)
- ❌ **No uses formato excesivo**: Demasiada negrita o colores puede verse poco profesional
- ❌ **No olvides guardar**: El botón "Crear Plantilla" se habilita solo cuando hay contenido válido
- ❌ **No uses HTML manualmente**: El editor lo maneja automáticamente

#### Ejemplo de Plantilla Bien Formateada

```
[Encabezado H1 - 18pt - Centrado]
SEÑOR JUEZ:

[Texto Normal - 12pt - Justificado - Interlineado 1.5]
Por la presente, y en mi carácter de abogado patrocinante del cliente 
{{nombre_cliente}} (DNI: {{dni_cliente}}), me dirijo a su Señoría en 
relación al expediente N° {{numero_expediente}} - {{caratula}}, en trámite 
ante el Juzgado {{juzgado}}.

[Encabezado H2 - 16pt - Negrita]
SOLICITO:

[Lista con viñetas - 12pt]
• Punto primero
• Punto segundo
• Punto tercero

[Texto Normal - 12pt - Justificado - Interlineado 1.5]
Por todo lo expuesto, solicito a su Señoría...

[Texto - 12pt - Alineado a la derecha]
{{fecha}}

[Texto - 12pt - Alineado a la derecha - Negrita]
{{nombre_abogado}}
```

---

### 🔄 Generar Escritos desde Plantillas

**Cómo generar un escrito:**
1. Ve a "Plantillas" en el menú lateral
2. Encuentra la plantilla que deseas usar
3. Clic en el botón **"Generar"** de la plantilla
4. Selecciona el expediente del cual quieres usar los datos
5. (Opcional) Agrega variables personalizadas adicionales en formato JSON
6. Clic en **"Generar Escrito"**
7. El sistema creará un archivo de texto (.txt) con el escrito completo, donde:
   - Todas las variables `{{variable}}` serán reemplazadas con datos reales
   - El formato HTML se convertirá a texto plano legible
   - Podrás descargar y usar el archivo

**Variables que se reemplazan automáticamente:**
- Datos del expediente seleccionado
- Datos del cliente asociado al expediente
- Datos del abogado responsable
- Fecha actual en formato español

**Variables adicionales:**
- Puedes agregar variables personalizadas en el campo "Variables Adicionales"
- Formato JSON: `{"variable1": "valor1", "variable2": "valor2"}`
- Estas variables también se reemplazarán en la plantilla

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
**Versión:** 1.1.0 - Incluye Editor de Texto Enriquecido para Plantillas

