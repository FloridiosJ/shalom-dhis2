import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Tatitra quarterly report PDF for CSB Loterana
 * @param {Object} data - Quarterly report data
 * @param {Object} filters - Report filters (quarter, year, etc.)
 * @returns {Promise<Object>} - { filePath, fileName }
 */
export async function generateTatitraPDF(data, filters) {
  return new Promise((resolve, reject) => {
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `tatitra_${filters.quarter || 'Q4'}_${filters.year || new Date().getFullYear()}_${timestamp}.pdf`;
      const exportsDir = path.join(__dirname, '../../../exports');
      const filePath = path.join(exportsDir, fileName);

      // Ensure exports directory exists
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Create PDF document with A4 size
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 40,
        bufferPages: true
      });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Generate the report content
      generateTatitraContent(doc, data, filters);

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve({
          filePath,
          fileName,
          fullPath: filePath
        });
      });

      stream.on('error', (error) => {
        reject(new Error(`Failed to generate Tatitra PDF: ${error.message}`));
      });

    } catch (error) {
      console.error('Error generating Tatitra PDF:', error);
      reject(new Error(`Failed to generate Tatitra PDF: ${error.message}`));
    }
  });
}

/**
 * Generate the Tatitra report content
 */
function generateTatitraContent(doc, data, filters) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = doc.page.margins.left;
  
  // Page 1: Header and Section 1
  addHeader(doc, data, filters, margin, pageWidth);
  addSection1_AsaFitoriana(doc, data, margin, pageWidth);
  
  // Page 2: Section 2 - Medical consultations
  doc.addPage();
  addSection2_AsaFitsaboana(doc, data, margin, pageWidth);
  
  // Add page numbers
  addPageNumbers(doc);
}

/**
 * Add document header with CSB info
 */
function addHeader(doc, data, filters, margin, pageWidth) {
  const centerX = pageWidth / 2;
  
  // Title
  doc.fontSize(16)
    .font('Helvetica-Bold')
    .text('FAHASALAMANA MAMPANDROSO', margin, 50, {
      width: pageWidth - 2 * margin,
      align: 'center'
    });
  
  doc.fontSize(12)
    .text('FOIBE SHALOM BP: 356 Antanimalandy Mahajanga', {
      width: pageWidth - 2 * margin,
      align: 'center'
    })
    .moveDown(0.3);
  
  // CSB Name and zones
  doc.fontSize(11)
    .font('Helvetica-Bold')
    .text(`CSB Loterana`, margin, doc.y, { continued: true })
    .font('Helvetica')
    .text(` : ${data.zones.join(', ')}`, { continued: false })
    .moveDown(0.5);
  
  // Report title
  const quarter = filters.quarter || 'EFATRA';
  const year = filters.year || new Date().getFullYear();
  doc.fontSize(13)
    .font('Helvetica-Bold')
    .text(`TATITRA TAMBATRA TELOVOLANA FAHA ${quarter} ${year}`, {
      width: pageWidth - 2 * margin,
      align: 'center'
    })
    .moveDown(1);
}

/**
 * Section 1: Birth and general health statistics
 */
function addSection1_AsaFitoriana(doc, data, margin, pageWidth) {
  const startY = doc.y;
  
  // Section title
  doc.fontSize(11)
    .font('Helvetica-Bold')
    .text('1- MAHAKASIKA NY ASA FITORIANA :', margin, startY)
    .moveDown(0.5);
  
  // Statistics
  doc.fontSize(10)
    .font('Helvetica')
    .text(`· Isan'ny fotoam-bavaka tao amin'ny toeram-pitsaboana : ${data.section1?.prayerMeetings || 19}`)
    .text(`· Isan'ny Hasila nitady fitsaboana tao : ${data.section1?.visitorsReceived || 470}`)
    .moveDown(0.5);
  
  // Table: Births by zone and gender
  const tableData = data.section1?.birthsByZone || getDefaultBirthsData();
  drawBirthsTable(doc, tableData, margin, pageWidth);
}

/**
 * Draw births statistics table
 */
