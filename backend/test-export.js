/**
 * Simple test script for export functionality
 * This tests the CSV and PDF generators without requiring database connection
 */
import { generateCSV } from './src/utils/export/csvGenerator.js';
import { generatePDF } from './src/utils/export/pdfGenerator.js';
import fs from 'fs';

async function testExports() {
  console.log('🧪 Testing Export Functionality...\n');

  // Sample test data
  const testData = [
    {
      id: '1',
      dateConsultation: new Date('2025-01-15'),
      patientName: 'Jean Dupont',
      numeroPatient: 'P001',
      typeConsultation: 'Consultation générale',
      diagnostic: 'Grippe saisonnière',
      prescription: 'Paracétamol 500mg',
      dispensaireName: 'Dispensaire Central',
      agentName: 'Dr. Marie Rakotozafy',
      status: 'termine'
    },
    {
      id: '2',
      dateConsultation: new Date('2025-01-16'),
      patientName: 'Sophie Martin',
      numeroPatient: 'P002',
      typeConsultation: 'Suivi',
      diagnostic: 'Hypertension',
      prescription: 'Amlodipine 5mg',
      dispensaireName: 'Dispensaire Central',
      agentName: 'Dr. Pierre Andriamanitra',
      status: 'termine'
    }
  ];

  const filters = {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    dispensaireId: 'disp-001'
  };

  try {
    // Test CSV generation
    console.log('📄 Testing CSV generation...');
    const csvResult = await generateCSV(testData, filters);
    console.log('✅ CSV generated successfully!');
    console.log(`   File: ${csvResult.fileName}`);
    console.log(`   Path: ${csvResult.filePath}`);
    
    // Verify file exists
    if (fs.existsSync(csvResult.filePath)) {
      const stats = fs.statSync(csvResult.filePath);
      console.log(`   Size: ${stats.size} bytes`);
      console.log('   ✓ File verified\n');
    } else {
      console.log('   ✗ File not found!\n');
    }

    // Test PDF generation
    console.log('📄 Testing PDF generation...');
    const pdfResult = await generatePDF(testData, filters);
    console.log('✅ PDF generated successfully!');
    console.log(`   File: ${pdfResult.fileName}`);
    console.log(`   Path: ${pdfResult.filePath}`);
    
    // Verify file exists
    if (fs.existsSync(pdfResult.filePath)) {
      const stats = fs.statSync(pdfResult.filePath);
      console.log(`   Size: ${stats.size} bytes`);
      console.log('   ✓ File verified\n');
    } else {
      console.log('   ✗ File not found!\n');
    }

    // Clean up test files
    console.log('🧹 Cleaning up test files...');
    if (fs.existsSync(csvResult.filePath)) {
      fs.unlinkSync(csvResult.filePath);
      console.log('   ✓ CSV file deleted');
    }
    if (fs.existsSync(pdfResult.filePath)) {
      fs.unlinkSync(pdfResult.filePath);
      console.log('   ✓ PDF file deleted');
    }

    console.log('\n✅ All tests passed!');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    return false;
  }
}

// Run tests
testExports()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
