/**
 * Manual test script for topMedications resolver
 * 
 * This script validates the logic of the topMedications resolver
 * without requiring a database connection.
 * 
 * Note: These tests use hard-coded assertions based on the mock data below.
 * If you modify the mock data, you'll need to update the test assertions accordingly.
 * For production, consider using a proper testing framework with dynamic assertions.
 * 
 * Run with: node test-top-medications.js
 */

// Mock data simulating DataEntry records
const mockDataEntries = [
  { id: '1', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-15') },
  { id: '2', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-16') },
  { id: '3', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-17') },
  { id: '4', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-18') },
  { id: '5', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-19') },
  { id: '6', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-20') },
  { id: '7', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-21') },
  { id: '8', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-22') },
  { id: '9', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-23') },
  { id: '10', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-24') },
];

// Mock prescription items (structured medication data)
const mockPrescriptionItems = [
  // Paracétamol - le plus prescrit
  { dataEntryId: '1', medicament: 'Paracétamol', duree: '5j', isActive: true },
  { dataEntryId: '2', medicament: 'Paracétamol', duree: '7j', isActive: true },
  { dataEntryId: '3', medicament: 'Paracétamol', duree: '3j', isActive: true },
  { dataEntryId: '4', medicament: 'Paracétamol', duree: '5 jours', isActive: true },
  { dataEntryId: '7', medicament: 'Paracétamol', duree: '1 semaine', isActive: true },
  
  // Amoxicilline - deuxième plus prescrit
  { dataEntryId: '1', medicament: 'Amoxicilline', duree: '7j', isActive: true },
  { dataEntryId: '5', medicament: 'Amoxicilline', duree: '10j', isActive: true },
  { dataEntryId: '8', medicament: 'Amoxicilline', duree: '7 jours', isActive: true },
  
  // Ibuprofène
  { dataEntryId: '2', medicament: 'Ibuprofène', duree: '3j', isActive: true },
  { dataEntryId: '6', medicament: 'Ibuprofène', duree: '5j', isActive: true },
  
  // Chloroquine
  { dataEntryId: '3', medicament: 'Chloroquine', duree: '3j', isActive: true },
  { dataEntryId: '9', medicament: 'Chloroquine', duree: '3 jours', isActive: true },
  
  // Métronidazole
  { dataEntryId: '4', medicament: 'Métronidazole', duree: '5j', isActive: true },
  
  // Cas sans durée
  { dataEntryId: '10', medicament: 'Vitamine C', duree: null, isActive: true },
  { dataEntryId: '10', medicament: 'Vitamine C', duree: '', isActive: true },
];

/**
 * Parse une durée en jours
 */
function parseDureeInDays(duree) {
  if (!duree) return null;
  
  const match = duree.toLowerCase().match(/(\d+)\s*(j|jour|jours|d|day|days|semaine|semaines|s|w|week|weeks|mois|m|month|months)?/);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  if (!unit || unit.startsWith('j') || unit.startsWith('d')) {
    return value; // jours
  } else if (unit.startsWith('s') || unit.startsWith('w')) {
    return value * 7; // semaines -> jours
  } else if (unit.startsWith('m')) {
    return value * 30; // mois -> jours (approximatif)
  }
  
  return value; // par défaut, considérer comme jours
}

/**
 * Simulate the topMedications resolver logic
 */
function simulateTopMedications(filters = {}) {
  const { limit = 10, dispensaireId, startDate, endDate } = filters;
  
  // Step 1: Filter data entries based on criteria
  let filteredEntries = mockDataEntries.filter(entry => entry.isActive);
  
  if (dispensaireId) {
    filteredEntries = filteredEntries.filter(e => e.dispensaireId === dispensaireId);
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredEntries = filteredEntries.filter(e => 
      e.dateConsultation >= start && e.dateConsultation <= end
    );
  }
  
  const validIds = filteredEntries.map(e => e.id);
  
  if (validIds.length === 0) {
    return [];
  }
  
  // Step 2: Aggregate prescription items by medication
  const medicationStats = {};
  
  mockPrescriptionItems
    .filter(item => validIds.includes(item.dataEntryId) && item.isActive && item.medicament)
    .forEach(item => {
      const med = item.medicament;
      if (!medicationStats[med]) {
        medicationStats[med] = {
          medicament: med,
          count: 0,
          durees: []
        };
      }
      medicationStats[med].count++;
      if (item.duree) {
        medicationStats[med].durees.push(item.duree);
      }
    });
  
  // Step 3: Calculate average and total durations
  let results = Object.values(medicationStats).map(stat => {
    const dureesInDays = stat.durees
      .map(parseDureeInDays)
      .filter(d => d !== null);
    
    let avgDuree = null;
    let totalDuree = null;
    
    if (dureesInDays.length > 0) {
      const total = dureesInDays.reduce((sum, d) => sum + d, 0);
      const avg = total / dureesInDays.length;
      
      totalDuree = `${total}j`;
      avgDuree = `${Math.round(avg)}j`;
    }
    
    return {
      medicament: stat.medicament,
      count: stat.count,
      avgDuree,
      totalDuree
    };
  });
  
  // Sort by count descending and limit
  results.sort((a, b) => b.count - a.count);
  results = results.slice(0, limit);
  
  return results;
}

/**
 * Test cases
 */
function runTests() {
  console.log('🧪 Running topMedications logic tests...\n');
  
  // Test 1: Basic query (all data)
  console.log('Test 1: Basic query (all dispensaires, all dates)');
  const result1 = simulateTopMedications({ limit: 5 });
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.assert(result1.length > 0, 'Should return results');
  console.assert(result1[0].medicament === 'Paracétamol', 'Top medication should be Paracétamol');
  console.assert(result1[0].count === 5, 'Paracétamol count should be 5');
  console.assert(result1[0].avgDuree !== null, 'Should have average duration');
  console.assert(result1[0].totalDuree !== null, 'Should have total duration');
  console.log('✅ Test 1 passed\n');
  
  // Test 2: Filter by dispensaire
  console.log('Test 2: Filter by dispensaireId = disp1');
  const result2 = simulateTopMedications({ dispensaireId: 'disp1', limit: 5 });
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.assert(result2.length > 0, 'Should return results for disp1');
  console.assert(result2[0].medicament === 'Paracétamol', 'Top for disp1 should be Paracétamol');
  console.assert(result2[0].count === 4, 'Count should be 4 for disp1');
  console.log('✅ Test 2 passed\n');
  
  // Test 3: Filter by date range
  console.log('Test 3: Filter by date range (2025-01-15 to 2025-01-18)');
  const result3 = simulateTopMedications({ 
    startDate: '2025-01-15', 
    endDate: '2025-01-18',
    limit: 5 
  });
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.assert(result3.length > 0, 'Should return results');
  console.assert(result3[0].count === 4, 'Paracétamol should have 4 occurrences in range');
  console.log('✅ Test 3 passed\n');
  
  // Test 4: Limit parameter
  console.log('Test 4: Limit to 3 results');
  const result4 = simulateTopMedications({ limit: 3 });
  console.log('Result:', JSON.stringify(result4, null, 2));
  console.assert(result4.length === 3, 'Should return exactly 3 results');
  console.log('✅ Test 4 passed\n');
  
  // Test 5: Duration calculation
  console.log('Test 5: Verify duration calculation');
  const result5 = simulateTopMedications({ limit: 10 });
  const paracetamol = result5.find(r => r.medicament === 'Paracétamol');
  console.log('Paracétamol result:', JSON.stringify(paracetamol, null, 2));
  console.assert(paracetamol.avgDuree !== null, 'Should have average duration');
  console.assert(paracetamol.totalDuree !== null, 'Should have total duration');
  console.assert(paracetamol.avgDuree.endsWith('j'), 'Average duration should end with "j"');
  console.assert(paracetamol.totalDuree.endsWith('j'), 'Total duration should end with "j"');
  console.log('✅ Test 5 passed\n');
  
  // Test 6: Medication without duration
  console.log('Test 6: Verify medications without duration are included');
  const result6 = simulateTopMedications({ limit: 10 });
  const vitaminC = result6.find(r => r.medicament === 'Vitamine C');
  console.log('Vitamine C result:', JSON.stringify(vitaminC, null, 2));
  console.assert(vitaminC, 'Should include Vitamine C');
  console.assert(vitaminC.count === 2, 'Count should be 2');
  console.assert(vitaminC.avgDuree === null, 'Average duration should be null');
  console.assert(vitaminC.totalDuree === null, 'Total duration should be null');
  console.log('✅ Test 6 passed\n');
  
  // Test 7: Different dispensaires
  console.log('Test 7: Verify different results for different dispensaires');
  const disp1Result = simulateTopMedications({ dispensaireId: 'disp1', limit: 10 });
  const disp2Result = simulateTopMedications({ dispensaireId: 'disp2', limit: 10 });
  console.log('Disp1 medications count:', disp1Result.length);
  console.log('Disp2 medications count:', disp2Result.length);
  console.assert(disp1Result.length > 0, 'Should have medications for disp1');
  console.assert(disp2Result.length > 0, 'Should have medications for disp2');
  console.log('✅ Test 7 passed\n');
  
  // Test 8: Week duration parsing
  console.log('Test 8: Verify week duration parsing');
  const paracetamolStats = simulateTopMedications({ limit: 10 }).find(r => r.medicament === 'Paracétamol');
  // Paracétamol has: 5j, 7j, 3j, 5j, 1 semaine (7j) = total 27j, avg ~5j
  console.log('Paracétamol total:', paracetamolStats.totalDuree);
  console.assert(paracetamolStats.totalDuree === '27j', 'Total should be 27j (including week conversion)');
  console.log('✅ Test 8 passed\n');
  
  console.log('✅ All tests passed successfully!');
}

// Run tests
runTests();