function drawBirthsTable(doc, tableData, margin, pageWidth) {
  const startY = doc.y;
  const tableWidth = pageWidth - 2 * margin;
  
  // Define columns
  const cols = [
    { header: 'Toerana :', width: 120 },
    { header: 'Ampitsopitsoka', width: 60, subHeaders: ['Lahy', 'Vavy'] },
    { header: 'Boeny Aranta', width: 60, subHeaders: ['Lahy', 'Vavy'] },
    { header: 'Ankelitaly', width: 60, subHeaders: ['Lahy', 'Vavy'] },
    { header: 'Ampanasina', width: 60, subHeaders: ['Lahy', 'Vavy'] },
    { header: 'Mananara', width: 60, subHeaders: ['Lahy', 'Vavy'] },
    { header: 'Fitambarany', width: 60, subHeaders: ['Lahy', 'Vavy'] }
  ];
  
  // Calculate actual column widths to fit page
  const totalDesiredWidth = cols.reduce((sum, col) => sum + col.width, 0);
  const scale = tableWidth / totalDesiredWidth;
  cols.forEach(col => col.width *= scale);
  
  let currentY = startY;
  
  // Draw table headers
  doc.fontSize(9).font('Helvetica-Bold');
  let currentX = margin;
  
  // Main headers
  cols.forEach((col, idx) => {
    if (idx === 0) {
      // First column - "Toerana"
      doc.rect(currentX, currentY, col.width, 40).stroke();
      doc.text(col.header, currentX + 5, currentY + 15, {
        width: col.width - 10,
        align: 'left'
      });
    } else {
      // Zone columns with sub-headers
      doc.rect(currentX, currentY, col.width, 20).stroke();
      doc.text(col.header, currentX + 2, currentY + 5, {
        width: col.width - 4,
        align: 'center',
        height: 15
      });
      
      // Sub-headers (Lahy/Vavy)
      const subWidth = col.width / 2;
      doc.rect(currentX, currentY + 20, subWidth, 20).stroke();
      doc.text('Lahy', currentX + 2, currentY + 25, {
        width: subWidth - 4,
        align: 'center'
      });
      doc.rect(currentX + subWidth, currentY + 20, subWidth, 20).stroke();
      doc.text('Vavy', currentX + subWidth + 2, currentY + 25, {
        width: subWidth - 4,
        align: 'center'
      });
    }
    currentX += col.width;
  });
  
  currentY += 40;
  
  // Draw data rows
  doc.fontSize(8).font('Helvetica');
  tableData.forEach((row, rowIdx) => {
    currentX = margin;
    const rowHeight = 20;
    
    // First column - category name
    doc.rect(currentX, currentY, cols[0].width, rowHeight).stroke();
    doc.text(row.category, currentX + 5, currentY + 5, {
      width: cols[0].width - 10,
      align: 'left'
    });
    currentX += cols[0].width;
    
    // Data columns
    for (let i = 1; i < cols.length; i++) {
      const subWidth = cols[i].width / 2;
      const zoneData = row.zones[i - 1] || { male: 0, female: 0 };
      
      // Male count
      doc.rect(currentX, currentY, subWidth, rowHeight).stroke();
      doc.text(String(zoneData.male).padStart(2, '0'), currentX + 2, currentY + 5, {
        width: subWidth - 4,
        align: 'center'
      });
      
      // Female count
      doc.rect(currentX + subWidth, currentY, subWidth, rowHeight).stroke();
      doc.text(String(zoneData.female).padStart(2, '0'), currentX + subWidth + 2, currentY + 5, {
        width: subWidth - 4,
        align: 'center'
      });
      
      currentX += cols[i].width;
    }
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 10;
}

/**
 * Section 2: Medical consultations and diseases
 */
function addSection2_AsaFitsaboana(doc, data, margin, pageWidth) {
  const startY = 50;
  
  // Section title
  doc.fontSize(11)
    .font('Helvetica-Bold')
    .text('2- MAHAKASIKA NY ASA FITSABOANA', margin, startY)
    .moveDown(0.5);
  
  // Subsection title
  doc.fontSize(10)
    .font('Helvetica')
    .text('• Aretina matelim-pitranga :', margin, doc.y)
    .moveDown(0.3);
  
  // Draw medical consultations table
  const medicalData = data.section2?.diseasesByZone || getDefaultMedicalData();
  drawMedicalTable(doc, medicalData, margin, pageWidth);
}

/**
 * Draw medical consultations table
 */
function drawMedicalTable(doc, tableData, margin, pageWidth) {
  const startY = doc.y;
  const tableWidth = pageWidth - 2 * margin;
  
  // Define columns for zones
  const zoneCols = [
    'Ampitsopitsoka',
    'Onara',
    'Andamonty',
    'Boeny Aranta',
    'Ankelitaly',
    'Ampanasina',
    'Mananara',
    'FITAM BARANY'
  ];
  
  const firstColWidth = 140;
  const remainingWidth = tableWidth - firstColWidth;
  const zoneColWidth = remainingWidth / zoneCols.length;
  
  let currentY = startY;
  
  // Draw header row
  doc.fontSize(9).font('Helvetica-Bold');
  
  // First header cell
  doc.rect(margin, currentY, firstColWidth, 25).stroke();
  doc.text('Désignations des maladies', margin + 5, currentY + 8, {
    width: firstColWidth - 10,
    align: 'left'
  });
  
  // Zone headers
  let currentX = margin + firstColWidth;
  zoneCols.forEach(zone => {
    doc.rect(currentX, currentY, zoneColWidth, 25).stroke();
    doc.text(zone, currentX + 2, currentY + 8, {
      width: zoneColWidth - 4,
      align: 'center'
    });
    currentX += zoneColWidth;
  });
  
  currentY += 25;
  
  // Second header row (CSB label)
  doc.rect(margin, currentY, firstColWidth, 20).stroke();
  doc.text('CSB', margin + 5, currentY + 5, {
    width: firstColWidth - 10,
    align: 'left'
  });
  
  currentX = margin + firstColWidth;
  zoneCols.forEach(() => {
    doc.rect(currentX, currentY, zoneColWidth, 20).stroke();
    currentX += zoneColWidth;
  });
  
  currentY += 20;
  
  // Draw data rows
  doc.fontSize(8).font('Helvetica');
  tableData.forEach((row, rowIdx) => {
    const rowHeight = row.isSubcategory ? 18 : 20;
    
    // Disease name
    doc.rect(margin, currentY, firstColWidth, rowHeight).stroke();
    const textX = margin + (row.isSubcategory ? 15 : 5);
    doc.text(row.disease, textX, currentY + 5, {
      width: firstColWidth - (row.isSubcategory ? 20 : 10),
      align: 'left'
    });
    
    // Zone data
    currentX = margin + firstColWidth;
    row.zones.forEach(count => {
      doc.rect(currentX, currentY, zoneColWidth, rowHeight).stroke();
      doc.text(String(count).padStart(2, '0'), currentX + 2, currentY + 5, {
        width: zoneColWidth - 4,
        align: 'center'
      });
      currentX += zoneColWidth;
    });
    
    currentY += rowHeight;
    
    // Check if we need a new page
    if (currentY > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;
    }
  });
  
  doc.y = currentY + 10;
}

/**
 * Add page numbers to all pages
 */
function addPageNumbers(doc) {
  const pageCount = doc.bufferedPageRange().count;
  
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(9)
      .font('Helvetica')
      .text(
        `Page ${i + 1} / ${pageCount}`,
        doc.page.margins.left,
        doc.page.height - 30,
        {
          width: doc.page.width - 2 * doc.page.margins.left,
          align: 'center'
        }
      );
  }
}

/**
 * Get default births data structure
 */
function getDefaultBirthsData() {
  return [
    {
      category: 'Zaza (12 taona noho midina)',
      zones: [
        { male: 8, female: 10 },
        { male: 87, female: 124 },
        { male: 5, female: 10 },
        { male: 14, female: 8 },
        { male: 6, female: 5 },
        { male: 120, female: 157 }
      ]
    },
    {
      category: 'Tanora (13 taona - 30 taona)',
      zones: [
        { male: 7, female: 6 },
        { male: 11, female: 60 },
        { male: 4, female: 5 },
        { male: 13, female: 15 },
        { male: 7, female: 4 },
        { male: 42, female: 90 }
      ]
    },
    {
      category: 'Olon-dehibe maherin\'ny 30 taona',
      zones: [
        { male: 8, female: 6 },
        { male: 5, female: 0 },
        { male: 2, female: 2 },
        { male: 19, female: 10 },
        { male: 5, female: 4 },
        { male: 39, female: 22 }
      ]
    }
  ];
}

/**
 * Get default medical data structure
 */
function getDefaultMedicalData() {
  return [
    { disease: 'Consultants', zones: [32, 100, 43, 267, 33, 206, 124, 805], isSubcategory: false },
    { disease: 'Consultation', zones: [48, 148, 91, 278, 38, 219, 152, 974], isSubcategory: false },
    { disease: 'Affections cardio Vasculaire', zones: [0, 0, 0, 0, 0, 0, 0, 0], isSubcategory: false },
    { disease: 'Hypertention', zones: [2, 0, 2, 0, 1, 13, 8, 26], isSubcategory: true },
    { disease: 'Autres', zones: [0, 0, 0, 0, 0, 2, 3, 5], isSubcategory: true },
    { disease: 'Affections cutanées', zones: [6, 0, 1, 1, 2, 0, 1, 11], isSubcategory: false },
    { disease: 'Affections de la sphère ORL', zones: [0, 10, 0, 1, 1, 3, 7, 22], isSubcategory: false },
    { disease: 'Affections de l\'œil et de ses annexes', zones: [1, 5, 1, 1, 2, 10, 9, 29], isSubcategory: false },
    { disease: 'Affections Ostéo-asticulaires', zones: [0, 0, 0, 0, 3, 3, 5, 11], isSubcategory: false },
    { disease: 'Affections mentales et troubles psychiques', zones: [0, 6, 0, 0, 0, 0, 0, 6], isSubcategory: false },
    { disease: 'Affections neurologiques', zones: [0, 0, 0, 0, 0, 0, 0, 0], isSubcategory: false },
    { disease: 'Affections de l\'appareil digestif', zones: [0, 0, 0, 0, 0, 0, 0, 0], isSubcategory: false },
    { disease: 'Bucco dentaire', zones: [3, 12, 0, 0, 1, 8, 3, 27], isSubcategory: true },
    { disease: 'Diarrhées (Di) sans déshydratation', zones: [4, 0, 5, 3, 0, 5, 3, 20], isSubcategory: true },
    { disease: 'Dysenteries (Dy) avec déshydratation', zones: [0, 6, 1, 0, 0, 1, 0, 8], isSubcategory: true }
  ];
}
