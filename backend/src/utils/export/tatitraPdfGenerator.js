import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sanitize filename component to prevent path injection
 * @param {string} value - Value to sanitize
 * @returns {string} - Sanitized value
 */
function sanitizeFilename(value) {
  if (!value) return 'unknown';
  // Remove any characters that aren't alphanumeric, underscore, or hyphen
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Generate Tatitra quarterly report PDF for CSB Loterana
 * @param {Object} data - Quarterly report data
 * @param {Object} filters - Report filters (quarter, year, etc.)
 * @returns {Promise<Object>} - { filePath, fileName }
 */
export async function generateTatitraPDF(data, filters) {
  return new Promise((resolve, reject) => {
    try {
      // Sanitize user inputs to prevent path injection
      const sanitizedQuarter = sanitizeFilename(filters.quarter || 'Q4');
      const sanitizedYear = sanitizeFilename(filters.year || new Date().getFullYear());
      
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `tatitra_${sanitizedQuarter}_${sanitizedYear}_${timestamp}.pdf`;
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
  
  // Page 3: Section 3 - Fandriandram-piterahana (Education)
  doc.addPage();
  addSection3_FandriandramPiterahana(doc, data, margin, pageWidth);
  
  // Section 4: Momba ireo Reny Bevoaka (Maternal Health)
  // Check if there's space on current page, otherwise add new page
  if (doc.y > pageHeight - 250) {
    doc.addPage();
  }
  addSection4_MombaRenyBevoaka(doc, data, margin, pageWidth);
  
  // Section 5: Fanentanana natao (Events/Animations)
  doc.addPage();
  addSection5_FanentananaNatao(doc, data, margin, pageWidth);
  
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
  const totalVisitors = data.section1?.visitorsReceived || 470;
  const nonChristianVisitors = data.section1?.nonChristianVisitors || 0;
  
  doc.fontSize(10)
    .font('Helvetica')
    .text(`· Isan'ny fotoam-bavaka tao amin'ny toeram-pitsaboana : ${data.section1?.prayerMeetings || 19}`)
    .text(`· Isan'ny Hasila nitady fitsaboana tao : ${totalVisitors} (tsy Kristianina: ${nonChristianVisitors})`)
    .moveDown(0.5);
  
  // Table: Births by zone and gender
  const tableData = data.section1?.birthsByZone || getDefaultBirthsData();
  const nonChristianData = data.section1?.nonChristiansByZone;
  
  // Add non-Christian row if data exists
  if (nonChristianData) {
    tableData.push(nonChristianData);
  }
  
  drawBirthsTable(doc, tableData, margin, pageWidth);
}

/**
 * Draw births statistics table - Split into 2 tables as per requirements
 */
function drawBirthsTable(doc, tableData, margin, pageWidth) {
  const startY = doc.y;
  
  // Define the 7 dispensaries in order
  const allDispensaires = [
    'Ampitsopitsoka',
    'Boeny Aranta', 
    'Ankelitaly',
    'Ampanasina',
    'Mananara',
    'Onara',
    'Andamonty'
  ];
  
  // First table: First 4 dispensaries + Fitambarany
  const table1Dispensaires = allDispensaires.slice(0, 4);
  drawSingleBirthsTable(doc, tableData, margin, pageWidth, table1Dispensaires, true);
  
  // Add spacing between tables
  doc.moveDown(1);
  
  // Second table: Last 3 dispensaries + Fitambarany
  const table2Dispensaires = allDispensaires.slice(4, 7);
  drawSingleBirthsTable(doc, tableData, margin, pageWidth, table2Dispensaires, false);
  
  doc.moveDown(0.5);
}

/**
 * Draw a single births table with specified dispensaries
 * @param {PDFDocument} doc - PDF document
 * @param {Array} tableData - Table data with categories and zones
 * @param {number} margin - Page margin
 * @param {number} pageWidth - Page width
 * @param {Array} dispensaires - List of dispensaries to include
 * @param {boolean} isFirstTable - Whether this is the first table
 */
function drawSingleBirthsTable(doc, tableData, margin, pageWidth, dispensaires, isFirstTable) {
  const startY = doc.y;
  const tableWidth = pageWidth - 2 * margin;
  
  // Calculate dynamic width for category column
  doc.fontSize(8).font('Helvetica');
  let maxCategoryWidth = 120; // Minimum width
  tableData.forEach(row => {
    const textWidth = doc.widthOfString(row.category);
    const requiredWidth = textWidth + 15; // Add padding
    if (requiredWidth > maxCategoryWidth) {
      maxCategoryWidth = requiredWidth;
    }
  });
  
  // Cap the maximum width
  const firstColWidth = Math.min(maxCategoryWidth, tableWidth * 0.3);
  
  // Build columns array: First column + dispensaries + Fitambarany
  const cols = [
    { header: isFirstTable ? 'Toerana :' : '', width: firstColWidth }
  ];
  
  // Add dispensary columns
  dispensaires.forEach(disp => {
    cols.push({ header: disp, width: 60, subHeaders: ['Lahy', 'Vavy'] });
  });
  
  // Add Fitambarany column
  cols.push({ header: 'Fitambarany', width: 60, subHeaders: ['Lahy', 'Vavy'] });
  
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
      // First column - "Toerana" (only show in first table)
      doc.rect(currentX, currentY, col.width, 40).stroke();
      if (col.header) {
        doc.text(col.header, currentX + 5, currentY + 15, {
          width: col.width - 10,
          align: 'left'
        });
      }
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
    
    // Calculate subtotals for this row's dispensaries
    let rowMaleTotal = 0;
    let rowFemaleTotal = 0;
    
    // Data columns for specified dispensaires
    for (let i = 0; i < dispensaires.length; i++) {
      const subWidth = cols[i + 1].width / 2;
      // Find the zone data by dispensaire name
      const zoneIndex = getZoneIndexByName(dispensaires[i]);
      const zoneData = row.zones[zoneIndex] || { male: 0, female: 0 };
      
      rowMaleTotal += zoneData.male;
      rowFemaleTotal += zoneData.female;
      
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
      
      currentX += cols[i + 1].width;
    }
    
    // Fitambarany column (subtotal for this subset of dispensaires)
    const subWidth = cols[cols.length - 1].width / 2;
    
    // Male total
    doc.rect(currentX, currentY, subWidth, rowHeight).stroke();
    doc.text(String(rowMaleTotal).padStart(2, '0'), currentX + 2, currentY + 5, {
      width: subWidth - 4,
      align: 'center'
    });
    
    // Female total
    doc.rect(currentX + subWidth, currentY, subWidth, rowHeight).stroke();
    doc.text(String(rowFemaleTotal).padStart(2, '0'), currentX + subWidth + 2, currentY + 5, {
      width: subWidth - 4,
      align: 'center'
    });
    
    currentY += rowHeight;
  });
  
  doc.y = currentY;
}

/**
 * Get zone index by dispensaire name
 * Maps dispensaire names to their index in the zones array
 */
function getZoneIndexByName(dispensaireName) {
  const zoneMap = {
    'Ampitsopitsoka': 0,
    'Boeny Aranta': 1,
    'Ankelitaly': 2,
    'Ampanasina': 3,
    'Mananara': 4,
    'Onara': 5,
    'Andamonty': 6
  };
  return zoneMap[dispensaireName] !== undefined ? zoneMap[dispensaireName] : 0;
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
 * Draw medical consultations table with dynamic column sizing
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
  
  // Calculate required width for disease names (first column)
  // Set font for measuring text width
  doc.fontSize(8).font('Helvetica');
  
  let maxDiseaseWidth = 140; // Minimum width
  tableData.forEach(row => {
    const textWidth = doc.widthOfString(row.disease);
    const requiredWidth = textWidth + (row.isSubcategory ? 25 : 15); // Add padding and indent
    if (requiredWidth > maxDiseaseWidth) {
      maxDiseaseWidth = requiredWidth;
    }
  });
  
  // Cap the maximum width to ensure zone columns are visible
  const maxFirstColWidth = Math.min(maxDiseaseWidth, tableWidth * 0.4); // Max 40% of table width
  const firstColWidth = maxFirstColWidth;
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
    // Calculate row height dynamically based on text wrapping
    const textX = margin + (row.isSubcategory ? 15 : 5);
    const availableWidth = firstColWidth - (row.isSubcategory ? 20 : 10);
    
    // Measure height needed for the disease name with wrapping
    const textHeight = doc.heightOfString(row.disease, {
      width: availableWidth,
      align: 'left'
    });
    
    const rowHeight = Math.max(row.isSubcategory ? 18 : 20, textHeight + 10);
    
    // Disease name
    doc.rect(margin, currentY, firstColWidth, rowHeight).stroke();
    doc.text(row.disease, textX, currentY + 5, {
      width: availableWidth,
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
 * Section 3: Fandriandram-piterahana (Education)
 */
function addSection3_FandriandramPiterahana(doc, data, margin, pageWidth) {
  const startY = 50;
  
  // Section title
  doc.fontSize(12)
    .font('Helvetica-Bold')
    .text('Fandriandram - piterahana :', margin, startY, {
      width: pageWidth - 2 * margin,
      align: 'center',
      underline: true
    })
    .moveDown(1);
  
  // Draw education table
  const educationData = data.section3?.educationByZone || getDefaultEducationData();
  drawEducationTable(doc, educationData, margin, pageWidth);
}

/**
 * Draw education table
 */
function drawEducationTable(doc, tableData, margin, pageWidth) {
  const startY = doc.y;
  const tableWidth = pageWidth - 2 * margin;
  
  // Define columns for zones - matching reference image exactly
  const zoneCols = [
    'Ampilsopitsoka',
    'Onara',
    'Andamon ty',
    'Boeny Aranta',
    'Ankelilal y',
    'Apanasina',
    'Mananara',
    'FITAMBARANY'
  ];
  
  const firstColWidth = 140;
  const remainingWidth = tableWidth - firstColWidth;
  const zoneColWidth = remainingWidth / zoneCols.length;
  
  let currentY = startY;
  
  // Draw header row - zone names
  doc.fontSize(9).font('Helvetica-Bold');
  
  // First header cell - "TOERANA"
  doc.rect(margin, currentY, firstColWidth, 20).stroke();
  doc.text('TOERANA', margin + 5, currentY + 5, {
    width: firstColWidth - 10,
    align: 'left'
  });
  
  // Zone headers
  let currentX = margin + firstColWidth;
  zoneCols.forEach(zone => {
    doc.rect(currentX, currentY, zoneColWidth, 20).stroke();
    doc.text(zone, currentX + 2, currentY + 5, {
      width: zoneColWidth - 4,
      align: 'center'
    });
    currentX += zoneColWidth;
  });
  
  currentY += 20;
  
  // Second header row - Lahy/Vavy subheaders
  doc.rect(margin, currentY, firstColWidth, 20).stroke();
  
  currentX = margin + firstColWidth;
  zoneCols.forEach(() => {
    const subWidth = zoneColWidth / 2;
    
    // Lahy
    doc.rect(currentX, currentY, subWidth, 20).stroke();
    doc.text('Lahy', currentX + 2, currentY + 5, {
      width: subWidth - 4,
      align: 'center'
    });
    
    // Vavy
    doc.rect(currentX + subWidth, currentY, subWidth, 20).stroke();
    doc.text('Vavy', currentX + subWidth + 2, currentY + 5, {
      width: subWidth - 4,
      align: 'center'
    });
    
    currentX += zoneColWidth;
  });
  
  currentY += 20;
  
  // Draw data rows
  doc.fontSize(8).font('Helvetica');
  tableData.forEach((row, rowIdx) => {
    currentX = margin;
    const rowHeight = 20;
    
    // First column - category name
    doc.rect(currentX, currentY, firstColWidth, rowHeight).stroke();
    doc.text(row.category, currentX + 5, currentY + 5, {
      width: firstColWidth - 10,
      align: 'left'
    });
    currentX += firstColWidth;
    
    // Data columns
    for (let i = 0; i < zoneCols.length; i++) {
      const subWidth = zoneColWidth / 2;
      const zoneData = row.zones[i] || { male: 0, female: 0 };
      
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
      
      currentX += zoneColWidth;
    }
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 10;
}

/**
 * Section 4: Momba ireo Reny Bevoaka (Maternal Health)
 */
function addSection4_MombaRenyBevoaka(doc, data, margin, pageWidth) {
  const startY = doc.y;
  
  // Section title
  doc.fontSize(12)
    .font('Helvetica-Bold')
    .text('Momba ireo Reny Bevoaka', margin, startY, {
      width: pageWidth - 2 * margin,
      align: 'center',
      underline: true
    })
    .moveDown(1);
  
  // Draw maternal health table
  const maternalData = data.section4?.maternalHealthByZone || getDefaultMaternalHealthData();
  drawMaternalHealthTable(doc, maternalData, margin, pageWidth);
}

/**
 * Draw maternal health table
 */
function drawMaternalHealthTable(doc, tableData, margin, pageWidth) {
  const startY = doc.y;
  const tableWidth = pageWidth - 2 * margin;
  
  // Define columns for zones
  const zoneCols = [
    'Ampilsopitso ka',
    'Onara',
    'Andamon ty',
    'Boeny Aranta',
    'Ankelilal y',
    'Ampana sina',
    'Mananara',
    'FITAMBARANY'
  ];
  
  const firstColWidth = 140;
  const remainingWidth = tableWidth - firstColWidth;
  const zoneColWidth = remainingWidth / zoneCols.length;
  
  let currentY = startY;
  
  // Draw header row - "CSB"
  doc.fontSize(9).font('Helvetica-Bold');
  
  // First header cell - "CSB"
  doc.rect(margin, currentY, firstColWidth, 20).stroke();
  doc.text('CSB', margin + 5, currentY + 5, {
    width: firstColWidth - 10,
    align: 'left'
  });
  
  // Zone headers
  let currentX = margin + firstColWidth;
  zoneCols.forEach(zone => {
    doc.rect(currentX, currentY, zoneColWidth, 20).stroke();
    doc.text(zone, currentX + 2, currentY + 5, {
      width: zoneColWidth - 4,
      align: 'center'
    });
    currentX += zoneColWidth;
  });
  
  currentY += 20;
  
  // Draw data rows
  doc.fontSize(8).font('Helvetica');
  tableData.forEach((row, rowIdx) => {
    currentX = margin;
    const rowHeight = 22;
    
    // First column - category name
    doc.rect(currentX, currentY, firstColWidth, rowHeight).stroke();
    doc.text(row.category, currentX + 5, currentY + 6, {
      width: firstColWidth - 10,
      align: 'left'
    });
    currentX += firstColWidth;
    
    // Data columns
    row.zones.forEach(count => {
      doc.rect(currentX, currentY, zoneColWidth, rowHeight).stroke();
      doc.text(String(count).padStart(2, '0'), currentX + 2, currentY + 6, {
        width: zoneColWidth - 4,
        align: 'center'
      });
      currentX += zoneColWidth;
    });
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 10;
}

/**
 * Section 5: Fanentanana natao (Events/Animations)
 */
function addSection5_FanentananaNatao(doc, data, margin, pageWidth) {
  const startY = 50;
  
  // Section title
  doc.fontSize(12)
    .font('Helvetica-Bold')
    .text('FANENTANANA NATAO :', margin, startY, {
      width: pageWidth - 2 * margin,
      align: 'center',
      underline: true
    })
    .moveDown(1);
  
  // Get events data
  const eventsData = data.section5?.eventsByZone || getDefaultEventsData();
  
  // Draw events by zone
  drawEventsSection(doc, eventsData, margin, pageWidth);
}

/**
 * Draw events section
 */
function drawEventsSection(doc, eventsData, margin, pageWidth) {
  const pageHeight = doc.page.height;
  
  eventsData.forEach((zoneEvents, idx) => {
    // Check if we need a new page
    if (doc.y > pageHeight - 150) {
      doc.addPage();
      doc.y = 50;
    }
    
    // Zone name as subsection header
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .text(`${zoneEvents.zone} :`, margin, doc.y)
      .moveDown(0.5);
    
    // List events for this zone
    if (zoneEvents.events && zoneEvents.events.length > 0) {
      zoneEvents.events.forEach((event, eventIdx) => {
        // Check if we need a new page for this event
        if (doc.y > pageHeight - 80) {
          doc.addPage();
          doc.y = 50;
        }
        
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .text(`${eventIdx + 1}-Thème : `, margin, doc.y, { continued: true })
          .font('Helvetica')
          .text(`"${event.theme}"`, { continued: false })
          .moveDown(0.3);
        
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Participants : ${event.participants}`, margin, doc.y)
          .moveDown(0.3);
        
        doc.text(`Toerana : ${event.location}`, margin, doc.y)
          .moveDown(0.3);
        
        doc.text(`Daty : ${event.date}`, margin, doc.y)
          .moveDown(0.8);
      });
    } else {
      doc.fontSize(10)
        .font('Helvetica')
        .text('Aucune animation pour cette zone', margin, doc.y)
        .moveDown(1);
    }
    
    doc.moveDown(0.5);
  });
}

/**
 * Get default education data structure
 */
function getDefaultEducationData() {
  return [
    {
      category: 'Fanambeazan a aizana tsy maharitra',
      zones: [
        { male: 0, female: 23 },
        { male: 0, female: 70 },
        { male: 0, female: 14 },
        { male: 0, female: 0 },
        { male: 0, female: 0 },
        { male: 3, female: 78 },
        { male: 0, female: 20 },
        { male: 3, female: 205 }
      ]
    },
    {
      category: 'Fanambeazan a aizana maharitra',
      zones: [
        { male: 0, female: 0 },
        { male: 0, female: 16 },
        { male: 0, female: 0 },
        { male: 0, female: 0 },
        { male: 0, female: 0 },
        { male: 0, female: 15 },
        { male: 0, female: 12 },
        { male: 0, female: 43 }
      ]
    }
  ];
}

/**
 * Get default maternal health data structure
 */
function getDefaultMaternalHealthData() {
  return [
    {
      category: 'Femme ayant passée à la CPN',
      zones: [0, 0, 12, 24, 0, 28, 27, 91]
    },
    {
      category: 'Femme enceintes ayant fait le Test VIH',
      zones: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      category: 'Femme enceintes ayant fait le Test serologique',
      zones: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      category: 'Accouchements',
      zones: [0, 0, 4, 6, 0, 10, 9, 29]
    }
  ];
}

/**
 * Get default events data structure
 */
function getDefaultEventsData() {
  return [
    {
      zone: 'Ampanasina',
      events: [
        {
          theme: 'Rano fisoitro madio',
          participants: 72,
          location: 'CSB Ampanasina',
          date: '21 Oktobra 2024'
        },
        {
          theme: 'Ny maha zava-dehibe ny vaksiny',
          participants: 68,
          location: 'CSB Ampanasina',
          date: '19 Novambra 2024'
        },
        {
          theme: 'Ady amin\'ny fangerena ankalamanjana',
          participants: 54,
          location: 'Communauté Ampanasina',
          date: '15 Desambra 2024'
        }
      ]
    }
  ];
}

/**
 * Get default births data structure
 * Returns data for all 7 standard dispensaries
 */
function getDefaultBirthsData() {
  return [
    {
      category: 'Zaza (12 taona noho midina)',
      zones: [
        { male: 0, female: 0 },  // Ampitsopitsoka
        { male: 0, female: 0 },  // Boeny Aranta
        { male: 0, female: 0 },  // Ankelitaly
        { male: 0, female: 0 },  // Ampanasina
        { male: 0, female: 0 },  // Mananara
        { male: 0, female: 0 },  // Onara
        { male: 0, female: 0 }   // Andamonty
      ]
    },
    {
      category: 'Tanora (13 taona - 30 taona)',
      zones: [
        { male: 0, female: 0 },  // Ampitsopitsoka
        { male: 0, female: 0 },  // Boeny Aranta
        { male: 0, female: 0 },  // Ankelitaly
        { male: 0, female: 0 },  // Ampanasina
        { male: 0, female: 0 },  // Mananara
        { male: 0, female: 0 },  // Onara
        { male: 0, female: 0 }   // Andamonty
      ]
    },
    {
      category: 'Olon-dehibe maherin\'ny 30 taona',
      zones: [
        { male: 0, female: 0 },  // Ampitsopitsoka
        { male: 0, female: 0 },  // Boeny Aranta
        { male: 0, female: 0 },  // Ankelitaly
        { male: 0, female: 0 },  // Ampanasina
        { male: 0, female: 0 },  // Mananara
        { male: 0, female: 0 },  // Onara
        { male: 0, female: 0 }   // Andamonty
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
