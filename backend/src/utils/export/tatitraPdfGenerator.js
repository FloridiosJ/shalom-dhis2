/**
 * PDF Generator for Tatitra Quarterly Reports
 * Generates a comprehensive PDF report matching the validated model
 * Uses pdfMake library for PDF generation
 */

import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load fonts from pdfmake's vfs_fonts
const pdfFonts = require('pdfmake/build/vfs_fonts.js');

// Define fonts for pdfMake using virtual file system
const fonts = {
  Roboto: {
    normal: Buffer.from(pdfFonts['Roboto-Regular.ttf'], 'base64'),
    bold: Buffer.from(pdfFonts['Roboto-Medium.ttf'], 'base64'),
    italics: Buffer.from(pdfFonts['Roboto-Italic.ttf'], 'base64'),
    bolditalics: Buffer.from(pdfFonts['Roboto-MediumItalic.ttf'], 'base64')
  }
};

/**
 * Generate header section for the PDF
 */
function generateHeader(data) {
  const { period, zones } = data;
  
  return [
    {
      text: 'TATITRA FANARAKETANA NY ASA',
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    {
      text: `Taona: ${period.year} - Taonjato: ${period.quarter}`,
      style: 'subheader',
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    {
      text: `Daty: ${period.startDate} - ${period.endDate}`,
      style: 'dateRange',
      alignment: 'center',
      margin: [0, 0, 0, 10]
    },
    {
      text: `Toerana: ${zones ? zones.join(', ') : 'Tous les zones'}`,
      style: 'zones',
      alignment: 'center',
      margin: [0, 0, 0, 15]
    }
  ];
}

/**
 * Generate Section 1: MAHAKASIKA NY ASA FITORIANA
 * Includes birth statistics by age group and zone
 */
function generateSection1(data) {
  const { section1, zones } = data;
  
  if (!section1) return [];

  const content = [
    {
      text: 'I. MAHAKASIKA NY ASA FITORIANA',
      style: 'sectionTitle',
      margin: [0, 10, 0, 10],
      pageBreak: 'before'
    }
  ];

  // Prayer meetings and visitors
  if (section1.prayerMeetings !== undefined || section1.visitorsReceived !== undefined) {
    content.push({
      text: `Fivoriana fandalovana: ${section1.prayerMeetings || 0}`,
      margin: [0, 5, 0, 5]
    });
    content.push({
      text: `Vahiny voaray: ${section1.visitorsReceived || 0}`,
      margin: [0, 0, 0, 10]
    });
  }

  // Birth statistics table
  if (section1.birthsByZone && section1.birthsByZone.length > 0) {
    const tableBody = [];
    
    // Header row - just zones
    const headerRow = [{ text: 'Toerana :', style: 'tableHeader', alignment: 'left' }];
    zones.forEach(zone => {
      headerRow.push({ text: zone, style: 'tableHeader', alignment: 'center' });
      headerRow.push({ text: '', style: 'tableHeader' });
    });
    headerRow.push({ text: 'Fitambarany', style: 'tableHeader', alignment: 'center' });
    headerRow.push({ text: '', style: 'tableHeader' });
    tableBody.push(headerRow);

    // Sub-header row for Lahy/Vavy
    const subHeaderRow = [{ text: '', style: 'tableHeader' }];
    for (let i = 0; i < zones.length + 1; i++) {
      subHeaderRow.push({ text: 'Lahy', style: 'tableHeader', alignment: 'center' });
      subHeaderRow.push({ text: 'Vavy', style: 'tableHeader', alignment: 'center' });
    }
    tableBody.push(subHeaderRow);

    // Data rows for each age category
    section1.birthsByZone.forEach(category => {
      const row = [{ text: category.category, alignment: 'left' }];
      let totalMale = 0;
      let totalFemale = 0;

      category.zones.forEach(zoneData => {
        const male = zoneData.male || 0;
        const female = zoneData.female || 0;
        totalMale += male;
        totalFemale += female;
        row.push(
          { text: male.toString().padStart(2, '0'), alignment: 'center' },
          { text: female.toString().padStart(2, '0'), alignment: 'center' }
        );
      });

      // Add total column
      row.push(
        { text: totalMale.toString().padStart(2, '0'), alignment: 'center', bold: true },
        { text: totalFemale.toString().padStart(2, '0'), alignment: 'center', bold: true }
      );

      tableBody.push(row);
    });

    // Non-Christians row if available
    if (section1.nonChristiansByZone) {
      const row = [{ text: section1.nonChristiansByZone.category || 'Tsy Kristianina', alignment: 'left' }];
      let totalMale = 0;
      let totalFemale = 0;

      section1.nonChristiansByZone.zones.forEach(zoneData => {
        const male = zoneData.male || 0;
        const female = zoneData.female || 0;
        totalMale += male;
        totalFemale += female;
        row.push(
          { text: male.toString().padStart(2, '0'), alignment: 'center' },
          { text: female.toString().padStart(2, '0'), alignment: 'center' }
        );
      });

      row.push(
        { text: totalMale.toString().padStart(2, '0'), alignment: 'center', bold: true },
        { text: totalFemale.toString().padStart(2, '0'), alignment: 'center', bold: true }
      );

      tableBody.push(row);
    }

    content.push({
      table: {
        headerRows: 2,
        widths: [120, ...Array((zones.length + 1) * 2).fill('*')],
        body: tableBody
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000'
      },
      margin: [0, 0, 0, 15]
    });
  }

  return content;
}

/**
 * Generate Section 2: MAHAKASIKA NY ASA FITSABOANA
 * Includes medical consultation statistics and disease data
 */
function generateSection2(data) {
  const { section2, zones } = data;
  
  if (!section2) return [];

  const content = [
    {
      text: 'II. MAHAKASIKA NY ASA FITSABOANA',
      style: 'sectionTitle',
      margin: [0, 15, 0, 10],
      pageBreak: 'before'
    }
  ];

  // Consultants and consultations table
  if (section2.consultantsByZone && section2.consultantsByZone.length > 0) {
    const tableBody = [];
    
    // Header row - same structure as Section 1
    const headerRow = [{ text: 'Toerana :', style: 'tableHeader', alignment: 'left' }];
    zones.forEach(zone => {
      headerRow.push({ text: zone, style: 'tableHeader', alignment: 'center' });
      headerRow.push({ text: '', style: 'tableHeader' });  // Empty cell for visual spacing
    });
    headerRow.push({ text: 'Fitambarany', style: 'tableHeader', alignment: 'center' });
    headerRow.push({ text: '', style: 'tableHeader' });  // Empty cell for visual spacing
    tableBody.push(headerRow);

    // Sub-header row - "Hasila" label and Lahy/Vavy pairs
    const subHeaderRow = [{ text: 'Hasila', style: 'tableHeader', alignment: 'left' }];
    for (let i = 0; i < zones.length + 1; i++) {
      subHeaderRow.push({ text: 'Lahy', style: 'tableHeader', alignment: 'center' });
      subHeaderRow.push({ text: 'Vavy', style: 'tableHeader', alignment: 'center' });
    }
    tableBody.push(subHeaderRow);

    // Consultants row - add two cells per zone (currently only total, put in first cell)
    const consultantsRow = [{ text: 'Consultant', alignment: 'left' }];
    for (let i = 0; i < zones.length; i++) {
      const zoneData = section2.consultantsByZone[i] || { consultants: 0 };
      consultantsRow.push({ text: zoneData.consultants.toString(), alignment: 'center' });
      consultantsRow.push({ text: '', alignment: 'center' });  // Empty Vavy cell
    }
    // Add total column (two cells)
    const totalConsultants = section2.consultantsByZone[zones.length] || 
      section2.consultantsByZone[section2.consultantsByZone.length - 1] || 
      { consultants: 0 };
    consultantsRow.push({ text: totalConsultants.consultants.toString(), alignment: 'center', bold: true });
    consultantsRow.push({ text: '', alignment: 'center' });  // Empty Vavy cell
    tableBody.push(consultantsRow);

    // Consultations row - add two cells per zone
    const consultationsRow = [{ text: 'Consultation', alignment: 'left' }];
    for (let i = 0; i < zones.length; i++) {
      const zoneData = section2.consultantsByZone[i] || { consultations: 0 };
      consultationsRow.push({ text: zoneData.consultations.toString(), alignment: 'center' });
      consultationsRow.push({ text: '', alignment: 'center' });  // Empty Vavy cell
    }
    // Add total column (two cells)
    const totalConsultations = section2.consultantsByZone[zones.length] || 
      section2.consultantsByZone[section2.consultantsByZone.length - 1] || 
      { consultations: 0 };
    consultationsRow.push({ text: totalConsultations.consultations.toString(), alignment: 'center', bold: true });
    consultationsRow.push({ text: '', alignment: 'center' });  // Empty Vavy cell
    tableBody.push(consultationsRow);

    content.push({
      table: {
        headerRows: 2,
        widths: [120, ...Array((zones.length + 1) * 2).fill('*')],
        body: tableBody
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000'
      },
      margin: [0, 0, 0, 15]
    });
  }

  // Diseases by zone table
  if (section2.diseasesByZone && section2.diseasesByZone.length > 0) {
    content.push({
      text: 'Diagnostics / Affections',
      style: 'subsectionTitle',
      margin: [0, 10, 0, 5]
    });

    const tableBody = [];
    
    // Header row
    const headerRow = [
      { text: 'Areti-mifindra sy ny Aretina hafa', style: 'tableHeader', alignment: 'left' }
    ];
    zones.forEach(zone => {
      headerRow.push({ text: zone, style: 'tableHeader', alignment: 'center' });
    });
    headerRow.push({ text: 'Fitambarany', style: 'tableHeader', alignment: 'center' });
    tableBody.push(headerRow);

    // Disease rows
    section2.diseasesByZone.forEach(disease => {
      const row = [];
      
      // Apply indentation for subcategories
      if (disease.isSubcategory) {
        row.push({ text: '  ' + disease.disease, alignment: 'left', fontSize: 9 });
      } else {
        row.push({ text: disease.disease, alignment: 'left', bold: true });
      }

      // Add zone data - ensure we have exactly zones.length + 1 cells
      for (let i = 0; i < zones.length + 1; i++) {
        const count = disease.zones && disease.zones[i] !== undefined ? disease.zones[i] : 0;
        const isTotal = i === zones.length;
        row.push({ 
          text: count.toString(), 
          alignment: 'center',
          bold: isTotal
        });
      }

      tableBody.push(row);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: [180, ...Array(zones.length + 1).fill('*')],
        body: tableBody
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000'
      },
      margin: [0, 0, 0, 15]
    });
  }

  return content;
}

/**
 * Generate Section 3: Fandriandram-piterahana (Family Planning/Education)
 */
function generateSection3(data) {
  const { section3, zones } = data;
  
  if (!section3 || !section3.educationByZone) return [];

  const content = [
    {
      text: 'III. Fandriandram-piterahana',
      style: 'sectionTitle',
      margin: [0, 15, 0, 10],
      pageBreak: 'before'
    }
  ];

  const tableBody = [];
  
  // Header row
  const headerRow = [{ text: 'Toerana :', style: 'tableHeader', alignment: 'left' }];
  zones.forEach(zone => {
    headerRow.push({ text: zone, style: 'tableHeader', alignment: 'center' });
    headerRow.push({ text: '', style: 'tableHeader' });
  });
  headerRow.push({ text: 'Fitambarany', style: 'tableHeader', alignment: 'center' });
  headerRow.push({ text: '', style: 'tableHeader' });
  tableBody.push(headerRow);

  // Sub-header row
  const subHeaderRow = [{ text: '', style: 'tableHeader' }];
  for (let i = 0; i < zones.length + 1; i++) {
    subHeaderRow.push({ text: 'Lahy', style: 'tableHeader', alignment: 'center' });
    subHeaderRow.push({ text: 'Vavy', style: 'tableHeader', alignment: 'center' });
  }
  tableBody.push(subHeaderRow);

  // Education categories
  section3.educationByZone.forEach(category => {
    const row = [{ text: category.category, alignment: 'left' }];
    
    // Process only the first zones.length elements (excluding total if present)
    const zoneCount = Math.min(category.zones.length, zones.length);
    let totalMale = 0;
    let totalFemale = 0;

    for (let i = 0; i < zoneCount; i++) {
      const zoneData = category.zones[i];
      const male = zoneData.male || 0;
      const female = zoneData.female || 0;
      totalMale += male;
      totalFemale += female;
      row.push(
        { text: male.toString(), alignment: 'center' },
        { text: female.toString(), alignment: 'center' }
      );
    }

    // Add total column (use provided total if available, otherwise calculate)
    if (category.zones.length > zones.length) {
      const totalData = category.zones[zones.length];
      row.push(
        { text: (totalData.male || totalMale).toString(), alignment: 'center', bold: true },
        { text: (totalData.female || totalFemale).toString(), alignment: 'center', bold: true }
      );
    } else {
      row.push(
        { text: totalMale.toString(), alignment: 'center', bold: true },
        { text: totalFemale.toString(), alignment: 'center', bold: true }
      );
    }

    tableBody.push(row);
  });

  content.push({
    table: {
      headerRows: 2,
      widths: [150, ...Array((zones.length + 1) * 2).fill('*')],
      body: tableBody
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000'
    },
    margin: [0, 0, 0, 15]
  });

  return content;
}

/**
 * Generate Section 4: Momba ireo Reny Bevoaka (Maternal Health)
 */
function generateSection4(data) {
  const { section4, zones } = data;
  
  if (!section4 || !section4.maternalHealthByZone) return [];

  const content = [
    {
      text: 'IV. Momba ireo Reny Bevoaka',
      style: 'sectionTitle',
      margin: [0, 15, 0, 10],
      pageBreak: 'before'
    }
  ];

  const tableBody = [];
  
  // Header row
  const headerRow = [
    { text: 'Toerana :', style: 'tableHeader', alignment: 'left' }
  ];
  zones.forEach(zone => {
    headerRow.push({ text: zone, style: 'tableHeader', alignment: 'center' });
  });
  headerRow.push({ text: 'Fitambarany', style: 'tableHeader', alignment: 'center' });
  tableBody.push(headerRow);

  // Maternal health categories
  section4.maternalHealthByZone.forEach(category => {
    const row = [{ text: category.category, alignment: 'left' }];
    let total = 0;

    category.zones.forEach(count => {
      total += count;
      row.push({ text: count.toString(), alignment: 'center' });
    });

    tableBody.push(row);
  });

  content.push({
    table: {
      headerRows: 1,
      widths: [180, ...Array(zones.length + 1).fill('*')],
      body: tableBody
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000'
    },
    margin: [0, 0, 0, 15]
  });

  return content;
}

/**
 * Generate Section 5: Fanentanana natao (Educational Events)
 */
function generateSection5(data) {
  const { section5 } = data;
  
  if (!section5 || !section5.eventsByZone) return [];

  const content = [
    {
      text: 'V. Fanentanana natao',
      style: 'sectionTitle',
      margin: [0, 15, 0, 10],
      pageBreak: 'before'
    }
  ];

  section5.eventsByZone.forEach(zoneEvents => {
    content.push({
      text: zoneEvents.zone,
      style: 'subsectionTitle',
      margin: [0, 10, 0, 5],
      bold: true,
      fontSize: 12
    });

    if (zoneEvents.events && zoneEvents.events.length > 0) {
      zoneEvents.events.forEach(event => {
        content.push({
          text: [
            { text: 'Lohahevitra: ', bold: true },
            { text: event.theme + '\n' },
            { text: 'Mpanatrika: ', bold: true },
            { text: event.participants + ' olona\n' },
            { text: 'Toerana: ', bold: true },
            { text: event.location + '\n' },
            { text: 'Daty: ', bold: true },
            { text: event.date }
          ],
          margin: [10, 5, 0, 10]
        });
      });
    }
  });

  return content;
}

/**
 * Generate Section 6: VAOVAO AMPITAINA (News/Updates)
 */
function generateSection6(data) {
  const { section6 } = data;
  
  if (!section6 || !section6.newsByZone) return [];

  const content = [
    {
      text: 'VI. VAOVAO AMPITAINA',
      style: 'sectionTitle',
      margin: [0, 15, 0, 10],
      pageBreak: 'before',
      decoration: 'underline',
      decorationStyle: 'solid'
    }
  ];

  section6.newsByZone.forEach(zoneNews => {
    content.push({
      text: `${zoneNews.zone.toUpperCase()} :`,
      style: 'subsectionTitle',
      margin: [0, 10, 0, 5],
      bold: true,
      fontSize: 12,
      decoration: 'underline'
    });

    if (zoneNews.updates && zoneNews.updates.length > 0) {
      zoneNews.updates.forEach(update => {
        content.push({
          text: update,
          margin: [10, 3, 0, 5],
          alignment: 'justify'
        });
      });
    }
  });

  return content;
}

/**
 * Main function to generate Tatitra PDF
 * @param {Object} data - Complete report data
 * @param {Object} filters - Quarter and year filters
 * @returns {Promise<Object>} - Generated PDF info (fileName, filePath)
 */
export async function generateTatitraPDF(data, filters) {
  try {
    // Validate input
    if (!data || !filters) {
      throw new Error('Missing required data or filters');
    }

    // Sanitize filters to prevent path injection
    const sanitizedQuarter = filters.quarter.replace(/[^A-Z]/g, '');
    const sanitizedYear = parseInt(filters.year, 10);
    
    if (!sanitizedQuarter || isNaN(sanitizedYear)) {
      throw new Error('Invalid quarter or year format');
    }

    // Generate filename
    const timestamp = Date.now();
    const fileName = `tatitra_${sanitizedQuarter}_${sanitizedYear}_${timestamp}.pdf`;
    const exportsDir = path.join(__dirname, '../../../exports');
    const filePath = path.join(exportsDir, fileName);

    // Ensure exports directory exists
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Build document definition
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      
      header: (currentPage, pageCount) => {
        return {
          text: `Page ${currentPage} / ${pageCount}`,
          alignment: 'right',
          margin: [0, 20, 40, 0],
          fontSize: 9,
          color: '#666666'
        };
      },

      footer: (currentPage, pageCount) => {
        return {
          text: `Tatitra ${filters.quarter} ${filters.year} - CSB Loterana`,
          alignment: 'center',
          margin: [0, 10, 0, 0],
          fontSize: 8,
          color: '#666666'
        };
      },

      content: [
        ...generateHeader(data),
        ...generateSection1(data),
        ...generateSection2(data),
        ...generateSection3(data),
        ...generateSection4(data),
        ...generateSection5(data),
        ...generateSection6(data)
      ],

      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#1a1a1a'
        },
        subheader: {
          fontSize: 14,
          bold: true,
          color: '#333333'
        },
        dateRange: {
          fontSize: 11,
          color: '#666666'
        },
        zones: {
          fontSize: 10,
          italics: true,
          color: '#666666'
        },
        sectionTitle: {
          fontSize: 14,
          bold: true,
          color: '#1a1a1a',
          decoration: 'underline'
        },
        subsectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#333333'
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#1a1a1a',
          fillColor: '#f0f0f0'
        }
      },

      defaultStyle: {
        fontSize: 10,
        font: 'Roboto'
      }
    };

    // Create PDF
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const writeStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      pdfDoc.pipe(writeStream);
      pdfDoc.end();

      writeStream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          success: true
        });
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    });

  } catch (error) {
    console.error('Error generating Tatitra PDF:', error);
    throw error;
  }
}

export default { generateTatitraPDF };
