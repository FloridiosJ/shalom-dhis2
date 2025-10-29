import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate CSV file from report data
 * @param {Array} data - Array of report data objects
 * @param {Object} filters - Filters applied to the report
 * @returns {Promise<Object>} - { filePath, fileName }
 */
export async function generateCSV(data, filters) {
  try {
    // Define CSV fields based on data structure
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Date Consultation', value: 'dateConsultation' },
      { label: 'Patient', value: 'patientName' },
      { label: 'Type Consultation', value: 'typeConsultation' },
      { label: 'Diagnostic', value: 'diagnostic' },
      { label: 'Prescription', value: 'prescription' },
      { label: 'Dispensaire', value: 'dispensaireName' },
      { label: 'Agent', value: 'agentName' },
      { label: 'Status', value: 'status' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `report_${timestamp}.csv`;
    const exportsDir = path.join(__dirname, '../../../exports');
    const filePath = path.join(exportsDir, fileName);

    // Ensure exports directory exists
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Write CSV file
    fs.writeFileSync(filePath, csv);

    return {
      filePath,
      fileName,
      fullPath: filePath
    };
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new Error(`Failed to generate CSV: ${error.message}`);
  }
}

/**
 * Clean up old export files (older than 24 hours)
 */
export function cleanupOldFiles() {
  try {
    const exportsDir = path.join(__dirname, '../../../exports');
    
    if (!fs.existsSync(exportsDir)) {
      return;
    }

    const files = fs.readdirSync(exportsDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    files.forEach(file => {
      if (file === '.gitignore') return;
      
      const filePath = path.join(exportsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old export file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
}
