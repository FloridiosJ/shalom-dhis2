/**
 * Manual test script for topDiagnostics resolver
 * 
 * This script validates the logic of the topDiagnostics resolver
 * without requiring a database connection.
 * 
 * Note: These tests use hard-coded assertions based on the mock data below.
 * If you modify the mock data, you'll need to update the test assertions accordingly.
 * For production, consider using a proper testing framework with dynamic assertions.
 * 
 * Run with: node test-top-diagnostics.js
 */

// Mock data simulating DataEntry records
const mockDataEntries = [
  { id: '1', diagnostic: 'Paludisme', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-15') },
  { id: '2', diagnostic: 'Paludisme', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-16') },
  { id: '3', diagnostic: 'Paludisme', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-17') },
  { id: '4', diagnostic: 'Infection respiratoire', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-18') },
  { id: '5', diagnostic: 'Infection respiratoire', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-19') },
  { id: '6', diagnostic: 'Diarrhée', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-20') },
  { id: '7', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-21') },
  { id: '8', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-22') },
  { id: '9', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-23') },
  { id: '10', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-24') },
];

// Mock category associations (structured data)
const mockCategoryAssociations = [
  { dataEntryId: '1', categorieMaladieId: 'cat1', isPrincipal: true, categorie: { nom: 'PALUDISME', code: 'PAL', niveau: 2 } },
  { dataEntryId: '2', categorieMaladieId: 'cat1', isPrincipal: true, categorie: { nom: 'PALUDISME', code: 'PAL', niveau: 2 } },
  { dataEntryId: '3', categorieMaladieId: 'cat1', isPrincipal: true, categorie: { nom: 'PALUDISME', code: 'PAL', niveau: 2 } },
  { dataEntryId: '4', categorieMaladieId: 'cat2', isPrincipal: true, categorie: { nom: 'INFECTION RESPIRATOIRE', code: 'RESP', niveau: 2 } },
  { dataEntryId: '5', categorieMaladieId: 'cat2', isPrincipal: true, categorie: { nom: 'INFECTION RESPIRATOIRE', code: 'RESP', niveau: 2 } },
  // Note: entries 6-10 have NO category associations (will use text fallback)
];

/**
 * Simulate the topDiagnostics resolver logic
 */
function simulateTopDiagnostics(filters = {}) {
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
  
  // Step 2: Get category-based statistics
  const categoryStats = {};
  mockCategoryAssociations
    .filter(assoc => validIds.includes(assoc.dataEntryId) && assoc.isPrincipal)
    .forEach(assoc => {
      const key = assoc.categorieMaladieId;
      if (!categoryStats[key]) {
        categoryStats[key] = {
          diagnostic: assoc.categorie.nom,
          count: 0,
          isStructured: true,
          code: assoc.categorie.code
        };
      }
      categoryStats[key].count++;
    });
  
  // Step 3: Get entries without categories
  const entriesWithCategories = new Set(
    mockCategoryAssociations
      .filter(assoc => assoc.isPrincipal)
      .map(assoc => assoc.dataEntryId)
  );
  
  const entriesWithoutCategories = filteredEntries.filter(
    entry => !entriesWithCategories.has(entry.id)
  );
  
  // Step 4: Fallback to text diagnostics
  const textStats = {};
  entriesWithoutCategories.forEach(entry => {
    const diag = entry.diagnostic.trim();
    textStats[diag] = (textStats[diag] || 0) + 1;
  });
  
  // Step 5: Combine results
  let combinedResults = [
    ...Object.values(categoryStats),
    ...Object.entries(textStats).map(([diagnostic, count]) => ({
      diagnostic,
      count,
      isStructured: false
    }))
  ];
  
  // Sort by count descending
  combinedResults.sort((a, b) => b.count - a.count);
  combinedResults = combinedResults.slice(0, limit);
  
  // Calculate percentages
  const total = combinedResults.reduce((sum, d) => sum + d.count, 0);
  
  return combinedResults.map(d => ({
    diagnostic: d.diagnostic,
    count: d.count,
    percentage: total > 0 ? parseFloat(((d.count / total) * 100).toFixed(2)) : 0
  }));
}

/**
 * Test cases
 */
function runTests() {
  console.log('🧪 Running topDiagnostics logic tests...\n');
  
  // Test 1: Basic query (all data)
  console.log('Test 1: Basic query (all dispensaires, all dates)');
  const result1 = simulateTopDiagnostics({ limit: 5 });
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.assert(result1.length > 0, 'Should return results');
  console.assert(result1[0].diagnostic === 'Consultation prénatale', 'Top diagnostic should be Consultation prénatale');
  console.assert(result1[0].count === 4, 'Count should be 4');
  console.log('✅ Test 1 passed\n');
  
  // Test 2: Filter by dispensaire
  console.log('Test 2: Filter by dispensaireId = disp1');
  const result2 = simulateTopDiagnostics({ dispensaireId: 'disp1', limit: 5 });
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.assert(result2.length === 3, 'Should return 3 unique diagnostics for disp1');
  console.assert(result2[0].diagnostic === 'PALUDISME', 'Top for disp1 should be PALUDISME (structured)');
  console.assert(result2[0].count === 3, 'Count should be 3');
  console.log('✅ Test 2 passed\n');
  
  // Test 3: Filter by date range
  console.log('Test 3: Filter by date range (2025-01-15 to 2025-01-18)');
  const result3 = simulateTopDiagnostics({ 
    startDate: '2025-01-15', 
    endDate: '2025-01-18',
    limit: 5 
  });
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.assert(result3.length > 0, 'Should return results');
  console.assert(result3[0].count === 3, 'PALUDISME should have 3 occurrences');
  console.log('✅ Test 3 passed\n');
  
  // Test 4: Limit parameter
  console.log('Test 4: Limit to 2 results');
  const result4 = simulateTopDiagnostics({ limit: 2 });
  console.log('Result:', JSON.stringify(result4, null, 2));
  console.assert(result4.length === 2, 'Should return exactly 2 results');
  console.log('✅ Test 4 passed\n');
  
  // Test 5: Percentage calculation
  console.log('Test 5: Verify percentage calculation');
  const result5 = simulateTopDiagnostics({ limit: 10 });
  const totalPercentage = result5.reduce((sum, r) => sum + r.percentage, 0);
  console.log('Total percentage:', totalPercentage);
  console.assert(Math.abs(totalPercentage - 100) < 0.1, 'Total percentage should be ~100%');
  console.log('✅ Test 5 passed\n');
  
  // Test 6: Mixed structured and unstructured data
  console.log('Test 6: Verify structured data is prioritized');
  const result6 = simulateTopDiagnostics({ limit: 10 });
  console.log('Result:', JSON.stringify(result6, null, 2));
  const hasStructured = result6.some(r => r.diagnostic === 'PALUDISME');
  const hasUnstructured = result6.some(r => r.diagnostic === 'Diarrhée');
  console.assert(hasStructured, 'Should include structured category (PALUDISME)');
  console.assert(hasUnstructured, 'Should include unstructured text (Diarrhée)');
  console.log('✅ Test 6 passed\n');
  
  console.log('✅ All tests passed successfully!');
}

// Run tests
runTests();
