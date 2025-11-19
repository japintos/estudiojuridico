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
      let totalPages = 0; // Se calculará al final

      // Función helper para agregar pie de página
      const agregarPiePagina = (pageNumber, total) => {
        const totalFinal = total === '?' ? totalPages || pageNumber : total;
        
        // Línea divisoria
        doc.moveTo(50, doc.page.height - 60)
          .lineTo(doc.page.width - 50, doc.page.height - 60)
          .strokeColor('#cbd5e1')
          .lineWidth(0.5)
          .stroke();
        
        // Texto del pie
        doc.fontSize(8)
          .fillColor(colorTexto)
          .font('Helvetica')
          .text(
            `Página ${pageNumber}${totalFinal === '?' ? '' : ` de ${totalFinal}`}`,
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
      };

      // Función para limpiar emojis y caracteres especiales
      const limpiarEmojis = (text) => {
        return text
          .replace(/[🎯🚀📋✏️📍🛠️💡🔄🆘📞👥🎨🔍📊⚙️]/g, '') // Emojis comunes
          .replace(/✅/g, '✓')
          .replace(/❌/g, '✗')
          .replace(/⚠️/g, '⚠')
          .trim();
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
      let inCodeBlock = false;
      let codeBlockLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const originalLine = line;
        line = line.trim();

        // Detectar bloques de código (```)
        if (line.startsWith('```')) {
          if (inCodeBlock) {
            // Fin del bloque de código
            inCodeBlock = false;
            
            // Renderizar bloque de código
            if (yPosition > doc.page.height - 200) {
              agregarPiePagina(pageCount, '?');
              pageCount++;
              doc.addPage();
              yPosition = 50;
            }
            
            yPosition += 5;
            
            // Texto del código
            doc.fontSize(9)
              .fillColor('#1e293b')
              .font('Courier');
            
            for (const codeLine of codeBlockLines) {
              if (yPosition > doc.page.height - 150) {
                agregarPiePagina(pageCount, '?');
                pageCount++;
                doc.addPage();
                yPosition = 50;
              }
              
              // Fondo gris para cada línea de código
              doc.rect(55, yPosition - 2, pageWidth - 10, 12)
                .fill('#f8fafc')
                .strokeColor('#e2e8f0')
                .lineWidth(0.5)
                .stroke();
              
              doc.text(codeLine, 60, yPosition, { width: pageWidth - 20 });
              yPosition += 12;
            }
            
            codeBlockLines = [];
            yPosition += 10;
            continue;
          } else {
            // Inicio del bloque de código
            inCodeBlock = true;
            continue;
          }
        }

        // Si estamos dentro de un bloque de código, acumular líneas
        if (inCodeBlock) {
          codeBlockLines.push(limpiarEmojis(line));
          continue;
        }

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

        // Limpiar emojis de la línea
        line = limpiarEmojis(line);

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
          
          // Detectar nivel de indentación
          const match = originalLine.match(/^(\s*)[-*]\s+(.*)/);
          const indentLevel = match ? match[1].length : 0;
          const indentSize = Math.floor(indentLevel / 2) * 15; // 15px por cada nivel
          
          doc.fontSize(10).fillColor(colorTexto).font('Helvetica');
          const listItem = line.replace(/^[-*]\s+/, '• ');
          doc.text(listItem, 60 + indentSize, yPosition, { width: pageWidth - 20 - indentSize });
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
          
          // Detectar nivel de indentación
          const match = originalLine.match(/^(\s*)(\d+\.\s+)(.*)/);
          const indentLevel = match ? match[1].length : 0;
          const indentSize = Math.floor(indentLevel / 3) * 15; // 15px por cada nivel
          
          doc.fontSize(10).fillColor(colorTexto).font('Helvetica');
          doc.text(line, 60 + indentSize, yPosition, { width: pageWidth - 20 - indentSize });
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
          .replace(/\*\*([^*]+)\*\*/g, '$1'); // Negrita simple (**texto** -> texto)

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

      // Obtener total de páginas antes de agregar el pie de la última
      try {
        const finalPageRange = doc.bufferedPageRange();
        totalPages = finalPageRange ? finalPageRange.count : pageCount;
      } catch (error) {
        totalPages = pageCount;
      }

      // Agregar pie de página a la página final
      agregarPiePagina(pageCount, totalPages);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generarPDFGuiaUsuario
};

