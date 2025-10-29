/**
 * Generate sample exports for manual verification
 */
import { generateCSV } from './src/utils/export/csvGenerator.js';
import { generatePDF } from './src/utils/export/pdfGenerator.js';
import fs from 'fs';

async function generateSamples() {
  console.log('📦 Generating sample exports...\n');

  // More comprehensive test data
  const testData = [
    {
      id: '1',
      dateConsultation: new Date('2025-01-15T10:30:00'),
      patientName: 'Jean Dupont',
      numeroPatient: 'P001',
      typeConsultation: 'Consultation générale',
      diagnostic: 'Grippe saisonnière avec fièvre modérée',
      prescription: 'Paracétamol 500mg - 3x par jour pendant 5 jours',
      dispensaireName: 'Dispensaire Central',
      agentName: 'Dr. Marie Rakotozafy',
      status: 'termine'
    },
    {
      id: '2',
      dateConsultation: new Date('2025-01-16T14:00:00'),
      patientName: 'Sophie Martin',
      numeroPatient: 'P002',
      typeConsultation: 'Suivi',
      diagnostic: 'Hypertension artérielle - contrôle mensuel',
      prescription: 'Amlodipine 5mg - 1x par jour le matin',
      dispensaireName: 'Dispensaire Central',
      agentName: 'Dr. Pierre Andriamanitra',
      status: 'termine'
    },
    {
      id: '3',
      dateConsultation: new Date('2025-01-17T09:15:00'),
      patientName: 'Rakoto Andrianjaka',
      numeroPatient: 'P003',
      typeConsultation: 'Urgence',
      diagnostic: 'Plaie superficielle au bras gauche',
      prescription: 'Désinfection locale + Amoxicilline 500mg - 3x/jour pendant 7 jours',
      dispensaireName: 'Dispensaire Nord',
      agentName: 'Infirmière Hanta Rasoanaivo',
      status: 'suivi_requis'
    },
    {
      id: '4',
      dateConsultation: new Date('2025-01-18T11:45:00'),
      patientName: 'Nivo Randrianarisoa',
      numeroPatient: 'P004',
      typeConsultation: 'Vaccination',
      diagnostic: 'Vaccination BCG - nouveau-né',
      prescription: '',
      dispensaireName: 'Dispensaire Central',
      agentName: 'Sage-femme Lalao Rakotonirina',
      status: 'termine'
    },
    {
      id: '5',
      dateConsultation: new Date('2025-01-19T16:20:00'),
      patientName: 'Tsiry Raharison',
      numeroPatient: 'P005',
      typeConsultation: 'Consultation générale',
      diagnostic: 'Infection respiratoire haute',
      prescription: 'Sirop antitussif + Amoxicilline 500mg - 3x/jour pendant 5 jours',
      dispensaireName: 'Dispensaire Sud',
      agentName: 'Dr. Fidy Ramaroson',
      status: 'en_cours'
    }
  ];

  const filters = {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    dispensaireId: 'disp-001'
  };

  try {
    // Generate CSV
    console.log('📄 Generating CSV sample...');
    const csvResult = await generateCSV(testData, filters);
    console.log(`✅ CSV saved: ${csvResult.fileName}`);
    
    // Read and display CSV content
    const csvContent = fs.readFileSync(csvResult.filePath, 'utf-8');
    console.log('\n--- CSV Content Preview ---');
    console.log(csvContent.substring(0, 500) + '...\n');

    // Generate PDF
    console.log('📄 Generating PDF sample...');
    const pdfResult = await generatePDF(testData, filters);
    console.log(`✅ PDF saved: ${pdfResult.fileName}`);
    console.log(`   Size: ${fs.statSync(pdfResult.filePath).size} bytes\n`);

    console.log('✅ Sample files generated successfully!');
    console.log(`   CSV: ${csvResult.filePath}`);
    console.log(`   PDF: ${pdfResult.filePath}`);
    console.log('\n💡 Files will be auto-deleted after 24 hours by the cleanup process.');

  } catch (error) {
    console.error('❌ Error generating samples:', error);
    process.exit(1);
  }
}

generateSamples();
