import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF file from report data
 * @param {Array} data - Array of report data objects
 * @param {Object} filters - Filters applied to the report
 * @returns {Promise<Object>} - { filePath, fileName }
 */
export async function generatePDF(data, filters) {
  return new Promise((resolve, reject) => {
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `report_${timestamp}.pdf`;
      const exportsDir = path.join(__dirname, '../../../exports');
      const filePath = path.join(exportsDir, fileName);

      // Ensure exports directory exists
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text('Rapport & Analytics', { align: 'center' })
        .moveDown(0.5);

      // Filters information
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })
        .moveDown(0.3);

      if (filters.startDate && filters.endDate) {
        doc.text(`Période: ${filters.startDate} à ${filters.endDate}`, { align: 'center' });
      }
      if (filters.dispensaireId) {
        doc.text(`Dispensaire: ${filters.dispensaireId}`, { align: 'center' });
      }
      
      doc.moveDown(1);

      // Summary section
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Résumé', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Total de consultations: ${data.length}`)
        .moveDown(1);

      // Data table header
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Détail des Consultations', { underline: true })
        .moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      const tableHeaders = ['Date', 'Patient', 'Type', 'Diagnostic'];
      const columnWidths = [80, 120, 100, 200];
      let xPos = 50;

      doc.fontSize(9).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, tableTop, { width: columnWidths[i], align: 'left' });
        xPos += columnWidths[i];
      });

      doc.moveDown(0.5);
      let yPos = doc.y;

      // Draw a line under headers
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 5;

      // Table rows
      doc.fontSize(8).font('Helvetica');
      data.forEach((row, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        xPos = 50;
        const rowData = [
          row.dateConsultation ? new Date(row.dateConsultation).toLocaleDateString('fr-FR') : 'N/A',
          row.patientName || 'N/A',
          row.typeConsultation || 'N/A',
          row.diagnostic ? row.diagnostic.substring(0, 50) + (row.diagnostic.length > 50 ? '...' : '') : 'N/A'
        ];

        rowData.forEach((cell, i) => {
          doc.text(cell, xPos, yPos, { width: columnWidths[i], align: 'left' });
          xPos += columnWidths[i];
        });

        yPos += 20;
      });

      // Footer
      doc.fontSize(8)
        .text(
          `Généré le ${new Date().toLocaleString('fr-FR')}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();

      stream.on('finish', () => {
        resolve({
          filePath,
          fileName,
          fullPath: filePath
        });
      });

      stream.on('error', (error) => {
        reject(new Error(`Failed to generate PDF: ${error.message}`));
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(new Error(`Failed to generate PDF: ${error.message}`));
    }
  });
}
