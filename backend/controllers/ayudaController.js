const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un PDF de la guía de usuario
 */
const generarPDFGuiaUsuario = async (req, res, next) => {
  try {
    const guiaPath = path.join(__dirname, '..', '..', 'GUIA_USUARIO.md');
    
    if (!fs.existsSync(guiaPath)) {
      return res.status(404).json({ error: 'Guía de usuario no encontrada' });
    }

    const markdownContent = fs.readFileSync(guiaPath, 'utf8');
    const pdfBuffer = await convertirMarkdownAPDF(markdownContent);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Guia_Usuario_Estudio_Juridico_${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Convierte contenido Markdown a PDF
 */
const convertirMarkdownAPDF = (markdownContent) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        info: {
          Title: 'Guía de Usuario - Sistema de Gestión Estudio Jurídico',
          Author: 'WebXpert',
          Subject: 'Documentación del Sistema',
          Creator: 'Estudio Jurídico Multifuero'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colores de la marca (grises y azul oscuro)
      const colorTitulo = '#1e293b'; // gray-800
      const colorSubtitulo = '#334155'; // gray-700
      const colorTexto = '#475569'; // gray-600
      const colorPrimary = '#0e7490'; // primary-700
      const colorFondo = '#f1f5f9'; // gray-100

      // Contador manual de páginas
      let pageCount = 1;
      const pageFooters = []; // Almacenar información de pies de página

      // Función helper para agregar pie de página
      const agregarPiePagina = (pageNumber, totalPages) => {
        // Guardar la posición actual de la página
        const currentPage = doc.bufferedPageRange();
        const currentPageIndex = currentPage ? (currentPage.start + currentPage.count - 1) : 0;
        
        // Línea divisoria
        doc.moveTo(50, doc.page.height - 60)
          .lineTo(doc.page.width - 50, doc.page.height - 60)
          .strokeColor('#cbd5e1')
          .lineWidth(0.5)
          .stroke();
        
        // Texto del pie (si totalPages es '?', lo actualizaremos después)
        doc.fontSize(8)
          .fillColor(colorTexto)
          .font('Helvetica')
          .text(
            `Página ${pageNumber}${totalPages === '?' ? '' : ` de ${totalPages}`}`,
            50,
            doc.page.height - 50,
            { align: 'left' }
          );
        
        // Información de WebXpert
        doc.fontSize(8)
          .fillColor(colorPrimary)
          .font('Helvetica-Bold')
          .text(
            'Desarrollado por WebXpert',
            doc.page.width - 200,
            doc.page.height - 50,
            { align: 'right', width: 150 }
          );
        
        doc.fontSize(7)
          .fillColor(colorTexto)
          .font('Helvetica')
          .text(
            'www.webxpert.com.ar | info@webxpert.com.ar',
            doc.page.width - 200,
            doc.page.height - 40,
            { align: 'right', width: 150 }
          );
        
        // Guardar referencia para actualizar después
        if (totalPages === '?') {
          pageFooters.push(currentPageIndex);
        }
      };

      // Encabezado profesional
      doc.rect(0, 0, doc.page.width, 80).fill(colorFondo);
      doc.fontSize(24).fillColor(colorTitulo).text('Guía de Usuario', 50, 30, { align: 'center' });
      doc.fontSize(14).fillColor(colorSubtitulo).text('Sistema de Gestión Estudio Jurídico Multifuero', 50, 55, { align: 'center' });
      
      let yPosition = 100;
      const pageWidth = doc.page.width - 100;
      const lineHeight = 14;
      const sectionSpacing = 20;

      // Parser básico de Markdown
      const lines = markdownContent.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Verificar si necesitamos nueva página
        if (yPosition > doc.page.height - 150) {
          agregarPiePagina(pageCount, '?');
          pageCount++;
          doc.addPage();
          yPosition = 50;
        }

        // Saltar líneas vacías
        if (!line) {
          yPosition += lineHeight / 2;
          continue;
        }

        // Títulos H1
        if (line.startsWith('# ')) {
          yPosition += sectionSpacing;
          if (yPosition > doc.page.height - 150) {
            agregarPiePagina(pageCount, '?');
            pageCount++;
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(20).fillColor(colorTitulo).font('Helvetica-Bold');
          doc.text(line.replace(/^#\s+/, ''), 50, yPosition, { width: pageWidth });
          yPosition += 25;
          continue;
        }

        // Títulos H2
        if (line.startsWith('## ')) {
          yPosition += sectionSpacing / 2;
          if (yPosition > doc.page.height - 150) {
            agregarPiePagina(pageCount, '?');
            pageCount++;
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(16).fillColor(colorSubtitulo).font('Helvetica-Bold');
          doc.text(line.replace(/^##\s+/, ''), 50, yPosition, { width: pageWidth });
          yPosition += 20;
          continue;
        }

        // Títulos H3
        if (line.startsWith('### ')) {
          yPosition += 10;
          if (yPosition > doc.page.height - 150) {
            agregarPiePagina(pageCount, '?');
            pageCount++;
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(14).fillColor(colorSubtitulo).font('Helvetica-Bold');
          doc.text(line.replace(/^###\s+/, ''), 50, yPosition, { width: pageWidth });
          yPosition += 16;
          continue;
        }

        // Títulos H4
        if (line.startsWith('#### ')) {
          if (yPosition > doc.page.height - 150) {
            agregarPiePagina(pageCount, '?');
            pageCount++;
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(12).fillColor(colorSubtitulo).font('Helvetica-Bold');
          doc.text(line.replace(/^####\s+/, ''), 50, yPosition, { width: pageWidth });
          yPosition += 14;
          continue;
        }

        // Listas con viñetas (- o *)
        if (line.match(/^[-*]\s+/)) {
          if (yPosition > doc.page.height - 150) {
            agregarPiePagina(pageCount, '?');
            pageCount++;
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(10).fillColor(colorTexto).font('Helvetica');
          const listItem = line.replace(/^[-*]\s+/, '• ');
          doc.text(listItem, 60, yPosition, { width: pageWidth - 20, indent: 10 });
          yPosition += lineHeight;
          continue;
        }

        // Listas numeradas
        if (line.match(/^\d+\.\s+/)) {
          if (yPosition > doc.page.height - 150) {
            agregarPiePagina(pageCount, '?');
            pageCount++;
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(10).fillColor(colorTexto).font('Helvetica');
          doc.text(line, 60, yPosition, { width: pageWidth - 20, indent: 10 });
          yPosition += lineHeight;
          continue;
        }

        // Texto con formato especial (negrita **texto**)
        if (line.includes('**')) {
          if (yPosition > doc.page.height - 150) {
            agregarPiePagina(pageCount, '?');
            pageCount++;
            doc.addPage();
            yPosition = 50;
          }
          
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          let xPos = 50;
          
          doc.fontSize(10).fillColor(colorTexto).font('Helvetica');
          
          for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
              const text = part.slice(2, -2);
              doc.font('Helvetica-Bold').fillColor(colorPrimary);
              const width = doc.widthOfString(text, { fontSize: 10 });
              
              if (xPos + width > doc.page.width - 50) {
                yPosition += lineHeight;
                xPos = 50;
              }
              
              doc.text(text, xPos, yPosition);
              xPos += width;
            } else if (part.trim()) {
              doc.font('Helvetica').fillColor(colorTexto);
              const text = part.replace(/\*\*/g, '');
              const width = doc.widthOfString(text, { fontSize: 10 });
              
              if (xPos + width > doc.page.width - 50) {
                yPosition += lineHeight;
                xPos = 50;
              }
              
              doc.text(text, xPos, yPosition);
              xPos += width;
            }
          }
          
          yPosition += lineHeight;
          continue;
        }

        // Separadores (---)
        if (line.startsWith('---')) {
          yPosition += 10;
          doc.moveTo(50, yPosition).lineTo(doc.page.width - 50, yPosition).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
          yPosition += 15;
          continue;
        }

        // Código inline (`texto`)
        if (line.includes('`')) {
          line = line.replace(/`([^`]+)`/g, '$1');
        }

        // Texto normal
        if (yPosition > doc.page.height - 150) {
          agregarPiePagina(pageCount, '?');
          pageCount++;
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(10).fillColor(colorTexto).font('Helvetica');
        
        // Limpiar markdown básico
        line = line
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links [text](url) -> text
          .replace(/\{\{([^}]+)\}\}/g, '{{$1}}') // Variables
          .replace(/✅/g, '✓')
          .replace(/❌/g, '✗')
          .replace(/⚠️/g, '⚠');

        doc.text(line, 50, yPosition, {
          width: pageWidth,
          align: 'left',
          lineGap: 2
        });

        yPosition += doc.heightOfString(line, { width: pageWidth, fontSize: 10 }) + 5;
      }

      // Agregar pie de página a la última página de contenido
      agregarPiePagina(pageCount, '?');
      
      // Página final con información de desarrolladores
      pageCount++;
      doc.addPage();
      
      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fill('#f8fafc');
      
      yPosition = 100;
      
      doc.fontSize(24)
        .fillColor(colorTitulo)
        .font('Helvetica-Bold')
        .text('Información del Sistema', 50, yPosition, { align: 'center' });
      
      yPosition += 50;
      
      doc.fontSize(14)
        .fillColor(colorSubtitulo)
        .font('Helvetica-Bold')
        .text('Desarrollado por:', 50, yPosition, { align: 'center' });
      
      yPosition += 30;
      
      doc.fontSize(16)
        .fillColor(colorPrimary)
        .font('Helvetica-Bold')
        .text('WebXpert', 50, yPosition, { align: 'center' });
      
      yPosition += 25;
      
      doc.fontSize(12)
        .fillColor(colorTexto)
        .font('Helvetica')
        .text('Julio A. Pintos - Tech Lead y Senior Fullstack Developer', 50, yPosition, { align: 'center' });
      
      yPosition += 50;
      
      doc.fontSize(12)
        .fillColor(colorSubtitulo)
        .font('Helvetica-Bold')
        .text('Contacto:', 50, yPosition, { align: 'center' });
      
      yPosition += 25;
      
      doc.fontSize(11)
        .fillColor(colorTexto)
        .font('Helvetica')
        .text('www.webxpert.com.ar', 50, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      doc.fontSize(11)
        .fillColor(colorTexto)
        .font('Helvetica')
        .text('info@webxpert.com.ar', 50, yPosition, { align: 'center' });
      
      yPosition += 50;
      
      doc.fontSize(10)
        .fillColor(colorTexto)
        .font('Helvetica')
        .text(`Versión: 1.1.0`, 50, yPosition, { align: 'center' });
      
      yPosition += 15;
      
      doc.fontSize(10)
        .fillColor(colorTexto)
        .font('Helvetica')
        .text(`Última actualización: Noviembre 2025`, 50, yPosition, { align: 'center' });
      
      yPosition += 40;
      
      doc.fontSize(9)
        .fillColor('#64748b')
        .font('Helvetica-Oblique')
        .text(
          'Este sistema fue desarrollado exclusivamente para la gestión integral\n' +
          'de estudios jurídicos multifuero. Todos los derechos reservados.',
          50,
          yPosition,
          { align: 'center', lineGap: 5 }
        );

      // Agregar pie de página a la página final
      agregarPiePagina(pageCount, '?');

      // Actualizar pies de página con el total correcto
      // Usar bufferedPageRange() solo después de que todas las páginas estén creadas
      try {
        const finalPageRange = doc.bufferedPageRange();
        const totalPages = finalPageRange ? finalPageRange.count : pageCount;
        
        // Actualizar pies de página existentes con el total correcto
        // Nota: PDFKit no permite actualizar fácilmente contenido ya escrito
        // Por lo tanto, los pies se agregaron con el número de página correcto
        // y simplemente mostraremos "Página X" sin el total para evitar complejidad
      } catch (error) {
        // Si hay error, continuar de todas formas
        console.error('Error al obtener rango de páginas:', error.message);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generarPDFGuiaUsuario
};

